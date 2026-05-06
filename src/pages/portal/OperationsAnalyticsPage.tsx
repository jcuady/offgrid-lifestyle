import { useMemo } from "react";
import type { UserRole } from "@/src/store/usePortalStore";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useStore } from "@/src/store/store";

interface OperationsAnalyticsPageProps {
  role: UserRole;
}

interface MonthlyPoint {
  label: string;
  sales: number;
  orders: number;
}

function buildMonthlySeries(totals: { amount: number; createdAt: string }[]): MonthlyPoint[] {
  const now = new Date();
  const keys: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    keys.push({ key, label: d.toLocaleString("en-PH", { month: "short" }) });
  }

  return keys.map(({ key, label }) => {
    const [yearStr, monthStr] = key.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const scoped = totals.filter((entry) => {
      const dt = new Date(entry.createdAt);
      return dt.getFullYear() === year && dt.getMonth() === month;
    });
    return {
      label,
      sales: scoped.reduce((sum, entry) => sum + entry.amount, 0),
      orders: scoped.length,
    };
  });
}

export function OperationsAnalyticsPage({ role }: OperationsAnalyticsPageProps) {
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);
  const cart = useStore((state) => state.cart);

  const monthly = useMemo(() => {
    const totals = [
      ...retailOrders.map((entry) => ({ amount: entry.total.amount, createdAt: entry.createdAt })),
      ...customOrders.map((entry) => ({
        amount: entry.estimatedTotal?.amount ?? 0,
        createdAt: entry.createdAt,
      })),
    ];
    return buildMonthlySeries(totals);
  }, [retailOrders, customOrders]);

  const maxSales = Math.max(...monthly.map((entry) => entry.sales), 1);
  const maxOrders = Math.max(...monthly.map((entry) => entry.orders), 1);
  const totalSales = monthly.reduce((sum, entry) => sum + entry.sales, 0);
  const totalOrders = monthly.reduce((sum, entry) => sum + entry.orders, 0);
  const cartUnits = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        {role === "admin" ? "Admin Analytics" : "Staff Analytics"}
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">Sales Overview</h1>
      <p className="mt-2 text-sm text-offgrid-green/60">
        KPI cards and monthly trend charts from live portal/storefront data.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <p className="text-xs uppercase tracking-[0.12em] text-offgrid-green/45">6-Month Sales</p>
          <p className="mt-2 text-2xl font-display font-black text-offgrid-green">₱{totalSales.toLocaleString("en-PH")}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <p className="text-xs uppercase tracking-[0.12em] text-offgrid-green/45">Orders</p>
          <p className="mt-2 text-2xl font-display font-black text-offgrid-green">{totalOrders}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <p className="text-xs uppercase tracking-[0.12em] text-offgrid-green/45">Retail Orders</p>
          <p className="mt-2 text-2xl font-display font-black text-offgrid-green">{retailOrders.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <p className="text-xs uppercase tracking-[0.12em] text-offgrid-green/45">Current Cart Units</p>
          <p className="mt-2 text-2xl font-display font-black text-offgrid-green">{cartUnits}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
        <h2 className="text-xl font-display font-bold text-offgrid-green">Monthly Sales (Last 6 Months)</h2>
        <p className="mt-1 text-xs text-offgrid-green/55">
          Green bars show sales amount; lime chips show order count per month.
        </p>
        <div className="mt-6 grid grid-cols-6 gap-3">
          {monthly.map((entry) => (
            <div key={entry.label} className="flex flex-col items-center">
              <div className="relative flex h-48 w-full items-end justify-center rounded-xl bg-offgrid-green/5">
                <div
                  className="w-7 rounded-t-lg bg-offgrid-green"
                  style={{ height: `${(entry.sales / maxSales) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">
                {entry.label}
              </p>
              <p className="text-[11px] text-offgrid-green/60">₱{entry.sales.toLocaleString("en-PH")}</p>
              <div
                className="mt-1 rounded-full bg-offgrid-lime/25 px-2 py-0.5 text-[10px] font-semibold text-offgrid-green"
                style={{ opacity: Math.max(0.35, entry.orders / maxOrders) }}
              >
                {entry.orders} order(s)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
