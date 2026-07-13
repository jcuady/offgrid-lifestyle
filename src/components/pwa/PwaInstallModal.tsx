import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { getCookieConsent, onCookieConsent } from "@/src/lib/consent";
import {
  dismissPwaInstallPrompt,
  isIosDevice,
  isStandalonePwa,
  onOpenInstallGuide,
} from "@/src/lib/pwa";
import { usePwaInstall } from "@/src/hooks/usePwaInstall";

type Platform = "ios" | "android";

const IOS_STEPS: string[] = [
  "Open this site in Safari (not Chrome or in-app browsers).",
  "Tap the Share button in the toolbar.",
  "Scroll down and tap “Add to Home Screen”.",
  "Tap “Add” — OffGrid will appear on your Home Screen.",
];

const ANDROID_STEPS: string[] = [
  "Open this site in Chrome.",
  "Tap the ⋮ menu in the top right.",
  "Tap “Install app” or “Add to Home screen”.",
  "Confirm — OffGrid installs like a native app.",
];

/** Wait for cookie bar to clear before soft-prompting install (avoids dual chrome). */
const AUTO_PROMPT_DELAY_MS = 900;

export function PwaInstallModal() {
  const { shouldAutoPrompt, canNativeInstall, install, installed, dismiss } = usePwaInstall();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("android");
  const [busy, setBusy] = useState(false);
  const [autoPrompt, setAutoPrompt] = useState(false);
  const autoOpenedRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPlatform(isIosDevice() ? "ios" : "android");
    return onOpenInstallGuide(() => {
      if (isStandalonePwa()) return;
      autoOpenedRef.current = true;
      setPlatform(isIosDevice() ? "ios" : "android");
      setAutoPrompt(false);
      setOpen(true);
    });
  }, []);

  // Soft popup after cookie consent — never a layout-pushing top bar.
  useEffect(() => {
    if (!shouldAutoPrompt || autoOpenedRef.current) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (autoOpenedRef.current || getCookieConsent() === null) return;
      timer = setTimeout(() => {
        if (autoOpenedRef.current) return;
        autoOpenedRef.current = true;
        setPlatform(isIosDevice() ? "ios" : "android");
        setAutoPrompt(true);
        setOpen(true);
      }, AUTO_PROMPT_DELAY_MS);
    };

    if (getCookieConsent() !== null) {
      schedule();
    }

    const unsub = onCookieConsent(() => schedule());

    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [shouldAutoPrompt]);

  useEffect(() => {
    if (installed) setOpen(false);
  }, [installed]);

  const steps = useMemo(() => (platform === "ios" ? IOS_STEPS : ANDROID_STEPS), [platform]);

  const handleClose = () => {
    // Auto soft-prompt: dismiss for good so we don't re-nag. Manual guide: just close.
    if (autoPrompt) dismiss();
    setOpen(false);
    setAutoPrompt(false);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (autoPrompt) dismiss();
      setOpen(false);
      setAutoPrompt(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, autoPrompt, dismiss]);

  const handleNativeInstall = async () => {
    setBusy(true);
    const accepted = await install();
    setBusy(false);
    if (accepted) {
      dismissPwaInstallPrompt();
      setOpen(false);
      setAutoPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-offgrid-dark/70 backdrop-blur-sm"
            aria-hidden
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-offgrid-cream shadow-2xl"
          >
            <div className="relative bg-offgrid-green px-6 pb-6 pt-7 text-offgrid-cream">
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close"
                onClick={handleClose}
                className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-offgrid-cream/10 text-offgrid-cream/80 transition-colors hover:bg-offgrid-cream/20 hover:text-offgrid-cream"
              >
                <X className="h-4 w-4" />
              </button>
              <img src={LOGO_WORDMARK_WHITE} alt="" className="h-7 w-auto" />
              <h2 id="pwa-install-title" className="mt-4 font-display text-2xl font-black leading-tight">
                Install the OffGrid app
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-offgrid-cream/75">
                Add OffGrid to your Home Screen for a faster, full-screen experience with order push
                notifications.
              </p>
            </div>

            <div className="px-6 pb-6 pt-5">
              {canNativeInstall ? (
                <div className="mb-5 rounded-2xl border border-offgrid-green/15 bg-white p-4">
                  <p className="text-sm font-semibold text-offgrid-green">One-tap install available</p>
                  <p className="mt-1 text-xs text-offgrid-green/60">
                    Your browser supports direct install — no manual steps needed.
                  </p>
                  <Button className="mt-3 w-full" disabled={busy} onClick={() => void handleNativeInstall()}>
                    <Download className="mr-2 h-4 w-4" />
                    {busy ? "Installing…" : "Install app"}
                  </Button>
                </div>
              ) : null}

              <div className="mb-4 flex rounded-full bg-offgrid-green/8 p-1">
                {(["ios", "android"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-all",
                      platform === p
                        ? "bg-offgrid-green text-offgrid-cream shadow-sm"
                        : "text-offgrid-green/55 hover:text-offgrid-green",
                    )}
                  >
                    {p === "ios" ? "iPhone / iPad" : "Android"}
                  </button>
                ))}
              </div>

              <ol className="space-y-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-offgrid-lime/15 font-display text-xs font-black text-offgrid-green">
                      {i + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed text-offgrid-green/85">{step}</p>
                  </li>
                ))}
              </ol>

              {platform === "ios" ? (
                <p className="mt-4 rounded-xl bg-offgrid-green/5 px-3 py-2.5 text-xs leading-relaxed text-offgrid-green/60">
                  iOS requires installing to the Home Screen before push notifications can be enabled.
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleClose}
                className="mt-5 w-full py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/45 transition-colors hover:text-offgrid-green"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
