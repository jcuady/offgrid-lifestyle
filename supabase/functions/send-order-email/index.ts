import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeadersFor } from "../_shared/cors.ts";
import { formatPhp, orderReceiptEmail, orderUpdateEmail } from "../_shared/emailTemplates.ts";
import { sendViaResend } from "../_shared/resend.ts";

const ORDER_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const RECEIPT_EVENTS = new Set(["order_receipt_retail", "order_receipt_custom"]);
const UPDATE_EVENTS = new Set([
  "payment_confirmed",
  "quote_ready",
  "shipped",
  "delivered",
]);

type OrderEvent =
  | "order_receipt_retail"
  | "order_receipt_custom"
  | "payment_confirmed"
  | "quote_ready"
  | "shipped"
  | "delivered";

type OrderRow = {
  id: string;
  order_type: string;
  status: string;
  payment_status: string;
  customer_email: string | null;
  customer_name: string | null;
  total_centavos: number | null;
  line_items: unknown;
  custom_payload: Record<string, unknown> | null;
  created_at: string;
};

const UPDATE_COPY: Record<
  Exclude<OrderEvent, "order_receipt_retail" | "order_receipt_custom">,
  { title: string; message: string }
> = {
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

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await userClient.auth.getUser(token);
    const authUser = authData.user ?? null;
    const role = authUser?.app_metadata?.portal_role as string | undefined;
    const isStaffOrAdmin = role === "admin" || role === "staff";

    const { data: order, error: orderErr } = await adminClient
      .from("og_orders")
      .select(
        "id, order_type, status, payment_status, customer_email, customer_name, total_centavos, line_items, custom_payload, created_at",
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
    const payload = row.custom_payload ?? {};

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

    if (!orderEmail) {
      return new Response(JSON.stringify({ error: "Order has no customer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerName = row.customer_name ?? (payload.contactName as string) ?? "there";

    let mail: { subject: string; html: string; text: string };

    if (event === "order_receipt_retail") {
      mail = orderReceiptEmail({
        orderId,
        orderType: "retail",
        customerName,
        siteUrl,
        totalCentavos: row.total_centavos,
        lineItems: (row.line_items as { name?: string; quantity?: number; size?: string; color?: string }[]) ?? [],
      });
    } else if (event === "order_receipt_custom") {
      mail = orderReceiptEmail({
        orderId,
        orderType: "custom",
        customerName,
        siteUrl,
        totalCentavos: row.total_centavos,
        teamOrOrg: (payload.teamOrOrg as string) ?? "",
        quantity: (payload.quantity as number) ?? undefined,
      });
    } else {
      const copy = UPDATE_COPY[event as keyof typeof UPDATE_COPY];
      let extraHtml = "";
      if (event === "quote_ready") {
        const officialTotal = payload.officialTotal as { amount?: number } | null;
        const officialDeposit = payload.officialDeposit as { amount?: number } | null;
        const notes = (payload.quoteCustomerNotes as string) ?? "";
        if (officialTotal?.amount) {
          extraHtml += `<p style="margin-top:16px;font-size:16px;font-weight:800;">Total: ${formatPhp(Math.round(officialTotal.amount * 100))}</p>`;
        }
        if (officialDeposit?.amount) {
          extraHtml += `<p style="color:#4a4a4a;font-size:14px;">Deposit due: ${formatPhp(Math.round(officialDeposit.amount * 100))}</p>`;
        }
        if (notes.trim()) {
          extraHtml += `<p style="margin-top:12px;padding:14px 16px;background:#f5f0e6;border-radius:12px;font-size:14px;color:#4a4a4a;white-space:pre-wrap;">${escapeHtml(notes.trim())}</p>`;
        }
      }
      mail = orderUpdateEmail({
        orderId,
        customerName,
        title: copy.title,
        message: copy.message,
        siteUrl,
        extraHtml,
      });
    }

    const result = await sendViaResend({
      to: orderEmail,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
