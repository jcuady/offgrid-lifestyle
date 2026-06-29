import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { isPushSubscribed, subscribeToPush, unsubscribeFromPush } from "@/src/lib/pushSubscription";
import { getCookieConsent } from "@/src/lib/consent";
import { isIosDevice, isStandalonePwa } from "@/src/lib/pwa";
import { usePortalStore } from "@/src/store/usePortalStore";

export function NotificationSettings() {
  const currentUser = usePortalStore((s) => s.currentUser);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        if (getCookieConsent() === "essential-only") {
          setMessage("Enable all cookies in the banner to use push notifications.");
          return;
        }
        const ok = await subscribeToPush();
        await refresh();
        setMessage(ok ? "Push notifications enabled." : "Could not enable notifications. Check browser permissions.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-w-0 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-offgrid-green/[0.08]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-offgrid-green/8 text-offgrid-green">
          {subscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-offgrid-green">Notifications</h2>
          <p className="mt-1 text-sm text-offgrid-green/60">
            {currentUser?.role === "customer"
              ? "Order updates: payment confirmed, custom quotes, shipping, and delivery."
              : "Operations alerts: new shop and custom orders, plus payment proof uploads."}
          </p>
          <p className="mt-2 text-xs text-offgrid-green/45">
            Browser permission:{" "}
            {permission === "unsupported" ? "Not supported" : permission}
          </p>
          {message ? <p className="mt-2 text-xs font-medium text-offgrid-green">{message}</p> : null}
          {isIosDevice() && !isStandalonePwa() && permission !== "granted" ? (
            <p className="mt-2 text-xs text-offgrid-green/55">
              On iPhone, add OffGrid to your Home Screen first, then enable notifications here.
            </p>
          ) : null}
          <Button
            variant={subscribed ? "outline" : "default"}
            size="sm"
            className="mt-4"
            disabled={busy || permission === "unsupported"}
            onClick={() => void toggle()}
          >
            {busy ? "Saving…" : subscribed ? "Turn off notifications" : "Enable notifications"}
          </Button>
        </div>
      </div>
    </section>
  );
}
