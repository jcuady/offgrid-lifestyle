import {
  buildDashboardSummary,
  buildItemSales,
  buildSalesSeries,
  filterOrdersByRange,
  formatYearMonth,
  pickGranularity,
  resolveDashboardRange,
} from "@/src/lib/dashboardMetrics";
import type { ManagedCustomOrder, ManagedRetailOrder } from "@/src/store/usePortalStore";
import type { Money } from "@/src/types/commerce";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const now = new Date(2026, 6, 22, 15, 0, 0); // Jul 22, 2026

const today = resolveDashboardRange({ mode: "today", now });
assert(today.granularity === "hour", "today → hour");
assert(today.label === "Today", "today label");

const week = resolveDashboardRange({ mode: "week", now });
assert(week.granularity === "day", "week → day");

const months = resolveDashboardRange({
  mode: "months",
  months: ["2026-06", "2026-07"],
  now,
});
assert(months.from.getMonth() === 5, "jun start");
assert(months.to.getMonth() === 6, "jul end capped");

const custom = resolveDashboardRange({
  mode: "custom",
  customFrom: "2026-07-01",
  customTo: "2026-07-10",
  now,
});
assert(custom.label.includes("Jul"), "custom label");
assert(pickGranularity(custom.from, custom.to) === "day", "10d → day");

const swapped = resolveDashboardRange({
  mode: "custom",
  customFrom: "2026-07-20",
  customTo: "2026-07-01",
  now,
});
assert(swapped.from.getTime() < swapped.to.getTime(), "swaps inverted dates");

const php = (n: number): Money => ({ amount: n, currency: "PHP" });

const retail = [
  {
    id: "OG-1",
    createdAt: "2026-07-22T08:00:00.000Z",
    total: php(1100),
    lines: [
      {
        lineItemId: "l1",
        productId: "p1",
        name: "OG VOYAGER",
        image: "",
        priceSnapshot: php(1100),
        size: "M",
        color: "Black",
        quantity: 1,
      },
    ],
  },
] as unknown as ManagedRetailOrder[];

const customOrders = [
  {
    id: "CO-1",
    createdAt: "2026-07-22T10:00:00.000Z",
    officialTotal: php(5000),
    estimatedTotal: php(4000),
    customerName: "Team A",
    teamOrOrg: "Team A",
    quantity: 12,
    status: "confirmed",
    paymentStatus: "deposit_paid",
  },
] as unknown as ManagedCustomOrder[];

const range = resolveDashboardRange({
  mode: "custom",
  customFrom: "2026-07-01",
  customTo: "2026-07-31",
  now,
});
const scoped = filterOrdersByRange(retail, customOrders, range);
const summary = buildDashboardSummary(scoped.retail, scoped.custom);
assert(summary.totalRevenue === 6100, `total ${summary.totalRevenue}`);
assert(summary.retailRevenue === 1100, "retail");
assert(summary.customRevenue === 5000, "custom prefers official");

const items = buildItemSales(scoped.retail);
assert(items[0]?.name === "OG VOYAGER" && items[0].units === 1, "item row");

const series = buildSalesSeries(scoped.retail, scoped.custom, {
  ...range,
  granularity: "day",
});
assert(series.some((b) => b.sales > 0), "series has sales");
assert(formatYearMonth(now) === "2026-07", "ym format");

// Legacy / partial line_items must not crash (months+ ranges pull older orders).
const brokenRetail = [
  {
    id: "OG-BROKEN",
    createdAt: "2026-07-05T08:00:00.000Z",
    total: php(0),
    lines: [
      { lineItemId: "x", productId: "p2", name: "Legacy Tee", quantity: 2 },
      null,
      { lineItemId: "y", productId: "p3", name: "Priced", priceSnapshot: php(500), quantity: 1 },
    ],
  },
] as unknown as ManagedRetailOrder[];
const brokenItems = buildItemSales(brokenRetail);
assert(brokenItems.find((r) => r.productId === "p2")?.revenue === 0, "missing snapshot → 0");
assert(brokenItems.find((r) => r.productId === "p3")?.revenue === 500, "priced row ok");
assert(brokenItems.find((r) => r.productId === "p2")?.units === 2, "qty still counted");

console.log("dashboardMetrics selfcheck ok");
