import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import {
  formatOrderStatus,
  formatPaymentStatus,
  orderStatusClass,
  paymentStatusClass,
} from "@/src/lib/portal";
import { usePortalStore } from "@/src/store/usePortalStore";

type OrderFilter = "all" | "retail" | "custom";

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

  const mergedOrders = useMemo(() => {
    const entries = [
      ...scopedRetail.map((entry) => ({ kind: "retail" as const, entry })),
      ...scopedCustom.map((entry) => ({ kind: "custom" as const, entry })),
    ].sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());

    if (filter === "all") return entries;
    return entries.filter((entry) => entry.kind === filter);
  }, [filter, scopedRetail, scopedCustom]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        Account
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">My Orders</h1>
      <p className="mt-2 text-sm text-offgrid-green/60">
        View normal orders and custom requests in one timeline.
      </p>

      <div className="mt-6 inline-flex rounded-xl border border-offgrid-green/15 bg-white p-1">
        {(["all", "retail", "custom"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
              filter === tab ? "bg-offgrid-green text-offgrid-cream" : "text-offgrid-green/60 hover:text-offgrid-green",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {mergedOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white p-8 text-sm text-offgrid-green/60">
            No matching orders found.
          </div>
        ) : (
          mergedOrders.map((item) => {
            if (item.kind === "retail") {
              const order = item.entry;
              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
                        Retail Order
                      </p>
                      <h2 className="mt-1 text-lg font-display font-bold text-offgrid-green">{order.id}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-offgrid-green/50">Total</p>
                      <p className="text-lg font-display font-black text-offgrid-green">
                        {formatMoney(order.total)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        orderStatusClass(order.status),
                      )}
                    >
                      {formatOrderStatus(order.status)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        paymentStatusClass(order.paymentStatus),
                      )}
                    >
                      {formatPaymentStatus(order.paymentStatus)}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-offgrid-green/55">
                    {order.lines.length} item(s) · Payment: {order.paymentMethod ?? "N/A"}
                  </p>
                  <div className="mt-4 border-t border-offgrid-green/10 pt-4">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {order.lines.slice(0, 4).map((line) => (
                        <img
                          key={line.lineItemId}
                          src={line.image}
                          alt={line.name}
                          className="h-12 w-12 shrink-0 rounded-lg border border-offgrid-green/10 object-cover bg-white"
                        />
                      ))}
                    </div>
                    <Link
                      to={`/account/orders/${order.id}`}
                      className="mt-3 inline-flex rounded-xl border border-offgrid-green/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green hover:bg-offgrid-green/5"
                    >
                      View Order Details
                    </Link>
                  </div>
                </article>
              );
            }

            const order = item.entry;
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
                      Custom Order
                    </p>
                    <h2 className="mt-1 text-lg font-display font-bold text-offgrid-green">{order.id}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-offgrid-green/50">Estimate</p>
                    <p className="text-lg font-display font-black text-offgrid-green">
                      {formatMoney(order.estimatedTotal ?? { amount: 0, currency: "PHP" })}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      orderStatusClass(order.status),
                    )}
                  >
                    {formatOrderStatus(order.status)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      paymentStatusClass(order.paymentStatus),
                    )}
                  >
                    {formatPaymentStatus(order.paymentStatus)}
                  </span>
                </div>
                <p className="mt-4 text-xs text-offgrid-green/55">
                  Qty: {order.quantity} · Cut: {order.cut ?? "N/A"} · Material: {order.material ?? "N/A"}
                </p>
                <div className="mt-4 border-t border-offgrid-green/10 pt-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-offgrid-green/10 bg-offgrid-green/5 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/65">
                    Custom
                  </div>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="mt-3 inline-flex rounded-xl border border-offgrid-green/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green hover:bg-offgrid-green/5"
                  >
                    View Order Details
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
