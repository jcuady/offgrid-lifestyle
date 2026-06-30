import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package2, UserRound, LogOut, ChevronRight, ArrowLeft } from "lucide-react";
import { accountContainer } from "@/src/lib/brandLayout";
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

const NAV: { id: AccountSection; label: string; to: string; icon: typeof Package2 }[] = [
  { id: "orders", label: "My orders", to: "/account/orders", icon: Package2 },
  { id: "profile", label: "Account details", to: "/account/profile", icon: UserRound },
];

function initialsFrom(value?: string | null): string {
  if (!value) return "OG";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

/**
 * Standard customer account chrome: persistent identity + sidebar nav on a light
 * dashboard surface. The global Navbar/Footer wrap this, so it renders neither.
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

  return (
    <div className="min-h-screen bg-offgrid-cream pt-[max(5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:pt-24">
      <div className={cn(accountContainer, "pb-20 pt-6 sm:pt-10")}>
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-offgrid-green/45"
        >
          <Link to="/" className="transition-colors hover:text-offgrid-green">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
          <span className="text-offgrid-green/75">Account</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[clamp(15rem,22vw,17rem)_1fr] lg:gap-10">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            {/* Identity */}
            <div className="rounded-2xl bg-offgrid-green p-5 text-offgrid-cream shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-offgrid-lime font-display text-base font-black text-white">
                  {initialsFrom(user?.name || user?.email)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-offgrid-cream">
                    {identityName}
                  </p>
                  {user?.email ? (
                    <p className="truncate font-mono text-[11px] text-offgrid-cream/55">
                      {user.email}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Section nav */}
            <nav
              aria-label="Account sections"
              className="mt-3 flex flex-col gap-1.5 lg:sticky lg:top-24 lg:self-start"
            >
              {NAV.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === active;
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors",
                      isActive
                        ? "bg-offgrid-green text-offgrid-cream shadow-sm"
                        : "bg-white text-offgrid-green/70 ring-1 ring-offgrid-green/10 hover:text-offgrid-green lg:ring-0 lg:hover:bg-offgrid-green/[0.06]",
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
                className="inline-flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-red-700 transition-colors hover:bg-red-50 lg:mt-2 lg:border-t lg:border-offgrid-green/10 lg:pt-4"
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                Sign out
              </button>
            </nav>
          </aside>

          <main className="min-w-0">
            {backTo ? (
              <Link
                to={backTo.to}
                className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/55 transition-colors hover:text-offgrid-green"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                {backTo.label}
              </Link>
            ) : null}

            <header className="mb-7 sm:mb-9">
              {eyebrow ? (
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-offgrid-lime">
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className={cn(
                  "mt-2 break-words font-display text-3xl font-black tracking-tight text-offgrid-green sm:text-4xl",
                  titleClassName,
                )}
              >
                {title}
              </h1>
              {description ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-offgrid-green/60 sm:text-[15px]">
                  {description}
                </p>
              ) : null}
              {headerExtra}
            </header>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
