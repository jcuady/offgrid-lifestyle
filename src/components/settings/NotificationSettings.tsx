import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import {
  isPushSubscribed,
  sendPushNotification,
  subscribeToPushDetailed,
  unsubscribeFromPush,
} from "@/src/lib/pushSubscription";
import { getCookieConsent } from "@/src/lib/consent";
import { canReceiveWebPush, getPushUnsupportedReason, isIosDevice, isStandalonePwa, openInstallGuide } from "@/src/lib/pwa";
import { usePortalStore } from "@/src/store/usePortalStore";

export function NotificationSettings() {
  const currentUser = usePortalStore((s) => s.currentUser);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [busy, setBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const pushSupported = canReceiveWebPush();
  const unsupportedReason = getPushUnsupportedReason();
  const vapidConfigured = Boolean(import.meta.env.VITE_VAPID_PUBLIC_KEY);

  const refresh = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    setSubscribed(await isPushSubscribed());
  };

  useEffect(() => {
    void refresh();
  }, []);

  const toggle = async () => {
    setMessage(null);
    setBusy(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
        setMessage("Push notifications turned off.");
      } else {
        if (!currentUser) {
          setMessage("Sign in to enable push notifications.");
          return;
        }
        if (getCookieConsent() === "essential-only") {
          setMessage("Enable all cookies in the banner to use push notifications.");
          return;
        }
        if (!vapidConfigured) {
          setMessage("Push is not configured on this deployment yet.");
          return;
        }
        const result = await subscribeToPushDetailed();
        await refresh();
        if (result.ok) {
          setMessage("Push notifications enabled.");
        } else if (result.ok === false) {
          setMessage(result.reason);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setMessage(null);
    if (!currentUser) {
      setMessage("Sign in to send a test notification.");
      return;
    }
    if (!subscribed) {
      setMessage("Enable push on this device first.");
      return;
    }
    setTestBusy(true);
    try {
      const result = await sendPushNotification({
        title: "OffGrid test notification",
        body: "Push is working on this device. You can dismiss this.",
        url: currentUser.role === "customer" ? "/account/orders" : "/portal",
        tag: `test-${currentUser.role}-${currentUser.id.slice(0, 8)}`,
        userIds: [currentUser.id],
      });
      if (result.sent > 0) {
        setMessage("Test push sent — check your device notifications.");
      } else {
        setMessage(
          "No push delivered (0 sent). Re-enable notifications on this device, or install the PWA on mobile.",
        );
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Test push failed.");
    } finally {
      setTestBusy(false);
    }
  };

  const permissionLabel =
    permission === "unsupported"
      ? "Not supported"
      : permission === "granted"
        ? "Allowed"
        : permission === "denied"
          ? "Blocked"
          : "Not asked yet";

  return (
    <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.08] sm:p-6 lg:h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-offgrid-green/8 text-offgrid-green">
          {subscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-offgrid-green">Push notifications</h2>
          <p className="mt-1 text-sm leading-relaxed text-offgrid-green/60">
            {currentUser?.role === "customer"
              ? "Order updates: payment confirmed, custom quotes, shipping, and delivery."
              : "Operations alerts: new shop and custom orders, plus payment proof uploads."}
          </p>

          <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-xl bg-offgrid-cream/60 px-3 py-2">
              <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                Browser permission
              </dt>
              <dd className="mt-0.5 font-medium text-offgrid-green">{permissionLabel}</dd>
            </div>
            <div className="rounded-xl bg-offgrid-cream/60 px-3 py-2">
              <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                Push status
              </dt>
              <dd className="mt-0.5 font-medium text-offgrid-green">
                {subscribed ? "Enabled on this device" : "Off on this device"}
              </dd>
            </div>
          </dl>

          {unsupportedReason && !subscribed ? (
            <p className="mt-3 text-xs leading-relaxed text-amber-800/90">{unsupportedReason}</p>
          ) : null}

          {isIosDevice() && !isStandalonePwa() && !subscribed ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="text-xs leading-relaxed text-offgrid-green/55">
                iPhone and iPad require the installed app for push. Add OffGrid to your Home Screen, then return here.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={openInstallGuide}
              >
                How to install
              </Button>
            </div>
          ) : null}

          {message ? (
            <p className="mt-3 text-xs font-medium leading-relaxed text-offgrid-green" role="status">
              {message}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant={subscribed ? "outline" : "default"}
              size="sm"
              className="w-full sm:w-auto"
              disabled={busy || permission === "unsupported" || (!pushSupported && !subscribed) || !vapidConfigured}
              onClick={() => void toggle()}
            >
              {busy ? "Saving…" : subscribed ? "Turn off notifications" : "Enable notifications"}
            </Button>
            {subscribed ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={testBusy || !currentUser}
                onClick={() => void sendTest()}
              >
                {testBusy ? "Sending…" : "Send test push"}
              </Button>
            ) : null}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-offgrid-green/40">
            Works on Chrome, Firefox, Edge, and installed PWAs (Android + iOS 16.4+ Home Screen). Uses encrypted Web
            Push with VAPID. Safari tabs on iPhone cannot receive push — install to Home Screen first.
          </p>
        </div>
      </div>
    </section>
  );
}
