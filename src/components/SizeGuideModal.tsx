import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  RETAIL_SIZING_TIPS,
  retailSizingRowsForProduct,
  type RetailSizingRow,
} from "@/src/data/retailSizingGuide";

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, table shows only these sizes (product’s available run). */
  productSizes?: string[];
  /** Highlight the shopper’s currently selected size. */
  selectedSize?: string;
}

export function SizeGuideModal({
  open,
  onClose,
  productSizes,
  selectedSize,
}: SizeGuideModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const rows: RetailSizingRow[] = retailSizingRowsForProduct(productSizes ?? []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    // Parent modals may already lock scroll; keep locked while open.
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close sizing guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-offgrid-dark/65 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[81] flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl bg-offgrid-cream shadow-2xl",
              "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(86dvh,36rem)] sm:w-[min(100vw-2rem,32rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
            )}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-offgrid-green/15 sm:hidden" aria-hidden />

            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-offgrid-green/10 px-4 pb-3 pt-2 sm:px-6 sm:pb-4 sm:pt-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/50">
                  Fit reference
                </p>
                <h2 id={titleId} className="mt-1 font-display text-xl font-black text-offgrid-green sm:text-2xl">
                  Sizing guide
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-offgrid-green/60 sm:text-sm">
                  Garment measurements in inches. Compare to a tee you already like.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-offgrid-green/5 text-offgrid-green transition-colors hover:bg-offgrid-green hover:text-offgrid-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
              <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1">
                <table className="w-full min-w-[18rem] border-collapse text-left text-sm text-offgrid-green">
                  <thead>
                    <tr className="border-b border-offgrid-green/10 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
                      <th className="sticky left-0 bg-offgrid-cream pb-3 pr-4">Size</th>
                      <th className="pb-3 pr-4">Chest</th>
                      <th className="pb-3 pr-4">Length</th>
                      <th className="pb-3">Waist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const active =
                        selectedSize != null &&
                        selectedSize.trim().toUpperCase() === row.size.toUpperCase();
                      return (
                        <tr
                          key={row.size}
                          className={cn(
                            "border-b border-offgrid-green/[0.06] last:border-0",
                            active && "bg-offgrid-lime/10",
                          )}
                        >
                          <td
                            className={cn(
                              "sticky left-0 bg-offgrid-cream py-3 pr-4 font-display font-bold",
                              active && "bg-offgrid-lime/10 text-offgrid-lime",
                            )}
                          >
                            {row.size}
                            {active ? (
                              <span className="ml-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-offgrid-lime">
                                Selected
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3 pr-4 tabular-nums text-offgrid-green/85">{row.chest}</td>
                          <td className="py-3 pr-4 tabular-nums text-offgrid-green/85">{row.length}</td>
                          <td className="py-3 tabular-nums text-offgrid-green/85">{row.waist}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="mt-5 space-y-2 rounded-2xl border border-offgrid-green/10 bg-white px-4 py-3.5 text-xs leading-relaxed text-offgrid-green/70 sm:text-sm">
                {RETAIL_SIZING_TIPS.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-offgrid-lime" aria-hidden />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="shrink-0 border-t border-offgrid-green/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-offgrid-green font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
