import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeadersFor } from "../_shared/cors.ts";
import { orderReceiptEmail, orderUpdateEmail, paymentReceiptEmail } from "../_shared/emailTemplates.ts";
import { buildOrderEmailContextFromRow, escapeHtml } from "../_shared/orderEmail.ts";
import { sendViaResend } from "../_shared/resend.ts";

const ORDER_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const RECEIPT_EVENTS = new Set(["order_receipt_retail", "order_receipt_custom"]);
const UPDATE_EVENTS = new Set([
  "order_confirmed",
  "in_production",
  "payment_confirmed",
  "quote_ready",
  "shipped",
  "delivered",
]);

type OrderEvent =
  | "order_receipt_retail"
  | "order_receipt_custom"
  | "order_confirmed"
  | "in_production"
  | "payment_confirmed"
  | "quote_ready"
  | "shipped"
  | "delivered";

type OrderRow = {
  id: string;
  order_type: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  customer_email: string | null;
  customer_name: string | null;
  total_centavos: number | null;
  subtotal_centavos: number | null;
  shipping_centavos: number | null;
  tax_centavos: number | null;
  line_items: unknown;
  shipping_info: unknown;
  custom_payload: Record<string, unknown> | null;
  created_at: string;
};

const UPDATE_COPY: Record<
  Exclude<OrderEvent, "order_receipt_retail" | "order_receipt_custom">,
  { title: string; message: string }
> = {
  order_confirmed: {
    title: "Order confirmed",
    message: "Your order is confirmed and queued for processing.",
  },
  in_production: {
    title: "Order in production",
    message: "Your order is now in production. We'll notify you when it ships.",
  },
  payment_confirmed: {
    title: "Payment confirmed",
    message: "We received your payment. Production will begin soon.",
  },
  quote_ready: {
    title: "Your custom quote is ready",
    message: "Review the official quote and deposit details in your account.",
  },
  shipped: {
    title: "Order shipped",
    message: "Your order is on the way. Track progress in My orders.",
  },
  delivered: {
    title: "Order delivered",
    message: "Your order was delivered. Thank you for choosing OFF GRID® Lifestyle.",
  },
};

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { event, order_id: orderId, email: requestEmail } = await req.json();
    if (
      typeof event !== "string" ||
      typeof orderId !== "string" ||
      !ORDER_ID_RE.test(orderId) ||
      (!RECEIPT_EVENTS.has(event) && !UPDATE_EVENTS.has(event))
    ) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const siteUrl = (Deno.env.get("SITE_URL") ?? "https://www.oglifestyleph.com").replace(/\/$/, "");
    const token = authHeader.replace("Bearer ", "");
    const isServiceRole = token === serviceRoleKey || getJwtRole(token) === "service_role";

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let isStaffOrAdmin = isServiceRole;
    if (!isServiceRole) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: authData } = await userClient.auth.getUser(token);
      const role = authData.user?.app_metadata?.portal_role as string | undefined;
      isStaffOrAdmin = role === "admin" || role === "staff";
    }

    const { data: order, error: orderErr } = await adminClient
      .from("og_orders")
      .select(
        "id, order_type, status, payment_status, payment_method, customer_email, customer_name, total_centavos, subtotal_centavos, shipping_centavos, tax_centavos, line_items, shipping_info, custom_payload, created_at",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const row = order as OrderRow;
    const orderEmail = (row.customer_email ?? "").trim().toLowerCase();

    if (RECEIPT_EVENTS.has(event)) {
      const orderAgeMs = Date.now() - new Date(row.created_at).getTime();
      const normalizedRequestEmail =
        typeof requestEmail === "string" ? requestEmail.trim().toLowerCase() : orderEmail;

      if (!normalizedRequestEmail || normalizedRequestEmail !== orderEmail) {
        return new Response(JSON.stringify({ error: "Email does not match order" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (orderAgeMs < 0 || orderAgeMs > 30 * 60 * 1000) {
        return new Response(JSON.stringify({ error: "Receipt window expired" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (event === "order_receipt_retail" && row.order_type !== "retail") {
        return new Response(JSON.stringify({ error: "Invalid order type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (event === "order_receipt_custom" && row.order_type !== "custom") {
        return new Response(JSON.stringify({ error: "Invalid order type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (!isStaffOrAdmin) {
      return new Response(JSON.stringify({ error: "Staff access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!orderEmail || orderEmail.endsWith("@offgrid.local")) {
      return new Response(JSON.stringify({ error: "Order has no customer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Dedup: one email per (order, event, payment_status) — webhook + sync + staff all share this.
    const dedupePaymentStatus =
      event === "payment_confirmed"
        ? row.payment_status || ""
        : RECEIPT_EVENTS.has(event)
          ? "placed"
          : "";
    const shouldDedupe = event === "payment_confirmed" || RECEIPT_EVENTS.has(event);
    if (shouldDedupe) {
      const { error: claimErr } = await adminClient.from("og_order_email_log").insert({
        order_id: orderId,
        event,
        payment_status: dedupePaymentStatus,
      });

      if (claimErr?.code === "23505") {
        return new Response(JSON.stringify({ ok: true, duplicate: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (claimErr) {
        console.error("og_order_email_log claim", claimErr);
      }
    }

    const ctx = buildOrderEmailContextFromRow(row);
    let mail: { subject: string; html: string; text: string };

    if (event === "order_receipt_retail" || event === "order_receipt_custom") {
      mail = orderReceiptEmail({ ...ctx, siteUrl });
    } else if (event === "payment_confirmed") {
      mail = paymentReceiptEmail({ ...ctx, siteUrl });
    } else {
      const copy = UPDATE_COPY[event as keyof typeof UPDATE_COPY];
      let extraHtml = "";
      if (event === "quote_ready" && ctx.quoteNotes?.trim()) {
        extraHtml = `<p style="margin-top:12px;padding:14px 16px;background:#F1F1F1;border-radius:8px;font-size:14px;color:#6A6A6A;white-space:pre-wrap;">${escapeHtml(ctx.quoteNotes.trim())}</p>`;
      }
      mail = orderUpdateEmail({
        ctx,
        title: copy.title,
        message: copy.message,
        siteUrl,
        extraHtml,
      });
    }

    try {
      const result = await sendViaResend({
        to: orderEmail,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });

      return new Response(JSON.stringify({ ok: true, id: result.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (sendErr) {
      if (shouldDedupe) {
        await adminClient
          .from("og_order_email_log")
          .delete()
          .eq("order_id", orderId)
          .eq("event", event)
          .eq("payment_status", dedupePaymentStatus);
      }
      throw sendErr;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getJwtRole(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
