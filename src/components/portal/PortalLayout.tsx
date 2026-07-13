import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Package,
  CalendarDays,
  Palette,
  BarChart3,
  Home,
  MessageSquare,
  QrCode,
  Menu,
  X,
  ExternalLink,
  Users,
  ScrollText,
  Settings,
  Quote,
} from "lucide-react";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { cn } from "@/src/lib/utils";
import { usePortalStore, type UserRole } from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { PORTAL_LOGIN_PATH } from "@/src/lib/authRoutes";
import { NotificationBell } from "@/src/components/notifications/NotificationBell";

interface PortalLayoutProps {
  role: Exclude<UserRole, "customer">;
}

const labelsByRole: Record<Exclude<UserRole, "customer">, string> = {
  admin: "Admin Console",
  staff: "Staff Workspace",
};

interface NavItem {
  name: string;
  to: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navByRole: Record<Exclude<UserRole, "customer">, NavSection[]> = {
  admin: [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", to: "/portal/admin", icon: LayoutDashboard },
        { name: "Analytics", to: "/portal/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Commerce",
      items: [
        { name: "Orders", to: "/portal/admin/orders", icon: ClipboardList },
        { name: "Products", to: "/portal/admin/products", icon: Package },
        { name: "Reviews", to: "/portal/admin/reviews", icon: MessageSquare },
        { name: "Payments", to: "/portal/admin/payments", icon: QrCode },
        { name: "Events", to: "/portal/admin/events", icon: CalendarDays },
      ],
    },
    {
      label: "Content",
      items: [
        { name: "Homepage", to: "/portal/admin/homepage", icon: Home },
        { name: "Testimonials", to: "/portal/admin/testimonials", icon: Quote },
        { name: "Custom pages", to: "/portal/admin/custom-pages", icon: Palette },
      ],
    },
    {
      label: "Administration",
      items: [
        { name: "Staff", to: "/portal/admin/staff", icon: Users },
        { name: "Audit log", to: "/portal/admin/audit-logs", icon: ScrollText },
        { name: "Settings", to: "/portal/admin/settings", icon: Settings },
      ],
    },
  ],
  staff: [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", to: "/portal/staff", icon: LayoutDashboard },
        { name: "Analytics", to: "/portal/staff/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Commerce",
      items: [{ name: "Orders", to: "/portal/staff/orders", icon: ClipboardList }],
    },
  ],
};

function initialsFrom(name: string | undefined): string {
  if (!name) return "OG";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PortalLayout({ role }: PortalLayoutProps) {
  const navigate = useNavigate();
  const user = usePortalStore((state) => state.currentUser);
  const navSections = navByRole[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await localAuthService.logout();
    navigate(PORTAL_LOGIN_PATH);
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-offgrid-lime text-white shadow-sm"
        : "text-offgrid-cream/65 hover:bg-offgrid-cream/10 hover:text-offgrid-cream",
    );

  const sidebarBody = (onNavigate?: () => void) => (
    <>
      <button onClick={() => navigate("/")} className="inline-flex" aria-label="Go to storefront">
        <img src={LOGO_WORDMARK_WHITE} alt="OffGrid" className="h-8 w-auto" />
      </button>

      <div className="mt-8 rounded-2xl border border-offgrid-cream/10 bg-offgrid-cream/[0.04] p-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/70">
          {labelsByRole[role]}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-offgrid-lime font-display text-sm font-black text-white">
            {initialsFrom(user?.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-offgrid-cream">{user?.name ?? "Portal User"}</p>
            <p className="truncate text-xs text-offgrid-cream/55">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-cream/40">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === `/portal/${role}`}
                  onClick={onNavigate}
                  className={navItemClass}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 space-y-1 border-t border-offgrid-cream/10 pt-4">
        <button
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-offgrid-cream/65 transition-colors hover:bg-offgrid-cream/10 hover:text-offgrid-cream"
        >
          <ExternalLink className="h-4 w-4" />
          View storefront
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-offgrid-cream/65 transition-colors hover:bg-offgrid-cream/10 hover:text-offgrid-cream"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-offgrid-cream">
      {/* Desktop sidebar — truly fixed, never scrolls with the page.
          Uses position:fixed (not sticky) because the app sets overflow-x:hidden
          on html/body, which breaks position:sticky for descendants. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col overflow-y-auto border-r border-offgrid-cream/10 bg-offgrid-green px-5 py-6 lg:flex">
        {sidebarBody()}
      </aside>

      <div className="lg:pl-[264px]">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-offgrid-cream/10 bg-offgrid-green px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:hidden">
          <button onClick={() => navigate("/")} aria-label="Go to storefront">
            <img src={LOGO_WORDMARK_WHITE} alt="OffGrid" className="h-7 w-auto" />
          </button>
          <div className="flex items-center gap-3">
            <NotificationBell
              variant="dark"
              className="shrink-0"
              settingsHref={
                role === "admin"
                  ? "/portal/admin/settings"
                  : role === "staff"
                    ? "/portal/staff"
                    : undefined
              }
            />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-cream/60">
              {labelsByRole[role]}
            </span>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="grid h-9 w-9 place-items-center rounded-xl border border-offgrid-cream/20 text-offgrid-cream"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile slide-down drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 top-[57px] z-40 lg:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-offgrid-dark/60"
            />
            <div className="relative flex h-full max-h-[calc(100svh-57px)] w-[84%] max-w-xs flex-col overflow-y-auto border-r border-offgrid-cream/10 bg-offgrid-green px-5 py-6">
              {sidebarBody(() => setMobileOpen(false))}
            </div>
          </div>
        )}

        <main className="portal-surface min-h-screen min-w-0 bg-offgrid-cream">
          <div className="hidden lg:flex sticky top-0 z-30 items-center justify-end border-b border-offgrid-green/10 bg-offgrid-cream/95 px-8 py-3 backdrop-blur-sm">
            <NotificationBell
              className="shrink-0"
              settingsHref={
                role === "admin"
                  ? "/portal/admin/settings"
                  : role === "staff"
                    ? "/portal/staff"
                    : undefined
              }
            />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
