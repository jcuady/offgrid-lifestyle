import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { getCookieConsent, onCookieConsent } from "@/src/lib/consent";
import { dismissCustomTeamPrompt, isCustomTeamPromptDismissed } from "@/src/lib/customTeamPrompt";

const AUTO_PROMPT_DELAY_MS = 1400;

/** Soft popup on the landing page for custom team kits — once per browser until dismissed. */
export function CustomTeamOrderModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    if (location.pathname !== "/") return;
    if (isCustomTeamPromptDismissed() || openedRef.current) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (openedRef.current || isCustomTeamPromptDismissed()) return;
      if (getCookieConsent() === null) return;
      timer = setTimeout(() => {
        if (openedRef.current || isCustomTeamPromptDismissed()) return;
        openedRef.current = true;
        setOpen(true);
      }, AUTO_PROMPT_DELAY_MS);
    };

    if (getCookieConsent() !== null) schedule();
    const unsub = onCookieConsent(() => schedule());

    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleClose = () => {
    dismissCustomTeamPrompt();
    setOpen(false);
  };

  const handleOrder = () => {
    dismissCustomTeamPrompt();
    setOpen(false);
    navigate("/custom/order");
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
            aria-labelledby="custom-team-title"
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
              <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-offgrid-lime">
                Teams · Clubs · Squads
              </p>
              <h2 id="custom-team-title" className="mt-2 font-display text-2xl font-black leading-tight">
                Need custom team kits?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-offgrid-cream/75">
                Tell us your sport, sizes, and design. OFFGRID builds production-ready kits — min. 10 pcs.
              </p>
            </div>

            <div className="space-y-3 px-6 pb-6 pt-5">
              <Button type="button" className="group w-full gap-2" onClick={handleOrder}>
                Start a team order
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/45 transition-colors hover:text-offgrid-green"
              >
                Just browsing
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
