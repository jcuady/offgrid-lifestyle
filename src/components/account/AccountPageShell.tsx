import type { ReactNode } from "react";
import { accountContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

interface AccountPageShellProps {
  eyebrow?: string;
  title: string;
  titleClassName?: string;
  description?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Consistent account chrome: green hero band + fluid content column on all breakpoints. */
export function AccountPageShell({
  eyebrow = "Account",
  title,
  titleClassName,
  description,
  headerExtra,
  children,
  className,
  contentClassName,
}: AccountPageShellProps) {
  return (
    <div className={cn("portal-surface min-h-screen w-full min-w-0 overflow-x-hidden bg-offgrid-cream pb-16 sm:pb-20", className)}>
      <div className="bg-offgrid-green pb-12 pt-24 text-offgrid-cream sm:pb-14 sm:pt-28">
        <div className={accountContainer}>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-offgrid-cream/80">{eyebrow}</p>
          <h1
            className={cn(
              "mt-2 break-words font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl",
              titleClassName,
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-offgrid-cream/75 sm:text-[15px]">{description}</p>
          ) : null}
          {headerExtra}
        </div>
      </div>
      <div className={cn(accountContainer, "relative z-10 pt-8 sm:pt-10", contentClassName)}>{children}</div>
    </div>
  );
}
