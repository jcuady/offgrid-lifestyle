import { Link } from "react-router-dom";
import { Package2, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { CUSTOMER_APP_NAV, type CustomerAppSection } from "@/src/lib/customerAppNav";
import { cn } from "@/src/lib/utils";

const NAV_ICONS = {
  shop: ShoppingBag,
  custom: Sparkles,
  orders: Package2,
  profile: UserRound,
} as const;

export function CustomerAppDock({ active }: { active: CustomerAppSection }) {
  return (
    <nav
      aria-label="Account sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-offgrid-green/10 bg-white/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 items-stretch gap-0.5">
        {CUSTOMER_APP_NAV.map((item) => {
          const Icon = NAV_ICONS[item.id];
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 transition-[color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]",
                isActive ? "text-offgrid-green" : "text-offgrid-green/40 hover:text-offgrid-green/70",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  isActive && "bg-offgrid-green text-offgrid-cream",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2 : 1.75} />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
