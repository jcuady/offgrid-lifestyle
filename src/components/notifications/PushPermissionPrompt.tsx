import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, X } from "lucide-react";
import {
  dismissPushPrompt,
  getCookieConsent,
  isPushPromptDismissed,
  onCookieConsent,
} from "@/src/lib/consent";
import {
  canNativeInstall,
  canReceiveWebPush,
  isIosDevice,
  isPwaInstallDismissed,
  isStandalonePwa,
  openInstallGuide,
  subscribePwaInstall,
} from "@/src/lib/pwa";
import { isPushSubscribed, subscribeToPushDetailed } from "@/src/lib/pushSubscription";
import { usePortalStore } from "@/src/store/usePortalStore";
import { Button } from "@/src/components/ui/Button";

/** After cookie + install soft-prompt window so chrome does not stack. */
const PUSH_PROMPT_DELAY_MS = 2800;

function installSoftOfferPending(): boolean {
  if (isStandalonePwa() || isPwaInstallDismissed()) return false;
  return canNativeInstall() || isIosDevice();
}

export function PushPermissionPrompt() {
  const user = usePortalStore((s) => s.currentUser);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (isPushPromptDismissed()) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const tryShow = async () => {
      if (cancelled || isPushPromptDismissed()) return;
      if (getCookieConsent() === null || getCookieConsent() === "essential-only") return;
      if (installSoftOfferPending()) return;

      if (isIosDevice() && !isStandalonePwa()) {
        setVisible(true);
        return;
      }

      if (!canReceiveWebPush()) return;
      if (!("Notification" in window)) return;

      const subscribed = await isPushSubscribed();
      if (cancelled || subscribed) return;

      // Permission may already be granted while the PushSubscription / DB row is missing.
      if (Notification.permission === "denied") return;
      setVisible(true);
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void tryShow();
      }, PUSH_PROMPT_DELAY_MS);
    };

    if (getCookieConsent() !== null) schedule();
    const unsubConsent = onCookieConsent(() => schedule());
    const unsubInstall = subscribePwaInstall(() => schedule());

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubConsent();
      unsubInstall();
    };
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
          <div className="h-1 w-full bg-offgrid-lime" aria-hidden />

          <button
            type="button"
            aria-label="Dismiss"
            onClick={close}
            className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-offgrid-green/40 transition-colors hover:bg-offgrid-green/5 hover:text-offgrid-green"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3.5 pr-8">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-offgrid-lime text-white shadow-sm">
                <Bell className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime">
                  Notifications
                </p>
                <h2 className="mt-1 font-display text-base font-bold leading-snug text-offgrid-green">{title}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-offgrid-green/60">{body}</p>
              </div>
            </div>

            {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}

            <div className="mt-4 flex gap-2">
              {needsIosInstall ? (
                <Button className="min-h-11 flex-1" onClick={openInstallGuide}>
                  How to install
                </Button>
              ) : (
                <Button className="min-h-11 flex-1" disabled={busy} onClick={() => void enable()}>
                  {busy ? "Enabling…" : "Enable"}
                </Button>
              )}
              <Button variant="outline" className="min-h-11 shrink-0" onClick={close}>
                Not now
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
