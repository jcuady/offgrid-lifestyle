import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Package,
  CalendarDays,
  Palette,
  BarChart3,
} from "lucide-react";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { cn } from "@/src/lib/utils";
import { usePortalStore, type UserRole } from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";

interface PortalLayoutProps {
  role: Exclude<UserRole, "customer">;
}

const labelsByRole: Record<Exclude<UserRole, "customer">, string> = {
  admin: "Admin Console",
  staff: "Staff Workspace",
};

const navByRole: Record<Exclude<UserRole, "customer">, { name: string; to: string; icon: typeof LayoutDashboard }[]> = {
  admin: [
    { name: "Dashboard", to: "/portal/admin", icon: LayoutDashboard },
    { name: "Orders", to: "/portal/admin/orders", icon: ClipboardList },
    { name: "Products", to: "/portal/admin/products", icon: Package },
    { name: "Events", to: "/portal/admin/events", icon: CalendarDays },
    { name: "Custom Content", to: "/portal/admin/custom-content", icon: Palette },
    { name: "Analytics", to: "/portal/admin/analytics", icon: BarChart3 },
  ],
  staff: [
    { name: "Dashboard", to: "/portal/staff", icon: LayoutDashboard },
    { name: "Orders", to: "/portal/staff/orders", icon: ClipboardList },
    { name: "Analytics", to: "/portal/staff/analytics", icon: BarChart3 },
  ],
};

export function PortalLayout({ role }: PortalLayoutProps) {
  const navigate = useNavigate();
  const user = usePortalStore((state) => state.currentUser);
  const navItems = navByRole[role];

  return (
    <div className="min-h-screen bg-offgrid-dark">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-r border-offgrid-cream/10 bg-offgrid-green px-5 py-6 lg:sticky lg:top-0 lg:h-screen">
          <button onClick={() => navigate("/")} className="mb-10 inline-flex">
            <img src={LOGO_WORDMARK_WHITE} alt="OffGrid" className="h-8 w-auto" />
          </button>

          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-offgrid-cream/50">
              {labelsByRole[role]}
            </p>
            <p className="mt-2 text-lg font-display font-bold text-offgrid-cream">
              {user?.name ?? "Portal User"}
            </p>
            <p className="text-xs text-offgrid-cream/60">{user?.email}</p>
          </div>

          <nav className="space-y-2 hidden lg:block">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === `/portal/${role}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-offgrid-lime text-offgrid-dark"
                      : "text-offgrid-cream/70 hover:bg-offgrid-cream/10 hover:text-offgrid-cream",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <nav className="mb-6 grid grid-cols-2 gap-2 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === `/portal/${role}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                    isActive
                      ? "bg-offgrid-lime text-offgrid-dark"
                      : "text-offgrid-cream/70 border border-offgrid-cream/20",
                  )
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 border-t border-offgrid-cream/10 pt-6">
            <button
              onClick={() => {
                localAuthService.logout();
                navigate("/login");
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-offgrid-cream/70 transition-colors hover:bg-offgrid-cream/10 hover:text-offgrid-cream"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="bg-offgrid-cream">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
