import { useMemo, useState } from "react";
import { ClipboardList, Search, Shield } from "lucide-react";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { localAuditService } from "@/src/services";
import { usePortalStore } from "@/src/store/usePortalStore";
import type { AuditAction } from "@/src/types/portal";
import {
  auditActionCategory,
  auditActionLabel,
  auditActionTone,
  formatAuditTimestamp,
} from "@/src/lib/portalAudit";
import { cn } from "@/src/lib/utils";

type AuditCategory = "all" | "auth" | "staff" | "orders" | "payments";

const CATEGORY_FILTERS: { id: AuditCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "auth", label: "Auth" },
  { id: "staff", label: "Staff" },
  { id: "orders", label: "Orders" },
  { id: "payments", label: "Payments" },
];

export function AdminAuditLogsPage() {
  const totalCount = usePortalStore((s) => s.auditLogs.length);
  const [category, setCategory] = useState<AuditCategory>("all");
  const [query, setQuery] = useState("");

  const logs = useMemo(
    () => localAuditService.list({ category, query }),
    [category, query, totalCount],
  );

  const categoryCounts = useMemo(() => {
    const all = usePortalStore.getState().auditLogs;
    return {
      all: all.length,
      auth: all.filter((e) => auditActionCategory(e.action as AuditAction) === "auth").length,
      staff: all.filter((e) => auditActionCategory(e.action as AuditAction) === "staff").length,
      orders: all.filter((e) => auditActionCategory(e.action as AuditAction) === "orders").length,
      payments: all.filter((e) => auditActionCategory(e.action as AuditAction) === "payments").length,
    };
  }, [totalCount]);

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="Append-only trail of sign-ins, staff changes, order updates, and payment settings. Retains the latest 500 events in this environment."
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter audit log by category">
          {CATEGORY_FILTERS.map((filter) => {
            const active = category === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCategory(filter.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
                  active
                    ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                    : "border-offgrid-green/20 text-offgrid-green/65 hover:border-offgrid-green/45",
                )}
              >
                {filter.label}
                <span className="ml-1.5 tabular-nums opacity-70">({categoryCounts[filter.id]})</span>
              </button>
            );
          })}
        </div>

        <label className="relative block min-w-[220px] flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actor, action, order…"
            className="w-full rounded-xl border border-offgrid-green/20 bg-white py-2.5 pl-10 pr-4 text-sm text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
          />
        </label>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-offgrid-green/25" />
          <p className="mt-4 font-display text-lg font-bold text-offgrid-green">No audit events yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-offgrid-green/60">
            Sign in, update an order, or create a staff account — activity will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-offgrid-green/10 bg-offgrid-green/[0.03] font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
                  <th className="px-4 py-3 sm:px-5">When</th>
                  <th className="px-4 py-3 sm:px-5">Actor</th>
                  <th className="px-4 py-3 sm:px-5">Action</th>
                  <th className="hidden px-4 py-3 md:table-cell sm:px-5">Target</th>
                  <th className="px-4 py-3 sm:px-5">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-offgrid-green/[0.06]">
                {logs.map((entry) => (
                  <tr key={entry.id} className="align-top hover:bg-offgrid-cream/40">
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-offgrid-green/60 sm:px-5">
                      {formatAuditTimestamp(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <p className="font-semibold text-offgrid-green">{entry.actorEmail}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-offgrid-green/45">
                        {entry.actorRole}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em]",
                          auditActionTone(entry.action as AuditAction),
                        )}
                      >
                        {auditActionLabel(entry.action as AuditAction)}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 font-mono text-xs text-offgrid-green/55 md:table-cell sm:px-5">
                      {entry.targetId ?? "—"}
                    </td>
                    <td className="max-w-md px-4 py-3.5 text-offgrid-green/80 sm:px-5">{entry.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-offgrid-green/10 bg-offgrid-green/[0.04] p-4 text-sm text-offgrid-green/70">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-offgrid-green" />
        <p>
          Database-ready: events mirror <code className="font-mono text-xs">og_audit_logs</code> with RLS restricted to
          admins. Swap <code className="font-mono text-xs">localAuditService</code> for a Supabase adapter when auth is
          connected.
        </p>
      </div>
    </div>
  );
}
