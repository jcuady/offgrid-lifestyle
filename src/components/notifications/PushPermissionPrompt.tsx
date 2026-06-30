import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { dismissPushPrompt, getCookieConsent, isPushPromptDismissed } from "@/src/lib/consent";
import { canReceiveWebPush } from "@/src/lib/pwa";
import { isPushSubscribed, subscribeToPushDetailed } from "@/src/lib/pushSubscription";
import { isIosDevice, isStandalonePwa, openInstallGuide } from "@/src/lib/pwa";
import { usePortalStore } from "@/src/store/usePortalStore";

export function PushPermissionPrompt() {
  const user = usePortalStore((s) => s.currentUser);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (isPushPromptDismissed()) return;
    if (getCookieConsent() === "essential-only") return;
    if (!canReceiveWebPush()) return;
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
    setError(null);
    const result = await subscribeToPushDetailed();
    setBusy(false);
    dismissPushPrompt();
    setVisible(false);
    if (result.ok === false) {
      setError(result.reason);
    }
  };

  const needsIosInstall = isIosDevice() && !isStandalonePwa();

  return (
    <div
      role="dialog"
      aria-label="Enable notifications"
      className="fixed inset-x-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[55] mx-auto max-w-md rounded-2xl border border-offgrid-green/15 bg-white p-4 shadow-xl sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-full p-1 text-offgrid-green/40 hover:bg-offgrid-green/5 hover:text-offgrid-green"
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
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-offgrid-green">
            {user?.role === "customer" ? "Stay updated on your orders" : "Stay updated on operations"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-offgrid-green/60">
            {needsIosInstall
              ? "Add OffGrid to your Home Screen first, then enable push for order alerts."
              : user?.role === "customer"
                ? "Get notified when payment is confirmed, quotes are ready, or your order ships."
                : "Get notified when new orders arrive or customers upload payment proof."}
          </p>
          {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {needsIosInstall ? (
              <Button size="sm" className="w-full sm:w-auto" onClick={openInstallGuide}>
                How to install
              </Button>
            ) : (
              <Button size="sm" className="w-full sm:w-auto" disabled={busy} onClick={() => void enable()}>
                {busy ? "Enabling…" : "Enable notifications"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
