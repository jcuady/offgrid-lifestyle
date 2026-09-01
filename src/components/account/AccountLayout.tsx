import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package2,
  UserRound,
  LogOut,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { accountContainer, accountMobileDockPad } from "@/src/lib/brandLayout";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { cn } from "@/src/lib/utils";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useStore } from "@/src/store/store";
import { localAuthService } from "@/src/services";
import { NotificationBell } from "@/src/components/notifications/NotificationBell";
import { CustomerAppDock } from "@/src/components/account/CustomerAppDock";
import {
  CUSTOMER_APP_NAV,
  type CustomerAppSection,
} from "@/src/lib/customerAppNav";

export type AccountSection = CustomerAppSection;

interface AccountLayoutProps {
  active: AccountSection;
  eyebrow?: string;
  title: string;
  titleClassName?: string;
  description?: string;
  headerExtra?: ReactNode;
  /** Optional back link rendered above the page header (e.g. on order detail). */
  backTo?: { to: string; label: string };
  children: ReactNode;
}

const NAV_ICONS = {
  shop: ShoppingBag,
  custom: Sparkles,
  orders: Package2,
  profile: UserRound,
} as const;

function initialsFrom(value?: string | null): string {
  if (!value) return "OG";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

/**
 * Customer app chrome — adaptive by viewport:
 * - Mobile: sticky brand bar + bottom dock
 * - Desktop (lg+): sticky bar + sidebar + content
 */
export function AccountLayout({
  active,
  eyebrow,
  title,
  titleClassName,
  description,
  headerExtra,
  backTo,
  children,
}: AccountLayoutProps) {
  const navigate = useNavigate();
  const user = usePortalStore((state) => state.currentUser);
  const cart = useStore((state) => state.cart);
  const toggleCart = useStore((state) => state.toggleCart);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = async () => {
    await localAuthService.logout();
    navigate("/");
  };

  const identityName = user?.name?.trim() || user?.email || "Guest";
  const showMobileHero = !backTo && (active === "orders" || active === "profile");

  return (
    <div className={cn("min-h-[100dvh] bg-offgrid-cream", accountMobileDockPad)}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-offgrid-green pt-[env(safe-area-inset-top)] text-offgrid-cream shadow-[0_12px_32px_-18px_rgba(16,42,28,0.45)]">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 md:px-8 lg:px-10">
          <Link
            to="/account/orders"
            className="flex min-w-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime/70"
          >
            <img src={LOGO_WORDMARK_WHITE} alt="OFFGRID" className="h-7 w-auto sm:h-8" />
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <NotificationBell variant="dark" settingsHref="/account/profile#notifications" />
            <button
              type="button"
              onClick={() => toggleCart(true)}
              aria-label={itemCount > 0 ? `Bag, ${itemCount} items` : "Bag"}
              className="relative grid h-11 w-11 place-items-center rounded-full text-offgrid-cream transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 active:scale-[0.96]"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
              {itemCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-offgrid-lime px-1 text-[9px] font-bold leading-4 text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </button>
            <Link
              to="/account/profile"
              aria-label="Profile"
              aria-current={active === "profile" ? "page" : undefined}
              className={cn(
                "hidden h-11 w-11 place-items-center rounded-full transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:grid",
                active === "profile" ? "bg-white/15" : "hover:bg-white/10",
              )}
            >
              <UserRound className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </header>

      <div className={cn(accountContainer, "pt-5 sm:pt-8 lg:pt-10")}>
        <nav
          aria-label="Breadcrumb"
          className="mb-6 hidden flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-offgrid-green/45 lg:flex"
        >
          <Link to="/" className="transition-colors hover:text-offgrid-green">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
          <span className="text-offgrid-green/75">Account</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[clamp(15rem,22vw,17rem)_1fr] lg:gap-10">
          <aside className="hidden min-w-0 lg:sticky lg:top-28 lg:block lg:self-start">
            <div className="rounded-[1.25rem] bg-offgrid-green p-1.5 text-offgrid-cream">
              <div className="flex items-center gap-3 rounded-[calc(1.25rem-0.375rem)] bg-offgrid-green px-3.5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-offgrid-lime font-display text-base font-black text-white">
                  {initialsFrom(user?.name || user?.email)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-offgrid-cream">{identityName}</p>
                  {user?.email ? (
                    <p className="truncate font-mono text-[11px] text-offgrid-cream/55">{user.email}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <nav aria-label="Account sections" className="mt-3 flex flex-col gap-1">
              {CUSTOMER_APP_NAV.map((item) => {
                const Icon = NAV_ICONS[item.id];
                const isActive = item.id === active;
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex w-full min-h-11 items-center gap-2.5 rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]",
                      isActive
                        ? "bg-offgrid-green text-offgrid-cream shadow-[0_10px_24px_-16px_rgba(16,42,28,0.55)]"
                        : "bg-white text-offgrid-green/70 ring-1 ring-offgrid-green/10 hover:bg-offgrid-green/[0.06] hover:text-offgrid-green",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 inline-flex w-full min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border-t border-offgrid-green/10 px-4 pt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-red-700 transition-colors duration-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                Sign out
              </button>
            </nav>
          </aside>

          <main id="main" className="min-w-0">
            {showMobileHero ? (
              <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-offgrid-green font-display text-2xl font-black text-offgrid-cream shadow-[0_16px_28px_-18px_rgba(16,42,28,0.55)] ring-4 ring-white">
                  {initialsFrom(user?.name || user?.email)}
                </span>
                <p className="mt-3 max-w-[18rem] truncate font-display text-xl font-black tracking-tight text-offgrid-green">
                  {identityName}
                </p>
                {user?.email ? (
                  <p className="mt-0.5 max-w-[20rem] truncate text-sm text-offgrid-green/55">{user.email}</p>
                ) : null}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-red-700/90 transition-colors duration-200 hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Sign out
                </button>
              </div>
            ) : null}

            {backTo ? (
              <Link
                to={backTo.to}
                className="mb-5 inline-flex min-h-11 items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/55 transition-colors hover:text-offgrid-green"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                {backTo.label}
              </Link>
            ) : null}

            <header className={cn("mb-6 sm:mb-8", showMobileHero && "lg:mb-9")}>
              {eyebrow ? (
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-offgrid-lime">
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className={cn(
                  "mt-2 break-words font-display text-2xl font-black tracking-tight text-offgrid-green sm:text-3xl lg:text-4xl",
                  showMobileHero && "text-center lg:text-left",
                  titleClassName,
                )}
              >
                {title}
              </h1>
              {description ? (
                <p
                  className={cn(
                    "mt-2 max-w-2xl text-sm leading-relaxed text-offgrid-green/60 sm:mt-3 sm:text-[15px]",
                    showMobileHero && "mx-auto text-center lg:mx-0 lg:text-left",
                  )}
                >
                  {description}
                </p>
              ) : null}
              {headerExtra ? (
                <div className={cn(showMobileHero && "flex justify-center lg:justify-start")}>{headerExtra}</div>
              ) : null}
            </header>

            {children}
          </main>
        </div>
      </div>

      <CustomerAppDock active={active} />
    </div>
  );
}
