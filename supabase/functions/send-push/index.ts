import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
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

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const role = authData.user.app_metadata?.portal_role as string | undefined;
    const isStaffOrAdmin = role === "admin" || role === "staff";

    const { title, body, url: clickUrl, user_ids, operational_alert } = await req.json();
    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasTargetedUsers = user_ids && Array.isArray(user_ids) && user_ids.length > 0;
    const hasOperationalAlert =
      operational_alert &&
      typeof operational_alert.order_id === "string" &&
      typeof operational_alert.alert_type === "string";

    let targetUserIds: string[] | null = null;

    if (hasOperationalAlert) {
      const orderId = operational_alert.order_id as string;
      const alertType = operational_alert.alert_type as string;

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

      const { data: portalRow } = await adminClient
        .from("og_portal_users")
        .select("id")
        .eq("auth_user_id", authData.user.id)
        .maybeSingle();

      const callerPortalId = portalRow?.id ?? null;
      const orderAgeMs = Date.now() - new Date(order.created_at).getTime();
      const isRecentGuest = !order.customer_id && orderAgeMs < 10 * 60 * 1000;
      const isOwner = order.customer_id && callerPortalId === order.customer_id;
      const isPaymentProof = alertType === "payment_proof" && isOwner;

      if (!isStaffOrAdmin && !isOwner && !isRecentGuest && !isPaymentProof) {
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

    if (!hasTargetedUsers && !targetUserIds && role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: admin only for broadcast" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (hasTargetedUsers && !isStaffOrAdmin && !hasOperationalAlert) {
      return new Response(JSON.stringify({ error: "Forbidden: staff or admin required" }), {
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
      return new Response(JSON.stringify({ error: fetchErr?.message ?? "No subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payloadStr = JSON.stringify({ title, body, url: clickUrl ?? "/" });

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
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
