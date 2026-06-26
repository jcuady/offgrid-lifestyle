import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { accountContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";
import { Footer } from "@/src/components/Footer";

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

/** Customer account pages — storefront header + hero band, connected to homepage via Navbar. */
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
    <div className={cn("portal-surface min-h-screen w-full min-w-0 overflow-x-hidden bg-offgrid-cream", className)}>
      <div className="bg-offgrid-green pb-12 pt-24 text-offgrid-cream sm:pb-14 sm:pt-28">
        <div className={accountContainer}>
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-offgrid-cream/55">
            <Link to="/" className="transition-colors hover:text-offgrid-cream">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
            <span className="text-offgrid-cream/80">{eyebrow}</span>
          </nav>
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
      <div className={cn(accountContainer, "relative z-10 pb-16 pt-8 sm:pb-20 sm:pt-10", contentClassName)}>{children}</div>
      <Footer />
    </div>
  );
}
