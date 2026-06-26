import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface PortalPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  /** Right-aligned controls (preview links, reset, etc.). */
  actions?: ReactNode;
  className?: string;
}

/** Consistent OG-branded page header for admin / staff portal pages. */
export function PortalPageHeader({ eyebrow, title, description, actions, className }: PortalPageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-offgrid-green/10 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-offgrid-lime" />
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-offgrid-green sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-offgrid-green/60">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
