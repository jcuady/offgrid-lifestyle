import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { isServiceRoleBearer } from "../_shared/serviceRoleAuth.ts";

const ORDER_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_ALERT_TYPES = new Set(["new_retail_order", "new_custom_order", "payment_proof"]);

function safeNavigationUrl(raw: unknown, fallback = "/"): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://") || trimmed.toLowerCase().startsWith("javascript:")) return fallback;
  try {
    const parsed = new URL(trimmed, "https://offgrid.local");
    if (parsed.origin !== "https://offgrid.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

function corsHeadersFor(req: Request): Record<string, string> {
  const defaults =
    "https://www.oglifestyleph.com,https://oglifestyleph.com,https://offgrid-lifestyle.vercel.app,https://offgrid-lifestyle-jcuadys-projects.vercel.app,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000";
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? defaults)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = allowed.includes(origin) ? origin : (allowed[0] ?? "*");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidEmail = Deno.env.get("VAPID_EMAIL") ?? "push@offgrid.ph";

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey);

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, body, url: clickUrl, user_ids, operational_alert } = await req.json();
    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeTitle = String(title).trim().slice(0, 120);
    const safeBody = String(body).trim().slice(0, 500);
    const safeUrl = safeNavigationUrl(clickUrl);

    const hasTargetedUsers = user_ids && Array.isArray(user_ids) && user_ids.length > 0;
    const hasOperationalAlert =
      operational_alert &&
      typeof operational_alert.order_id === "string" &&
      typeof operational_alert.alert_type === "string";

    if (hasTargetedUsers) {
      const ids = user_ids as string[];
      if (ids.length > 50 || !ids.every((id) => UUID_RE.test(id))) {
        return new Response(JSON.stringify({ error: "Invalid user_ids" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const token = authHeader.replace("Bearer ", "");
    // Service-role callers (webhooks) may target specific users; never broadcast anonymously.
    const isServiceRole = isServiceRoleBearer(token, serviceRoleKey);
    const { data: authData } = await userClient.auth.getUser(token);
    const authUser = authData.user ?? null;

    const role = authUser?.app_metadata?.portal_role as string | undefined;
    const isStaffOrAdmin = isServiceRole || role === "admin" || role === "staff";

    let callerPortalId: string | null = null;
    if (authUser) {
      const { data: portalRow } = await adminClient
        .from("og_portal_users")
        .select("id")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();
      callerPortalId = portalRow?.id ?? null;
    }

    let targetUserIds: string[] | null = null;

    if (hasOperationalAlert) {
      const orderId = operational_alert.order_id as string;
      const alertType = operational_alert.alert_type as string;

      if (!ORDER_ID_RE.test(orderId) || !ALLOWED_ALERT_TYPES.has(alertType)) {
        return new Response(JSON.stringify({ error: "Invalid operational_alert" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: order, error: orderErr } = await adminClient
        .from("og_orders")
        .select("customer_id, created_at")
        .eq("id", orderId)
        .maybeSingle();

      if (orderErr || !order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orderAgeMs = Date.now() - new Date(order.created_at).getTime();
      const isRecentGuest = !order.customer_id && orderAgeMs >= 0 && orderAgeMs < 10 * 60 * 1000;
      const isOwner = Boolean(order.customer_id && callerPortalId === order.customer_id);
      // Mirror src/lib/pushAuth.ts canDispatchOperationalPush — owner may alert for new orders + proof.
      const isOwnerOperationalAlert =
        isOwner &&
        (alertType === "payment_proof" ||
          alertType === "new_retail_order" ||
          alertType === "new_custom_order");
      const isGuestCheckoutAlert =
        isRecentGuest && (alertType === "new_retail_order" || alertType === "new_custom_order");

      if (!isStaffOrAdmin && !isOwnerOperationalAlert && !isGuestCheckoutAlert) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: staffUsers, error: staffErr } = await adminClient
        .from("og_portal_users")
        .select("id")
        .in("role", ["admin", "staff"])
        .eq("status", "active");

      if (staffErr || !staffUsers?.length) {
        return new Response(JSON.stringify({ sent: 0, failed: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      targetUserIds = staffUsers.map((u) => u.id);
    }

    if (hasTargetedUsers) {
      if (isStaffOrAdmin) {
        // Staff/admin may notify customers or other portal users.
      } else if (authUser && callerPortalId) {
        const allSelf = (user_ids as string[]).every((id) => id === callerPortalId);
        if (!allSelf) {
          return new Response(JSON.stringify({ error: "Forbidden: cannot notify other users" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        return new Response(JSON.stringify({ error: "Forbidden: staff or admin required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!hasTargetedUsers && !targetUserIds && !isStaffOrAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only for broadcast" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let query = adminClient.from("og_push_subscriptions").select("*");
    if (targetUserIds?.length) {
      query = query.in("user_id", targetUserIds);
    } else if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
      query = query.in("user_id", user_ids);
    }
    const { data: subscriptions, error: fetchErr } = await query;
    if (fetchErr || !subscriptions) {
      return new Response(JSON.stringify({ error: "Failed to load subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payloadStr = JSON.stringify({ title: safeTitle, body: safeBody, url: safeUrl });

    let sent = 0;
    let failed = 0;
    const stale: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth: sub.keys_auth,
            },
          },
          payloadStr,
          { TTL: 86400 },
        );
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          stale.push(sub.id);
        }
        failed++;
      }
    }

    if (stale.length > 0) {
      await adminClient.from("og_push_subscriptions").delete().in("id", stale);
    }

    return new Response(
      JSON.stringify({ sent, failed, stale_removed: stale.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeadersFor(req), "Content-Type": "application/json" },
    });
  }
});
