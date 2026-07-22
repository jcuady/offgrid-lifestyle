import type { ManagedCustomOrder, ManagedRetailOrder } from "@/src/store/usePortalStore";
import type { OrderStatus, PaymentStatus } from "@/src/types/commerce";

export type DashboardMode =
  | "today"
  | "week"
  | "month"
  | "this_month"
  | "6m"
  | "all"
  | "months"
  | "custom";

export type ChartGranularity = "hour" | "day" | "week" | "month";

export interface DashboardRange {
  from: Date;
  to: Date;
  label: string;
  granularity: ChartGranularity;
}

export interface PeriodBucket {
  key: string;
  label: string;
  sales: number;
  orders: number;
  retailSales: number;
  customSales: number;
}

export interface ItemSalesRow {
  productId: string;
  name: string;
  units: number;
  revenue: number;
  orders: number;
}

export interface CustomSalesRow {
  orderId: string;
  customerName: string;
  teamOrOrg: string;
  quantity: number;
  revenue: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  quoteReady: boolean;
}

export interface DashboardSummary {
  retailRevenue: number;
  customRevenue: number;
  totalRevenue: number;
  retailOrders: number;
  customOrders: number;
  totalOrders: number;
  aov: number;
  retailUnits: number;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

function parseYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  if (!Number.isFinite(y) || mo < 0 || mo > 11 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return dt;
}

/** `YYYY-MM` → { year, monthIndex } */
export function parseYearMonth(ym: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(ym.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  if (!Number.isFinite(year) || month < 0 || month > 11) return null;
  return { year, month };
}

export function formatYearMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function pickGranularity(from: Date, to: Date): ChartGranularity {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const days = ms / 86_400_000;
  if (days <= 1.5) return "hour";
  if (days <= 45) return "day";
  if (days <= 180) return "week";
  return "month";
}

function formatRangeLabel(from: Date, to: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const a = from.toLocaleDateString("en-PH", opts);
  const b = to.toLocaleDateString("en-PH", opts);
  return a === b ? a : `${a} – ${b}`;
}

export function listRecentMonths(count = 18, now = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(formatYearMonth(d));
  }
  return out;
}

export function resolveDashboardRange(input: {
  mode: DashboardMode;
  customFrom?: string;
  customTo?: string;
  months?: string[];
  now?: Date;
}): DashboardRange {
  const now = input.now ?? new Date();

  if (input.mode === "today") {
    const from = startOfLocalDay(now);
    const to = endOfLocalDay(now);
    return { from, to, label: "Today", granularity: "hour" };
  }
  if (input.mode === "week") {
    const to = endOfLocalDay(now);
    const from = startOfLocalDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    return { from, to, label: "Last 7 days", granularity: "day" };
  }
  if (input.mode === "month") {
    const to = endOfLocalDay(now);
    const from = startOfLocalDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
    return { from, to, label: "Last 30 days", granularity: "day" };
  }
  if (input.mode === "this_month") {
    const from = startOfMonth(now.getFullYear(), now.getMonth());
    const to = endOfLocalDay(now);
    return {
      from,
      to,
      label: now.toLocaleString("en-PH", { month: "long", year: "numeric" }),
      granularity: "day",
    };
  }
  if (input.mode === "6m") {
    const from = startOfMonth(now.getFullYear(), now.getMonth() - 5);
    const to = endOfLocalDay(now);
    return { from, to, label: "Last 6 months", granularity: "month" };
  }
  if (input.mode === "all") {
    const from = new Date(2020, 0, 1);
    const to = endOfLocalDay(now);
    return { from, to, label: "All time", granularity: "month" };
  }

  if (input.mode === "months") {
    const parsed = (input.months ?? [])
      .map(parseYearMonth)
      .filter((x): x is { year: number; month: number } => Boolean(x));
    if (parsed.length === 0) {
      return resolveDashboardRange({ mode: "this_month", now });
    }
    parsed.sort((a, b) => a.year - b.year || a.month - b.month);
    const first = parsed[0];
    const last = parsed[parsed.length - 1];
    const from = startOfMonth(first.year, first.month);
    let to = endOfMonth(last.year, last.month);
    if (to.getTime() > now.getTime()) to = endOfLocalDay(now);
    const labels = parsed.map(({ year, month }) =>
      new Date(year, month, 1).toLocaleString("en-PH", { month: "short", year: "numeric" }),
    );
    return {
      from,
      to,
      label: labels.length <= 3 ? labels.join(", ") : `${labels[0]} +${labels.length - 1} more`,
      granularity: pickGranularity(from, to),
    };
  }

  // custom
  const fromRaw = parseYmd(input.customFrom ?? "") ?? startOfLocalDay(now);
  const toRaw = parseYmd(input.customTo ?? "") ?? endOfLocalDay(now);
  let from = startOfLocalDay(fromRaw);
  let to = endOfLocalDay(toRaw);
  if (from.getTime() > to.getTime()) {
    const swap = from;
    from = startOfLocalDay(toRaw);
    to = endOfLocalDay(fromRaw);
  }
  return {
    from,
    to,
    label: formatRangeLabel(from, to),
    granularity: pickGranularity(from, to),
  };
}

function inWindow(iso: string, from: Date, to: Date): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  return t >= from.getTime() && t <= to.getTime();
}

export function customOrderRevenue(order: ManagedCustomOrder): number {
  const official = order.officialTotal?.amount;
  if (typeof official === "number" && Number.isFinite(official)) return official;
  const estimated = order.estimatedTotal?.amount;
  if (typeof estimated === "number" && Number.isFinite(estimated)) return estimated;
  return 0;
}

export function filterOrdersByRange(
  retail: ManagedRetailOrder[],
  custom: ManagedCustomOrder[],
  range: DashboardRange,
) {
  return {
    retail: retail.filter((o) => inWindow(o.createdAt, range.from, range.to)),
    custom: custom.filter((o) => inWindow(o.createdAt, range.from, range.to)),
  };
}

export function buildDashboardSummary(
  retail: ManagedRetailOrder[],
  custom: ManagedCustomOrder[],
): DashboardSummary {
  const retailRevenue = retail.reduce((s, o) => {
    const amt = o.total?.amount;
    return s + (typeof amt === "number" && Number.isFinite(amt) ? amt : 0);
  }, 0);
  const customRevenue = custom.reduce((s, o) => s + customOrderRevenue(o), 0);
  const totalOrders = retail.length + custom.length;
  const totalRevenue = retailRevenue + customRevenue;
  const retailUnits = retail.reduce((s, o) => {
    return (
      s +
      (o.lines ?? []).reduce((ls, line) => {
        const qty = Number(line?.quantity);
        return ls + (Number.isFinite(qty) && qty > 0 ? qty : 0);
      }, 0)
    );
  }, 0);
  return {
    retailRevenue,
    customRevenue,
    totalRevenue,
    retailOrders: retail.length,
    customOrders: custom.length,
    totalOrders,
    aov: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    retailUnits,
  };
}

type SalePoint = {
  amount: number;
  createdAt: string;
  channel: "retail" | "custom";
};

function collectPoints(retail: ManagedRetailOrder[], custom: ManagedCustomOrder[]): SalePoint[] {
  return [
    ...retail.map((o) => ({
      amount: typeof o.total?.amount === "number" && Number.isFinite(o.total.amount) ? o.total.amount : 0,
      createdAt: o.createdAt,
      channel: "retail" as const,
    })),
    ...custom.map((o) => ({
      amount: customOrderRevenue(o),
      createdAt: o.createdAt,
      channel: "custom" as const,
    })),
  ];
}

function bucketTotals(pts: SalePoint[]): Pick<PeriodBucket, "sales" | "orders" | "retailSales" | "customSales"> {
  return {
    sales: pts.reduce((s, p) => s + p.amount, 0),
    orders: pts.length,
    retailSales: pts.filter((p) => p.channel === "retail").reduce((s, p) => s + p.amount, 0),
    customSales: pts.filter((p) => p.channel === "custom").reduce((s, p) => s + p.amount, 0),
  };
}

export function buildSalesSeries(
  retail: ManagedRetailOrder[],
  custom: ManagedCustomOrder[],
  range: DashboardRange,
): PeriodBucket[] {
  const points = collectPoints(retail, custom).filter((p) => inWindow(p.createdAt, range.from, range.to));
  const granularity = range.granularity;

  if (granularity === "hour") {
    const buckets: PeriodBucket[] = [];
    for (let h = 0; h < 24; h += 2) {
      const pts = points.filter((p) => {
        const hr = new Date(p.createdAt).getHours();
        return hr >= h && hr < h + 2;
      });
      buckets.push({
        key: `h${h}`,
        label: `${String(h).padStart(2, "0")}:00`,
        ...bucketTotals(pts),
      });
    }
    return buckets;
  }

  if (granularity === "day") {
    const buckets: PeriodBucket[] = [];
    const cursor = startOfLocalDay(range.from);
    const end = startOfLocalDay(range.to);
    while (cursor.getTime() <= end.getTime()) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const d = cursor.getDate();
      const pts = points.filter((p) => {
        const dt = new Date(p.createdAt);
        return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
      });
      buckets.push({
        key: `${y}-${m}-${d}`,
        label: cursor.toLocaleString("en-PH", { month: "short", day: "numeric" }),
        ...bucketTotals(pts),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    // Keep chart readable for long day spans
    if (buckets.length > 31) {
      return buckets.filter((_, i) => i % Math.ceil(buckets.length / 24) === 0 || i === buckets.length - 1);
    }
    return buckets;
  }

  if (granularity === "week") {
    const buckets: PeriodBucket[] = [];
    const cursor = startOfLocalDay(range.from);
    // Align to Monday-ish local week start (Sun=0 → move back)
    cursor.setDate(cursor.getDate() - cursor.getDay());
    const end = range.to;
    while (cursor.getTime() <= end.getTime()) {
      const weekStart = new Date(cursor);
      const weekEnd = new Date(cursor);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const pts = points.filter((p) => {
        const t = new Date(p.createdAt).getTime();
        return t >= weekStart.getTime() && t <= Math.min(weekEnd.getTime(), end.getTime());
      });
      buckets.push({
        key: `w-${formatYmd(weekStart)}`,
        label: weekStart.toLocaleString("en-PH", { month: "short", day: "numeric" }),
        ...bucketTotals(pts),
      });
      cursor.setDate(cursor.getDate() + 7);
    }
    return buckets;
  }

  // month
  const buckets: PeriodBucket[] = [];
  const cursor = startOfMonth(range.from.getFullYear(), range.from.getMonth());
  const endMonth = startOfMonth(range.to.getFullYear(), range.to.getMonth());
  while (cursor.getTime() <= endMonth.getTime()) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const pts = points.filter((p) => {
      const dt = new Date(p.createdAt);
      return dt.getFullYear() === y && dt.getMonth() === m;
    });
    buckets.push({
      key: `${y}-${m}`,
      label: cursor.toLocaleString("en-PH", { month: "short", year: "2-digit" }),
      ...bucketTotals(pts),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}

function lineRevenue(line: {
  quantity?: number;
  priceSnapshot?: { amount?: number } | null;
  price?: number;
}): number {
  const qty = Number(line.quantity);
  const units = Number.isFinite(qty) && qty > 0 ? qty : 0;
  const snap = line.priceSnapshot?.amount;
  const unit =
    typeof snap === "number" && Number.isFinite(snap)
      ? snap
      : typeof line.price === "number" && Number.isFinite(line.price)
        ? line.price
        : 0;
  return unit * units;
}

export function buildItemSales(retail: ManagedRetailOrder[]): ItemSalesRow[] {
  const map = new Map<string, ItemSalesRow & { orderIds: Set<string> }>();
  for (const order of retail) {
    for (const line of order.lines ?? []) {
      if (!line || typeof line !== "object") continue;
      const id = String(line.productId || line.name || "unknown").trim() || "unknown";
      const name = String(line.name || id).trim() || "Untitled item";
      const row = map.get(id) ?? {
        productId: id,
        name,
        units: 0,
        revenue: 0,
        orders: 0,
        orderIds: new Set<string>(),
      };
      const qty = Number(line.quantity);
      row.units += Number.isFinite(qty) && qty > 0 ? qty : 0;
      row.revenue += lineRevenue(line);
      row.orderIds.add(order.id);
      row.orders = row.orderIds.size;
      map.set(id, row);
    }
  }
  return [...map.values()]
    .map(({ orderIds: _ids, ...rest }) => rest)
    .sort((a, b) => b.revenue - a.revenue || b.units - a.units);
}

export function buildCustomSalesRows(custom: ManagedCustomOrder[]): CustomSalesRow[] {
  return [...custom]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((o) => ({
      orderId: o.id,
      customerName: o.customerName,
      teamOrOrg: o.teamOrOrg || "—",
      quantity: o.quantity,
      revenue: customOrderRevenue(o),
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      quoteReady: Boolean(o.officialTotal?.amount),
    }));
}
