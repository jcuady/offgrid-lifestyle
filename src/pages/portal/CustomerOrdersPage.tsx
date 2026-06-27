import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Package2, ArrowRight, ShoppingBag, Sparkles, Truck, CheckCircle2 } from "lucide-react";
import { formatMoney } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import {
  formatEnumLabel,
  formatOrderStatus,
  formatOrderTimestamp,
  formatPaymentStatus,
  formatShippingLocality,
  hasOfficialCustomQuote,
  orderStatusClassCustomer,
  paymentStatusClassCustomer,
} from "@/src/lib/portal";
import { usePortalStore } from "@/src/store/usePortalStore";
import type { ManagedCustomOrder, ManagedRetailOrder } from "@/src/store/usePortalStore";
import { Button } from "@/src/components/ui/Button";
import { AccountLayout } from "@/src/components/account/AccountLayout";
import { OrderTracker } from "@/src/components/account/OrderTracker";

type OrderFilter = "all" | "retail" | "custom";

const FILTER_TABS: { id: OrderFilter; label: string; shortLabel: string }[] = [
  { id: "all", label: "All orders", shortLabel: "All" },
  { id: "retail", label: "Online", shortLabel: "Online" },
  { id: "custom", label: "Custom", shortLabel: "Custom" },
];

const metaLabel = "text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45";
const cardClass =
  "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/[0.07] transition-shadow hover:shadow-md";

export function CustomerOrdersPage() {
  const [filter, setFilter] = useState<OrderFilter>("all");
  const user = usePortalStore((state) => state.currentUser);
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);

  const ownsOrder = (order: { customerId: string | null; customerEmail: string }) =>
    !!user &&
    (order.customerId === user.id || order.customerEmail.toLowerCase() === user.email.toLowerCase());

  const scopedRetail = useMemo(() => retailOrders.filter(ownsOrder), [retailOrders, user]);
  const scopedCustom = useMemo(() => customOrders.filter(ownsOrder), [customOrders, user]);

  const counts = useMemo(
    () => ({
      all: scopedRetail.length + scopedCustom.length,
      retail: scopedRetail.length,
      custom: scopedCustom.length,
    }),
    [scopedRetail.length, scopedCustom.length],
  );

  const stats = useMemo(() => {
    const all = [...scopedRetail, ...scopedCustom];
    const active = all.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
    const delivered = all.filter((o) => o.status === "delivered").length;
    return { total: all.length, active, delivered };
  }, [scopedRetail, scopedCustom]);

  const mergedOrders = useMemo(() => {
    const entries = [
      ...scopedRetail.map((entry) => ({ kind: "retail" as const, entry })),
      ...scopedCustom.map((entry) => ({ kind: "custom" as const, entry })),
    ].sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());

    if (filter === "all") return entries;
    return entries.filter((entry) => entry.kind === filter);
  }, [filter, scopedRetail, scopedCustom]);

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <AccountLayout
      active="orders"
      eyebrow="Your account"
      title={firstName ? `Welcome back, ${firstName}` : "My orders"}
      description="Track your online purchases and custom requests in one place — delivery status, payment, and full details for every order."
    >
      {/* Snapshot stats */}
      {stats.total > 0 ? (
        <div className="mb-7 grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard icon={Package2} label="Total orders" value={stats.total} />
          <StatCard icon={Truck} label="In progress" value={stats.active} accent />
          <StatCard icon={CheckCircle2} label="Delivered" value={stats.delivered} />
        </div>
      ) : null}

      {/* Filter tabs */}
      <div className="rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-offgrid-green/10">
        <div className="grid grid-cols-3 gap-1">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl px-2 py-2 text-center transition-colors",
                  active
                    ? "bg-offgrid-green text-offgrid-cream shadow-sm"
                    : "text-offgrid-green/65 hover:bg-offgrid-cream hover:text-offgrid-green",
                )}
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    active ? "bg-offgrid-cream/15 text-offgrid-cream" : "bg-offgrid-green/[0.07] text-offgrid-green/70",
                  )}
                >
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders */}
      <div className="mt-6 space-y-5">
        {mergedOrders.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          mergedOrders.map((item) => (
            <Fragment key={item.entry.id}>
              {item.kind === "retail" ? (
                <RetailOrderCard order={item.entry} />
              ) : (
                <CustomOrderCard order={item.entry} />
              )}
            </Fragment>
          ))
        )}
      </div>
    </AccountLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Package2;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3.5 ring-1 sm:p-5",
        accent ? "bg-offgrid-lime/10 ring-offgrid-lime/30" : "bg-white ring-offgrid-green/[0.08]",
      )}
    >
      <Icon
        className={cn("h-4 w-4 sm:h-5 sm:w-5", accent ? "text-offgrid-green" : "text-offgrid-green/40")}
        strokeWidth={1.75}
      />
      <p className="mt-2 font-display text-2xl font-black tabular-nums text-offgrid-green sm:text-3xl">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">
        {label}
      </p>
    </div>
  );
}

function OrderCardShell({
  badge,
  id,
  status,
  paymentStatus,
  extraBadge,
  type,
  children,
  total,
  totalLabel,
  totalHint,
  to,
}: {
  badge: string;
  id: string;
  status: ManagedRetailOrder["status"];
  paymentStatus: ManagedRetailOrder["paymentStatus"];
  extraBadge?: ReactNode;
  type: "retail" | "custom";
  children?: ReactNode;
  total: string;
  totalLabel: string;
  totalHint?: string;
  to: string;
}) {
  return (
    <article className={cardClass}>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-offgrid-green/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-green/70">
            {badge}
          </span>
          <span className="break-all font-mono text-xs text-offgrid-green/55">{id}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={orderStatusClassCustomer(status)}>{formatOrderStatus(status)}</span>
          <span className={paymentStatusClassCustomer(paymentStatus)}>
            {formatPaymentStatus(paymentStatus)}
          </span>
          {extraBadge}
        </div>

        {/* Delivery tracker */}
        <div className="mt-5 rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/40 p-4">
          <OrderTracker status={status} type={type} />
        </div>

        {children}

        <div className="mt-5 flex flex-col gap-4 border-t border-offgrid-green/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={metaLabel}>{totalLabel}</p>
            <p className="mt-1 font-display text-2xl font-black tabular-nums tracking-tight text-offgrid-green">
              {total}
            </p>
            {totalHint ? <p className="mt-0.5 text-xs text-offgrid-green/50">{totalHint}</p> : null}
          </div>
          <Button variant="default" size="lg" className="w-full gap-2 shadow-sm sm:w-auto" asChild>
            <Link to={to}>
              View details
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function RetailOrderCard({ order }: { order: ManagedRetailOrder }) {
  const locality = formatShippingLocality(order.shippingInfo);
  return (
    <OrderCardShell
      badge="Online order"
      id={order.id}
      status={order.status}
      paymentStatus={order.paymentStatus}
      type="retail"
      total={formatMoney(order.total)}
      totalLabel="Order total"
      totalHint={`${order.lines.length} item${order.lines.length === 1 ? "" : "s"}`}
      to={`/account/orders/${order.id}`}
    >
      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className={metaLabel}>Placed</dt>
          <dd className="mt-1 text-sm font-medium text-offgrid-green">
            {formatOrderTimestamp(order.createdAt)}
          </dd>
        </div>
        <div>
          <dt className={metaLabel}>Ship to</dt>
          <dd className="mt-1 text-sm font-medium text-offgrid-green">{locality ?? "—"}</dd>
        </div>
        <div>
          <dt className={metaLabel}>Items</dt>
          <dd className="mt-2 flex flex-wrap items-center gap-2">
            {order.lines.slice(0, 4).map((line) => (
              <span
                key={line.lineItemId}
                className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-offgrid-green/10 bg-offgrid-cream/50"
                title={line.name}
              >
                <img src={line.image} alt="" className="h-full w-full object-cover" />
              </span>
            ))}
            {order.lines.length > 4 ? (
              <span className="text-xs font-semibold text-offgrid-green/55">
                +{order.lines.length - 4}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>
    </OrderCardShell>
  );
}

function CustomOrderCard({ order }: { order: ManagedCustomOrder }) {
  const quoted = hasOfficialCustomQuote(order.officialTotal);
  return (
    <OrderCardShell
      badge="Custom request"
      id={order.id}
      status={order.status}
      paymentStatus={order.paymentStatus}
      type="custom"
      extraBadge={
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            quoted
              ? "border-offgrid-green/25 bg-offgrid-lime/25 text-offgrid-green"
              : "border-offgrid-green/15 bg-offgrid-cream text-offgrid-green/70",
          )}
        >
          {quoted ? "Official quote" : "Quote pending"}
        </span>
      }
      total={
        quoted
          ? formatMoney(order.officialTotal!)
          : formatMoney(order.estimatedTotal ?? { amount: 0, currency: "PHP" })
      }
      totalLabel={quoted ? "Official total" : "Estimate"}
      totalHint={quoted ? undefined : "Pending final quote"}
      to={`/account/orders/${order.id}`}
    >
      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className={metaLabel}>Submitted</dt>
          <dd className="mt-1 text-sm font-medium text-offgrid-green">
            {formatOrderTimestamp(order.createdAt)}
          </dd>
        </div>
        <div>
          <dt className={metaLabel}>Quantity</dt>
          <dd className="mt-1 text-sm font-medium text-offgrid-green">{order.quantity}</dd>
        </div>
        <div>
          <dt className={metaLabel}>Print method</dt>
          <dd className="mt-1 text-sm font-medium text-offgrid-green">
            {formatEnumLabel(order.printMethod ?? undefined)}
          </dd>
        </div>
      </dl>
    </OrderCardShell>
  );
}

function EmptyState({ filter }: { filter: OrderFilter }) {
  const copy =
    filter === "custom"
      ? "No custom requests yet. Start a custom order and our team will quote it for you."
      : filter === "retail"
        ? "No online orders yet. Browse the shop to place your first order."
        : "When you check out from the shop or submit a custom order, it will show up here.";

  return (
    <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-offgrid-green/5 text-offgrid-green">
        <Package2 className="h-7 w-7 opacity-70" strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-xl font-bold text-offgrid-green">No orders yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-offgrid-green/60">{copy}</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="default" size="lg" className="w-full gap-2 sm:w-auto" asChild>
          <Link to="/shop">
            <ShoppingBag className="h-4 w-4" />
            Browse shop
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto" asChild>
          <Link to="/custom/order">
            <Sparkles className="h-4 w-4" />
            Custom order
          </Link>
        </Button>
      </div>
    </div>
  );
}
