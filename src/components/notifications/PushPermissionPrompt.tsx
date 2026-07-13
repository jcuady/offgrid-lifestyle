import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, X } from "lucide-react";
import { dismissPushPrompt, getCookieConsent, isPushPromptDismissed } from "@/src/lib/consent";
import { canReceiveWebPush, isIosDevice, isStandalonePwa, openInstallGuide } from "@/src/lib/pwa";
import { isPushSubscribed, subscribeToPushDetailed } from "@/src/lib/pushSubscription";
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

    // iOS Safari only supports Web Push in a Home Screen PWA — show install CTA, not Enable.
    if (isIosDevice() && !isStandalonePwa()) {
      setVisible(true);
      return;
    }

    if (!canReceiveWebPush()) return;
    if (!("Notification" in window) || Notification.permission === "granted") return;

    void isPushSubscribed().then((subscribed) => {
      if (!subscribed && Notification.permission === "default") {
        setVisible(true);
      }
    });
  }, [user?.id, user?.role]);

  const close = () => {
    dismissPushPrompt();
    setVisible(false);
  };

  const enable = async () => {
    setBusy(true);
    setError(null);
    const result = await subscribeToPushDetailed();
    setBusy(false);
    if (result.ok === false) {
      setError(result.reason);
      return;
    }
    close();
  };

  const needsIosInstall = isIosDevice() && !isStandalonePwa();
  const isCustomer = user?.role === "customer";

  const title = isCustomer ? "Stay updated on your orders" : "Stay updated on operations";
  const body = needsIosInstall
    ? "Add OffGrid to your Home Screen, then turn on push to get order alerts."
    : isCustomer
      ? "Get notified when your payment is confirmed, quotes are ready, or your order ships."
      : "Get notified the moment new orders arrive or customers upload payment proof.";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-label="Enable push notifications"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[55] mx-auto max-w-sm overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white shadow-2xl shadow-offgrid-dark/20 sm:inset-x-auto sm:right-6 sm:bottom-6"
        >
          {/* Branded accent rail */}
          <div className="h-1 w-full bg-offgrid-lime" aria-hidden />

          <button
            type="button"
            aria-label="Dismiss"
            onClick={close}
            className="absolute right-2.5 top-3.5 grid h-7 w-7 place-items-center rounded-full text-offgrid-green/40 transition-colors hover:bg-offgrid-green/5 hover:text-offgrid-green"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3.5 pr-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-offgrid-lime text-white shadow-sm">
                <Bell className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime">
                  Notifications
                </p>
                <h2 className="mt-1 font-display text-base font-bold leading-snug text-offgrid-green">
                  {title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-offgrid-green/60">{body}</p>
              </div>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-4 flex items-center gap-2">
              {needsIosInstall ? (
                <button
                  type="button"
                  onClick={openInstallGuide}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-offgrid-green px-5 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
                >
                  How to install
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void enable()}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-offgrid-green px-5 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-cream transition-colors hover:bg-offgrid-dark disabled:opacity-60"
                >
                  {busy ? "Enabling…" : "Enable"}
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-green/55 transition-colors hover:bg-offgrid-green/5 hover:text-offgrid-green"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
