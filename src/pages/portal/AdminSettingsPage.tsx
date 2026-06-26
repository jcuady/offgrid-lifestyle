import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Check,
  CircleAlert,
  Database,
  ExternalLink,
  Home,
  Palette,
  QrCode,
  ScrollText,
  Users,
} from "lucide-react";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

const SHORTCUTS: { name: string; description: string; to: string; icon: typeof Home }[] = [
  { name: "Payments", description: "GCash QR and checkout instructions", to: "/portal/admin/payments", icon: QrCode },
  { name: "Homepage", description: "Hero, collections, and landing copy", to: "/portal/admin/homepage", icon: Home },
  { name: "Custom pages", description: "Ordering guide sections and templates", to: "/portal/admin/custom-pages", icon: Palette },
  { name: "Events", description: "Community events and spotlights", to: "/portal/admin/events", icon: CalendarDays },
  { name: "Staff", description: "Provision and manage staff logins", to: "/portal/admin/staff", icon: Users },
  { name: "Audit log", description: "Review portal activity history", to: "/portal/admin/audit-logs", icon: ScrollText },
];

interface ChecklistItem {
  label: string;
  done: boolean;
  detail: string;
}

export function AdminSettingsPage() {
  const user = usePortalStore((s) => s.currentUser);
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const staffAccounts = usePortalStore((s) => s.managedStaffAccounts);
  const auditCount = usePortalStore((s) => s.auditLogs.length);
  const products = useSiteContentStore((s) => s.products);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;

  const checklist = useMemo<ChecklistItem[]>(() => {
    const qrConfigured =
      Boolean(paymentSettings.gcashQrImageUrl) &&
      !paymentSettings.gcashQrImageUrl.includes("placehold.co");
    const activeProducts = products.filter((p) => p.status === "active").length;
    return [
      {
        label: "GCash QR configured",
        done: qrConfigured,
        detail: qrConfigured ? "Custom QR uploaded" : "Still using placeholder QR — upload in Payments",
      },
      {
        label: "Products published",
        done: activeProducts > 0,
        detail: activeProducts > 0 ? `${activeProducts} active product(s)` : "No active products yet",
      },
      {
        label: "Staff provisioned",
        done: staffAccounts.length > 0,
        detail: staffAccounts.length > 0 ? `${staffAccounts.length} staff account(s)` : "No staff accounts created",
      },
      {
        label: "Audit logging active",
        done: auditCount > 0,
        detail: auditCount > 0 ? `${auditCount} event(s) recorded` : "No activity recorded yet",
      },
      {
        label: "Database backend connected",
        done: Boolean(supabaseUrl),
        detail: supabaseUrl ? "Supabase URL detected" : "localStorage MVP — Supabase migration ready",
      },
    ];
  }, [paymentSettings.gcashQrImageUrl, products, staffAccounts.length, auditCount, supabaseUrl]);

  const completed = checklist.filter((c) => c.done).length;

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Your account, store configuration shortcuts, and production-readiness status for the OffGrid portal."
      />

      {/* Account */}
      <section className="mb-8 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Account</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-offgrid-green/8 font-display text-lg font-black text-offgrid-green">
            {(user?.name ?? "OG")
              .split(/\s+/)
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold text-offgrid-green">{user?.name ?? "Portal User"}</p>
            <p className="font-mono text-xs text-offgrid-green/55">{user?.email}</p>
          </div>
          <span className="ml-auto rounded-full border border-offgrid-lime/40 bg-offgrid-lime/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-green">
            {user?.role}
          </span>
        </div>
        <p className="mt-4 text-xs text-offgrid-green/55">
          Manage staff credentials in the Staff area. Self-service password changes arrive with production auth.
        </p>
      </section>

      {/* Configuration shortcuts */}
      <section className="mb-8">
        <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
          Configuration
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.to}
              to={shortcut.to}
              className="group flex items-start gap-3 rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-offgrid-lime/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-offgrid-green/8 text-offgrid-green transition-colors group-hover:bg-offgrid-lime/20">
                <shortcut.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-offgrid-green">{shortcut.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-offgrid-green/55">{shortcut.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Production readiness */}
      <section className="mb-8 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
              Production readiness
            </p>
            <h2 className="mt-1 font-display text-xl font-black text-offgrid-green">Launch checklist</h2>
          </div>
          <span className="rounded-full bg-offgrid-green/[0.06] px-3 py-1.5 font-mono text-xs font-bold tabular-nums text-offgrid-green">
            {completed}/{checklist.length} ready
          </span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {checklist.map((item) => (
            <li
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-offgrid-green/[0.07] bg-offgrid-cream/30 p-3.5"
            >
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                  item.done ? "bg-offgrid-lime text-white" : "bg-offgrid-gold/20 text-offgrid-gold",
                )}
              >
                {item.done ? <Check className="h-3 w-3" strokeWidth={3} /> : <CircleAlert className="h-3 w-3" />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-offgrid-green">{item.label}</p>
                <p className="text-xs text-offgrid-green/55">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Data & environment */}
      <section className="rounded-2xl border border-offgrid-green/10 bg-offgrid-green/[0.04] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-offgrid-green" />
          <div>
            <p className="font-display text-sm font-bold text-offgrid-green">Data &amp; environment</p>
            <p className="mt-1 text-sm leading-relaxed text-offgrid-green/65">
              This portal runs on a localStorage-backed store with service adapters ready for Supabase. Apply{" "}
              <code className="font-mono text-xs">supabase/migrations</code> to a dedicated OffGrid project, then set{" "}
              <code className="font-mono text-xs">VITE_SUPABASE_URL</code> to connect production auth, staff, and audit
              persistence.
            </p>
            <Link
              to="/"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/70 transition-colors hover:text-offgrid-green"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View storefront
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
