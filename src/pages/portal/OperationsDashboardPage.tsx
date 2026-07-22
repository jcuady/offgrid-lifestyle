import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarRange,
  ClipboardCheck,
  Factory,
  PackageCheck,
  Shirt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { UserRole } from "@/src/store/usePortalStore";
import { usePortalStore } from "@/src/store/usePortalStore";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { useEnsureOrdersLoaded } from "@/src/hooks/useEnsureOrdersLoaded";
import { NotificationSettings } from "@/src/components/settings/NotificationSettings";
import { ChangePasswordForm } from "@/src/components/account/ChangePasswordForm";
import { ChangeEmailForm } from "@/src/components/account/ChangeEmailForm";
import { cn } from "@/src/lib/utils";
import {
  buildCustomSalesRows,
  buildDashboardSummary,
  buildItemSales,
  buildSalesSeries,
  filterOrdersByRange,
  formatYmd,
  formatYearMonth,
  listRecentMonths,
  resolveDashboardRange,
  type DashboardMode,
} from "@/src/lib/dashboardMetrics";
import {
  formatOrderStatus,
  formatOrderTimestamp,
  formatPaymentStatus,
  hasOfficialCustomQuote,
} from "@/src/lib/portal";

interface OperationsDashboardPageProps {
  role: UserRole;
}

const titleByRole: Record<UserRole, string> = {
  admin: "Command center",
  staff: "Staff dashboard",
  customer: "Dashboard",
};

const PRESETS: { value: DashboardMode; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "this_month", label: "This month" },
  { value: "6m", label: "6 months" },
  { value: "all", label: "All time" },
  { value: "months", label: "Pick months" },
  { value: "custom", label: "Custom dates" },
];

function peso(n: number): string {
  return `₱${n.toLocaleString("en-PH")}`;
}

function monthChipLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-PH", { month: "short", year: "numeric" });
}

export function OperationsDashboardPage({ role }: OperationsDashboardPageProps) {
  useEnsureOrdersLoaded();
  const navigate = useNavigate();
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);

  const now = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<DashboardMode>("week");
  const [customFrom, setCustomFrom] = useState(() => formatYmd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)));
  const [customTo, setCustomTo] = useState(() => formatYmd(now));
  const [selectedMonths, setSelectedMonths] = useState<string[]>(() => [formatYearMonth(now)]);
  const monthChoices = useMemo(() => listRecentMonths(18, now), [now]);

  const range = useMemo(
    () =>
      resolveDashboardRange({
        mode,
        customFrom,
        customTo,
        months: selectedMonths,
        now,
      }),
    [mode, customFrom, customTo, selectedMonths, now],
  );

  const scoped = useMemo(
    () => filterOrdersByRange(retailOrders, customOrders, range),
    [retailOrders, customOrders, range],
  );

  const summary = useMemo(
    () => buildDashboardSummary(scoped.retail, scoped.custom),
    [scoped.retail, scoped.custom],
  );

  const series = useMemo(
    () => buildSalesSeries(scoped.retail, scoped.custom, range),
    [scoped.retail, scoped.custom, range],
  );

  const itemSales = useMemo(() => buildItemSales(scoped.retail), [scoped.retail]);
  const customRows = useMemo(() => buildCustomSalesRows(scoped.custom), [scoped.custom]);

  const allOrders = useMemo(
    () =>
      [...retailOrders, ...customOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [retailOrders, customOrders],
  );

  const pendingCount = allOrders.filter((o) => o.status === "pending_deposit").length;
  const productionCount = allOrders.filter((o) => o.status === "in_production").length;
  const shippedCount = allOrders.filter((o) => o.status === "shipped" || o.status === "delivered").length;
  const unpaidCount = allOrders.filter(
    (o) => o.paymentStatus === "unpaid" || o.paymentStatus === "deposit_paid",
  ).length;

  const needsAttention = allOrders
    .filter((o) => {
      const quoteGap = "officialTotal" in o && !hasOfficialCustomQuote(o.officialTotal);
      return (
        o.status === "pending_deposit" ||
        o.status === "confirmed" ||
        o.paymentStatus === "unpaid" ||
        quoteGap
      );
    })
    .slice(0, 8);

  const maxSales = Math.max(...series.map((e) => e.sales), 1);

  const toggleMonth = (ym: string) => {
    setSelectedMonths((prev) => {
      if (prev.includes(ym)) {
        const next = prev.filter((x) => x !== ym);
        return next.length === 0 ? [ym] : next;
      }
      return [...prev, ym].sort();
    });
  };

  const controlClass =
    "min-h-11 rounded-xl border border-offgrid-green/20 bg-white px-3 py-2 text-sm font-medium text-offgrid-green shadow-sm focus:border-offgrid-lime focus:outline-none focus:ring-2 focus:ring-offgrid-lime/30";

  return (
    <div className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PortalPageHeader
          eyebrow={role === "admin" ? "OFF GRID · Ops" : "Staff workspace"}
          title={titleByRole[role]}
          description="Summary and line-level sales for retail + custom — pick days, weeks, months, or any date range."
        />
        <button
          type="button"
          onClick={() => navigate(`/portal/${role}/orders`)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-offgrid-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-offgrid-cream transition-colors hover:bg-offgrid-dark sm:w-auto"
        >
          Orders board
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <section className="mt-6 rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarRange className="h-4 w-4 text-offgrid-green/45" aria-hidden />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
            Date range
          </p>
          <p className="ml-auto text-xs text-offgrid-green/55">{range.label}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={cn(
                "min-h-10 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
                mode === opt.value
                  ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                  : "border-offgrid-green/15 bg-offgrid-cream/40 text-offgrid-green/70 hover:border-offgrid-lime/50 hover:text-offgrid-green",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {mode === "custom" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="min-w-0 text-xs font-medium text-offgrid-green/70">
              From
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                className={cn("mt-1 w-full", controlClass)}
              />
            </label>
            <label className="min-w-0 text-xs font-medium text-offgrid-green/70">
              To
              <input
                type="date"
                value={customTo}
                min={customFrom}
                onChange={(e) => setCustomTo(e.target.value)}
                className={cn("mt-1 w-full", controlClass)}
              />
            </label>
          </div>
        ) : null}

        {mode === "months" ? (
          <div className="mt-4">
            <p className="text-xs text-offgrid-green/55">Select one or more months (totals combine across selection).</p>
            <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
              {monthChoices.map((ym) => {
                const active = selectedMonths.includes(ym);
                return (
                  <button
                    key={ym}
                    type="button"
                    onClick={() => toggleMonth(ym)}
                    className={cn(
                      "min-h-10 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "border-offgrid-lime bg-offgrid-lime/25 text-offgrid-green"
                        : "border-offgrid-green/15 bg-white text-offgrid-green/65 hover:border-offgrid-green/30",
                    )}
                  >
                    {monthChipLabel(ym)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total sales",
            value: peso(summary.totalRevenue),
            hint: `${summary.totalOrders} orders · AOV ${peso(summary.aov)}`,
            icon: Wallet,
          },
          {
            label: "Retail sales",
            value: peso(summary.retailRevenue),
            hint: `${summary.retailOrders} orders · ${summary.retailUnits} units`,
            icon: Shirt,
          },
          {
            label: "Custom sales",
            value: peso(summary.customRevenue),
            hint: `${summary.customOrders} requests`,
            icon: TrendingUp,
          },
          {
            label: "Needs pay",
            value: String(unpaidCount),
            hint: "Unpaid or deposit (all-time queue)",
            icon: ClipboardCheck,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm ring-1 ring-offgrid-green/[0.04] sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                {card.label}
              </p>
              <span className="inline-flex rounded-lg bg-offgrid-green/8 p-2 text-offgrid-green">
                <card.icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-black tracking-tight text-offgrid-green sm:text-3xl">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-offgrid-green/50">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending review", value: pendingCount, icon: ClipboardCheck, tone: "text-offgrid-gold" },
          { label: "In production", value: productionCount, icon: Factory, tone: "text-offgrid-green" },
          { label: "Shipped / delivered", value: shippedCount, icon: PackageCheck, tone: "text-offgrid-lime" },
        ].map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/50 px-4 py-3"
          >
            <card.icon className={cn("h-5 w-5 shrink-0", card.tone)} aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                {card.label}
              </p>
              <p className="font-display text-xl font-bold text-offgrid-green">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-offgrid-green sm:text-xl">Sales trend</h2>
            <p className="text-xs text-offgrid-green/55">
              {range.granularity} buckets · retail + custom · {range.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-offgrid-green" /> Retail
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-offgrid-lime" /> Custom
            </span>
          </div>
        </div>
        <div className="mt-5 flex h-56 items-end gap-1 overflow-x-auto pb-1 sm:gap-1.5">
          {series.map((entry) => {
            const retailH = entry.sales > 0 ? (entry.retailSales / maxSales) * 100 : 0;
            const customH = entry.sales > 0 ? (entry.customSales / maxSales) * 100 : 0;
            return (
              <div key={entry.key} className="flex min-w-[2.5rem] flex-1 flex-col items-center sm:min-w-[2.75rem]">
                <div
                  className="flex h-44 w-full max-w-[3rem] items-end justify-center gap-px rounded-lg bg-offgrid-green/[0.06] px-0.5"
                  title={`${entry.label}: ${peso(entry.sales)} (${entry.orders} orders)`}
                >
                  <div
                    className="w-1/2 max-w-[1.1rem] rounded-t-sm bg-offgrid-green"
                    style={{ height: `${Math.max(entry.retailSales > 0 ? 4 : 0, retailH)}%` }}
                  />
                  <div
                    className="w-1/2 max-w-[1.1rem] rounded-t-sm bg-offgrid-lime"
                    style={{ height: `${Math.max(entry.customSales > 0 ? 4 : 0, customH)}%` }}
                  />
                </div>
                <p className="mt-2 max-w-full truncate text-[10px] font-semibold uppercase tracking-[0.06em] text-offgrid-green/45">
                  {entry.label}
                </p>
                <span className="mt-0.5 rounded-full bg-offgrid-cream px-1.5 py-0.5 text-[9px] font-semibold text-offgrid-green">
                  {entry.orders}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-display text-lg font-bold text-offgrid-green sm:text-xl">Retail by item</h2>
          <p className="text-xs text-offgrid-green/55">
            Every SKU sold in range · {itemSales.length} product{itemSales.length === 1 ? "" : "s"}
          </p>
          {itemSales.length === 0 ? (
            <p className="mt-6 text-sm text-offgrid-green/55">No retail line items in this window.</p>
          ) : (
            <div className="mt-4 -mx-1 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-offgrid-green/10 text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                    <th className="px-2 py-2 font-semibold">Item</th>
                    <th className="px-2 py-2 font-semibold">Units</th>
                    <th className="px-2 py-2 font-semibold">Orders</th>
                    <th className="px-2 py-2 text-right font-semibold">Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-offgrid-green/[0.06]">
                  {itemSales.map((row) => (
                    <tr key={row.productId}>
                      <td className="max-w-[12rem] truncate px-2 py-2.5 font-medium text-offgrid-green sm:max-w-none">
                        {row.name}
                      </td>
                      <td className="px-2 py-2.5 text-offgrid-green/70">{row.units}</td>
                      <td className="px-2 py-2.5 text-offgrid-green/70">{row.orders}</td>
                      <td className="px-2 py-2.5 text-right font-semibold text-offgrid-green">{peso(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-offgrid-green/15 text-sm font-bold text-offgrid-green">
                    <td className="px-2 py-3">Total</td>
                    <td className="px-2 py-3">{summary.retailUnits}</td>
                    <td className="px-2 py-3">{summary.retailOrders}</td>
                    <td className="px-2 py-3 text-right">{peso(summary.retailRevenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-display text-lg font-bold text-offgrid-green sm:text-xl">Custom orders</h2>
          <p className="text-xs text-offgrid-green/55">
            Requests in range · {customRows.length} · sales {peso(summary.customRevenue)}
          </p>
          {customRows.length === 0 ? (
            <p className="mt-6 text-sm text-offgrid-green/55">No custom orders in this window.</p>
          ) : (
            <div className="mt-4 -mx-1 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-offgrid-green/10 text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                    <th className="px-2 py-2 font-semibold">Order</th>
                    <th className="px-2 py-2 font-semibold">Team</th>
                    <th className="px-2 py-2 font-semibold">Qty</th>
                    <th className="px-2 py-2 font-semibold">Status</th>
                    <th className="px-2 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-offgrid-green/[0.06]">
                  {customRows.map((row) => (
                    <tr key={row.orderId}>
                      <td className="px-2 py-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/portal/${role}/orders/${encodeURIComponent(row.orderId)}`)
                          }
                          className="font-mono text-xs font-semibold text-offgrid-green underline decoration-offgrid-lime/40 underline-offset-2 hover:decoration-offgrid-lime"
                        >
                          {row.orderId}
                        </button>
                        <p className="mt-0.5 text-[11px] text-offgrid-green/50">{row.customerName}</p>
                      </td>
                      <td className="max-w-[8rem] truncate px-2 py-2.5 text-offgrid-green/70">{row.teamOrOrg}</td>
                      <td className="px-2 py-2.5 text-offgrid-green/70">{row.quantity}</td>
                      <td className="px-2 py-2.5">
                        <p className="text-[11px] font-medium text-offgrid-green">{formatOrderStatus(row.status)}</p>
                        <p className="text-[10px] text-offgrid-green/50">
                          {formatPaymentStatus(row.paymentStatus)}
                          {row.quoteReady ? " · Quoted" : " · Quote pending"}
                        </p>
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-offgrid-green">{peso(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-offgrid-green/15 text-sm font-bold text-offgrid-green">
                    <td className="px-2 py-3" colSpan={4}>
                      Total
                    </td>
                    <td className="px-2 py-3 text-right">{peso(summary.customRevenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-offgrid-green sm:text-xl">Needs attention</h2>
            <p className="text-xs text-offgrid-green/55">
              Live queue · {allOrders.length} total orders in system
            </p>
          </div>
        </div>
        {needsAttention.length === 0 ? (
          <p className="mt-6 text-sm text-offgrid-green/55">Queue is clear for now.</p>
        ) : (
          <ul className="mt-4 divide-y divide-offgrid-green/[0.07]">
            {needsAttention.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/portal/${role}/orders/${encodeURIComponent(order.id)}`)}
                  className="flex w-full min-h-11 flex-col gap-1 py-3 text-left transition-colors hover:bg-offgrid-cream/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-offgrid-green">{order.id}</p>
                    <p className="truncate text-xs text-offgrid-green/55">
                      {order.customerName} · {formatOrderTimestamp(order.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
                    {formatOrderStatus(order.status)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {role === "staff" ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <ChangeEmailForm />
          <ChangePasswordForm />
          <div className="lg:col-span-2">
            <NotificationSettings />
          </div>
        </div>
      ) : null}
    </div>
  );
}
