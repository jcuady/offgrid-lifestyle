import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import type { LifecycleGuide } from "@/src/lib/orderLifecycleGuidance";

const toneClass: Record<LifecycleGuide["tone"], string> = {
  wait: "border-offgrid-gold/30 bg-offgrid-gold/10",
  action: "border-offgrid-lime/40 bg-offgrid-lime/[0.12]",
  done: "border-offgrid-green/15 bg-offgrid-cream/60",
  warn: "border-amber-200 bg-amber-50",
};

export function LifecycleGuideBanner({
  guide,
  className,
  actionSlot,
}: {
  guide: LifecycleGuide;
  className?: string;
  actionSlot?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4 sm:px-5",
        toneClass[guide.tone],
        className,
      )}
      role="status"
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/50">
        What to do next
      </p>
      <h3 className="mt-1 font-display text-lg font-bold text-offgrid-green">{guide.title}</h3>
      <p className="mt-1.5 text-sm text-offgrid-green/80">{guide.body}</p>
      <p className="mt-3 text-sm font-semibold text-offgrid-green">
        Next: {guide.nextStep}
      </p>
      {actionSlot ? <div className="mt-3">{actionSlot}</div> : null}
    </div>
  );
}
