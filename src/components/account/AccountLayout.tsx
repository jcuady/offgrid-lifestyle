import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package2, UserRound, LogOut, ChevronRight, ArrowLeft } from "lucide-react";
import { accountContainer, accountMobileDockPad } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";
import { usePortalStore } from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";

export type AccountSection = "orders" | "profile";

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

const NAV: { id: AccountSection; label: string; shortLabel: string; to: string; icon: typeof Package2 }[] = [
  { id: "orders", label: "My orders", shortLabel: "Orders", to: "/account/orders", icon: Package2 },
  { id: "profile", label: "Account details", shortLabel: "Profile", to: "/account/profile", icon: UserRound },
];

function initialsFrom(value?: string | null): string {
  if (!value) return "OG";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

/**
 * Customer account chrome — adaptive by viewport:
 * - Mobile: centered identity + bottom dock (app-like)
 * - Desktop (lg+): sticky sidebar + content (web dashboard)
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

  const handleSignOut = async () => {
    await localAuthService.logout();
    navigate("/");
  };

  const identityName = user?.name?.trim() || user?.email || "Guest";
  const showMobileHero = !backTo;

  return (
    <div
      className={cn(
        "min-h-screen bg-offgrid-cream pt-[max(5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:pt-24",
        accountMobileDockPad,
      )}
    >
      <div className={cn(accountContainer, "pt-5 sm:pt-8 lg:pt-10")}>
        {/* Web breadcrumb */}
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
          {/* —— Desktop sidebar —— */}
          <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="rounded-2xl bg-offgrid-green p-5 text-offgrid-cream shadow-sm">
              <div className="flex items-center gap-3">
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
              {NAV.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === active;
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex w-full min-h-11 items-center gap-2.5 rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-200",
                      isActive
                        ? "bg-offgrid-green text-offgrid-cream shadow-sm"
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
            {/* —— Mobile identity hero —— */}
            {showMobileHero ? (
              <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-offgrid-green font-display text-2xl font-black text-offgrid-cream shadow-md shadow-offgrid-green/15 ring-4 ring-white">
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

      {/* —— Mobile bottom dock —— */}
      <nav
        aria-label="Account sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-offgrid-green/10 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return (
              <Link
                key={item.id}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-12 min-w-[5.5rem] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-1.5 transition-colors duration-200",
                  isActive ? "text-offgrid-green" : "text-offgrid-green/45 hover:text-offgrid-green/70",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full transition-colors duration-200",
                    isActive && "bg-offgrid-green text-offgrid-cream shadow-sm",
                  )}
                >
                  <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={isActive ? 2 : 1.75} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
