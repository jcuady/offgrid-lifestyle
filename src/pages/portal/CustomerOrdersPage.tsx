import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { formatMoney } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import {
  formatEnumLabel,
  formatOrderStatus,
  formatOrderTimestamp,
  formatPaymentMethodLabel,
  formatPaymentStatus,
  formatShippingLocality,
  hasOfficialCustomQuote,
  orderStatusClassCustomer,
  paymentStatusClassCustomer,
} from "@/src/lib/portal";
import { accountPriceDisplay } from "@/src/lib/brandLayout";
import { usePortalStore } from "@/src/store/usePortalStore";
import { Button } from "@/src/components/ui/Button";
import { AccountPageShell } from "@/src/components/account/AccountPageShell";

type OrderFilter = "all" | "retail" | "custom";

const FILTER_TABS: { id: OrderFilter; label: string; shortLabel: string }[] = [
  { id: "all", label: "All orders", shortLabel: "All" },
  { id: "retail", label: "Retail", shortLabel: "Retail" },
  { id: "custom", label: "Custom", shortLabel: "Custom" },
];

export function CustomerOrdersPage() {
  const [filter, setFilter] = useState<OrderFilter>("all");
  const user = usePortalStore((state) => state.currentUser);
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);

  const scopedRetail = useMemo(
    () =>
      retailOrders.filter(
        (order) =>
          !!user && (order.customerId === user.id || order.customerEmail.toLowerCase() === user.email.toLowerCase()),
      ),
    [retailOrders, user],
  );
  const scopedCustom = useMemo(
    () =>
      customOrders.filter(
        (order) =>
          !!user &&
          (order.customerId === user.id || order.customerEmail.toLowerCase() === user.email.toLowerCase()),
      ),
    [customOrders, user],
  );

  const counts = useMemo(
    () => ({
      all: scopedRetail.length + scopedCustom.length,
      retail: scopedRetail.length,
      custom: scopedCustom.length,
    }),
    [scopedRetail.length, scopedCustom.length],
  );

  const mergedOrders = useMemo(() => {
    const entries = [
      ...scopedRetail.map((entry) => ({ kind: "retail" as const, entry })),
      ...scopedCustom.map((entry) => ({ kind: "custom" as const, entry })),
    ].sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());

    if (filter === "all") return entries;
    return entries.filter((entry) => entry.kind === filter);
  }, [filter, scopedRetail, scopedCustom]);

  const metaLabelClass =
    "text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45";

  return (
    <AccountPageShell
      title="My orders"
      description="Track retail purchases and custom requests in one timeline. Full delivery and payment details are on each order page."
      headerExtra={
        user?.email ? (
          <p className="mt-4 break-all font-mono text-xs text-offgrid-cream/50 sm:text-sm">{user.email}</p>
        ) : null
      }
      contentClassName="-mt-10 sm:-mt-12"
    >
      <div className="rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-offgrid-green/10">
        <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:gap-1">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "flex min-h-[3rem] flex-col items-center justify-center rounded-xl px-2 py-2.5 text-center transition-colors sm:min-h-0 sm:flex-1 sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5",
                  active
                    ? "bg-offgrid-green text-offgrid-cream shadow-sm"
                    : "text-offgrid-green/65 hover:bg-offgrid-cream hover:text-offgrid-green",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] sm:text-xs sm:tracking-[0.12em]">
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums sm:mt-0",
                    active ? "bg-offgrid-cream/15 text-offgrid-cream" : "bg-offgrid-green/8 text-offgrid-green/70",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
        {mergedOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white px-6 py-12 text-center shadow-sm sm:px-8 sm:py-14">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-offgrid-green/5 text-offgrid-green">
              <Package className="h-7 w-7 opacity-70" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-xl font-bold text-offgrid-green">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-offgrid-green/60">
              When you check out from the shop or submit a custom order, it will show up here.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Button variant="default" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/shop">Browse shop</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/custom/order">Custom order</Link>
              </Button>
            </div>
          </div>
        ) : (
          mergedOrders.map((item) => {
            if (item.kind === "retail") {
              const order = item.entry;
              const locality = formatShippingLocality(order.shippingInfo);
              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/[0.07]"
                >
                  <div className="p-5 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={metaLabelClass}>Retail order</span>
                          <span className="hidden h-px w-6 bg-offgrid-green/15 sm:inline-block" aria-hidden />
                          <span className="break-all font-mono text-xs font-medium text-offgrid-green/70 sm:text-sm">
                            {order.id}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={cn(orderStatusClassCustomer(order.status))}>
                            {formatOrderStatus(order.status)}
                          </span>
                          <span className={cn(paymentStatusClassCustomer(order.paymentStatus))}>
                            {formatPaymentStatus(order.paymentStatus)}
                          </span>
                        </div>

                        <dl className="mt-5 grid gap-4 border-t border-offgrid-green/10 pt-5 sm:mt-6 sm:grid-cols-2 sm:pt-6">
                          <div>
                            <dt className={metaLabelClass}>Placed</dt>
                            <dd className="mt-1 text-sm font-medium text-offgrid-green">
                              {formatOrderTimestamp(order.createdAt)}
                            </dd>
                          </div>
                          <div>
                            <dt className={metaLabelClass}>Payment</dt>
                            <dd className="mt-1 text-sm font-medium text-offgrid-green">
                              {formatPaymentMethodLabel(order.paymentMethod)}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className={metaLabelClass}>Destination</dt>
                            <dd className="mt-1 text-sm font-medium text-offgrid-green">{locality ?? "—"}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="flex w-full shrink-0 flex-col gap-4 border-t border-offgrid-green/10 pt-5 lg:w-56 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                        <div className="lg:text-right">
                          <p className={metaLabelClass}>Order total</p>
                          <p className={accountPriceDisplay}>{formatMoney(order.total)}</p>
                          <p className="mt-1 text-xs text-offgrid-green/50">
                            {order.lines.length} line{order.lines.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <Button variant="default" size="lg" className="w-full gap-2 shadow-md" asChild>
                          <Link to={`/account/orders/${order.id}`}>
                            View details
                            <ArrowRight className="h-4 w-4 shrink-0" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-offgrid-green/10 pt-5 sm:mt-6 sm:gap-3 sm:pt-6">
                      {order.lines.slice(0, 5).map((line) => (
                        <div
                          key={line.lineItemId}
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50 shadow-sm sm:h-16 sm:w-16"
                          title={line.name}
                        >
                          <img src={line.image} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {order.lines.length > 5 ? (
                        <span className="rounded-xl border border-offgrid-green/15 bg-offgrid-cream/60 px-3 py-2 text-xs font-semibold text-offgrid-green/70">
                          +{order.lines.length - 5} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            }

            const order = item.entry;
            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/[0.07]"
              >
                <div className="p-5 sm:p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={metaLabelClass}>Custom request</span>
                        <span className="hidden h-px w-6 bg-offgrid-green/15 sm:inline-block" aria-hidden />
                        <span className="break-all font-mono text-xs font-medium text-offgrid-green/70 sm:text-sm">
                          {order.id}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={cn(orderStatusClassCustomer(order.status))}>
                          {formatOrderStatus(order.status)}
                        </span>
                        <span className={cn(paymentStatusClassCustomer(order.paymentStatus))}>
                          {formatPaymentStatus(order.paymentStatus)}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                            hasOfficialCustomQuote(order.officialTotal)
                              ? "border-offgrid-green/25 bg-offgrid-lime/25 text-offgrid-green"
                              : "border-offgrid-green/15 bg-offgrid-cream text-offgrid-green/70",
                          )}
                        >
                          {hasOfficialCustomQuote(order.officialTotal) ? "Official quote" : "Quote pending"}
                        </span>
                      </div>

                      <dl className="mt-5 grid gap-4 border-t border-offgrid-green/10 pt-5 sm:mt-6 sm:grid-cols-2 sm:pt-6">
                        <div>
                          <dt className={metaLabelClass}>Submitted</dt>
                          <dd className="mt-1 text-sm font-medium text-offgrid-green">
                            {formatOrderTimestamp(order.createdAt)}
                          </dd>
                        </div>
                        <div>
                          <dt className={metaLabelClass}>Quantity</dt>
                          <dd className="mt-1 text-sm font-medium text-offgrid-green">{order.quantity}</dd>
                        </div>
                        <div>
                          <dt className={metaLabelClass}>Print</dt>
                          <dd className="mt-1 text-sm font-medium text-offgrid-green">
                            {formatEnumLabel(order.printMethod ?? undefined)}
                          </dd>
                        </div>
                        <div>
                          <dt className={metaLabelClass}>Deposit</dt>
                          <dd className="mt-1 text-sm font-medium text-offgrid-green">
                            {hasOfficialCustomQuote(order.officialTotal) && order.officialDeposit
                              ? formatMoney(order.officialDeposit)
                              : order.depositRequired && order.depositRequired.amount > 0
                                ? `${formatMoney(order.depositRequired)} (est.)`
                                : "TBD after review"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex w-full shrink-0 flex-col gap-4 border-t border-offgrid-green/10 pt-5 lg:w-56 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                      <div className="lg:text-right">
                        <p className={metaLabelClass}>
                          {hasOfficialCustomQuote(order.officialTotal) ? "Official total" : "Estimate"}
                        </p>
                        <p className={accountPriceDisplay}>
                          {hasOfficialCustomQuote(order.officialTotal)
                            ? formatMoney(order.officialTotal!)
                            : formatMoney(order.estimatedTotal ?? { amount: 0, currency: "PHP" })}
                        </p>
                        <p className="mt-2 inline-flex rounded-full border border-offgrid-green/15 bg-offgrid-cream/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/70 lg:ml-auto">
                          Custom program
                        </p>
                      </div>
                      <Button variant="default" size="lg" className="w-full gap-2 shadow-md" asChild>
                        <Link to={`/account/orders/${order.id}`}>
                          View details
                          <ArrowRight className="h-4 w-4 shrink-0" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </AccountPageShell>
  );
}
