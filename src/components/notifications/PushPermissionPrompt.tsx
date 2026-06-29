import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { dismissPushPrompt, getCookieConsent, isPushPromptDismissed } from "@/src/lib/consent";
import { isPushSubscribed, subscribeToPush } from "@/src/lib/pushSubscription";
import { usePortalStore } from "@/src/store/usePortalStore";

export function PushPermissionPrompt() {
  const user = usePortalStore((s) => s.currentUser);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isPushPromptDismissed()) return;
    if (getCookieConsent() === "essential-only") return;
    if (!("Notification" in window) || Notification.permission === "granted") return;

    void isPushSubscribed().then((subscribed) => {
      if (!subscribed && Notification.permission === "default") {
        setVisible(true);
      }
    });
  }, [user?.id, user?.role]);

  if (!visible) return null;

  const enable = async () => {
    setBusy(true);
    const ok = await subscribeToPush();
    setBusy(false);
    dismissPushPrompt();
    setVisible(false);
    if (!ok && Notification.permission === "denied") {
      dismissPushPrompt();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Enable notifications"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[55] max-w-sm rounded-2xl border border-offgrid-green/15 bg-white p-4 shadow-xl sm:bottom-6"
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-offgrid-green/40 hover:text-offgrid-green"
        onClick={() => {
          dismissPushPrompt();
          setVisible(false);
        }}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3 pr-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-offgrid-lime/20 text-offgrid-green">
          <Bell className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-sm font-bold text-offgrid-green">
            {user?.role === "customer" ? "Stay updated on your orders" : "Stay updated on operations"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-offgrid-green/60">
            {user?.role === "customer"
              ? "Get notified when payment is confirmed, quotes are ready, or your order ships."
              : "Get notified when new orders arrive or customers upload payment proof."}
          </p>
          <Button size="sm" className="mt-3" disabled={busy} onClick={() => void enable()}>
            {busy ? "Enabling…" : "Enable notifications"}
          </Button>
        </div>
      </div>
    </div>
  );
}
