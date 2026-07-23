import { logger } from "@/src/lib/logger";
import { buildSendPushHeaders, readPushSendError } from "@/src/lib/pushRequest";
import { supabase } from "@/src/lib/supabase";
import { canReceiveWebPush, getPushUnsupportedReason } from "@/src/lib/pwa";
import { ensureServiceWorkerReady } from "@/src/lib/serviceWorker";
import { usePortalStore } from "@/src/store/usePortalStore";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushSubscribeResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function subscribeToPush(): Promise<boolean> {
  const result = await subscribeToPushDetailed();
  return result.ok;
}

export async function subscribeToPushDetailed(): Promise<PushSubscribeResult> {
  const unsupported = getPushUnsupportedReason();
  if (unsupported) {
    logger.warn(unsupported, { operation: "subscribeToPush" });
    return { ok: false, reason: unsupported };
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    const reason = "Push is not configured yet. Contact support if this persists.";
    logger.warn("VAPID public key not configured", { operation: "subscribeToPush" });
    return { ok: false, reason };
  }

  if (!canReceiveWebPush()) {
    const reason = getPushUnsupportedReason() ?? "Push notifications are not supported.";
    return { ok: false, reason };
  }

  try {
    const registration = await ensureServiceWorkerReady();
    if (!registration) {
      return { ok: false, reason: "Could not activate the app service worker. Refresh and try again." };
    }

    if (Notification.permission === "denied") {
      return {
        ok: false,
        reason: "Notifications are blocked. Allow them in your browser or device settings.",
      };
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return {
          ok: false,
          reason:
            permission === "denied"
              ? "Notifications are blocked. Allow them in your browser or device settings."
              : "Notification permission was not granted.",
        };
      }
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
    }

    await saveSubscription(subscription);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Push subscription failed", {
      operation: "subscribeToPush",
      error: message,
    });
    return {
      ok: false,
      reason: message.includes("applicationServerKey")
        ? "Invalid VAPID key configuration. Check VITE_VAPID_PUBLIC_KEY."
        : "Could not enable push notifications. Try again or check browser settings.",
    };
  }
}

async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const keys = subscription.toJSON().keys;
  if (!keys?.p256dh || !keys.auth) return;

  const currentUser = usePortalStore.getState().currentUser;
  const portalUserId = currentUser?.id ?? null;
  if (!portalUserId) {
    throw new Error("Sign in before enabling push notifications.");
  }

  const { error } = await supabase.from("og_push_subscriptions").upsert(
    {
      endpoint: subscription.endpoint,
      keys_p256dh: keys.p256dh,
      keys_auth: keys.auth,
      user_id: portalUserId,
    },
    { onConflict: "endpoint" },
  );

  if (error) throw error;
}

/** Attach browser push subscription to the signed-in portal user after login. */
export async function linkPushSubscriptionToUser(): Promise<void> {
  if (!canReceiveWebPush()) return;
  try {
    const registration = await ensureServiceWorkerReady();
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await saveSubscription(subscription);
    }
  } catch (err) {
    logger.warn("Failed to link push subscription", {
      operation: "linkPushSubscriptionToUser",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await ensureServiceWorkerReady();
    if (!registration) return true;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    // Delete durable row first so a failed browser unsubscribe cannot leave orphans.
    await supabase.from("og_push_subscriptions").delete().eq("endpoint", subscription.endpoint);
    await subscription.unsubscribe();

    return true;
  } catch (err) {
    logger.error("Push unsubscribe failed", {
      operation: "unsubscribeFromPush",
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!canReceiveWebPush()) return false;
  try {
    const registration = await ensureServiceWorkerReady();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    const currentUser = usePortalStore.getState().currentUser;
    if (!currentUser) return true;

    const { data, error } = await supabase
      .from("og_push_subscriptions")
      .select("id")
      .eq("endpoint", subscription.endpoint)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) {
      logger.warn("Failed to verify push subscription in database", {
        operation: "isPushSubscribed",
        error: error.message,
      });
      return true;
    }

    return Boolean(data);
  } catch {
    return false;
  }
}

export type OperationalAlertType = "new_retail_order" | "new_custom_order" | "payment_proof";

/** Trigger push notification via Edge Function. */
export async function sendPushNotification(params: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  userIds?: string[];
  operationalAlert?: { orderId: string; alertType: OperationalAlertType };
}): Promise<{ sent: number; failed: number }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const session = (await supabase.auth.getSession()).data.session;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const resp = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
    method: "POST",
    headers: buildSendPushHeaders(
      session?.access_token,
      anonKey,
      Boolean(params.operationalAlert),
    ),
    body: JSON.stringify({
      title: params.title,
      body: params.body,
      url: params.url,
      tag: params.tag,
      user_ids: params.userIds,
      operational_alert: params.operationalAlert
        ? {
            order_id: params.operationalAlert.orderId,
            alert_type: params.operationalAlert.alertType,
          }
        : undefined,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Push send failed: ${await readPushSendError(resp)}`);
  }

  return resp.json();
}
