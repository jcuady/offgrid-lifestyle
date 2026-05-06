import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePortalStore } from "@/src/store/usePortalStore";
import { formatMoney } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import {
  formatOrderStatus,
  formatPaymentStatus,
  orderStatusClass,
  paymentStatusClass,
} from "@/src/lib/portal";

export function CustomerOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const user = usePortalStore((state) => state.currentUser);
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);

  const retail = retailOrders.find(
    (entry) =>
      entry.id === orderId &&
      !!user &&
      (entry.customerId === user.id || entry.customerEmail.toLowerCase() === user.email.toLowerCase()),
  );
  const custom = customOrders.find(
    (entry) =>
      entry.id === orderId &&
      !!user &&
      (entry.customerId === user.id || entry.customerEmail.toLowerCase() === user.email.toLowerCase()),
  );

  if (!retail && !custom) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Account</p>
        <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">Order Not Found</h1>
        <p className="mt-2 text-sm text-offgrid-green/60">This order does not exist or is not linked to your account.</p>
        <Link
          to="/account/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-offgrid-green/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green hover:bg-offgrid-green/5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-10">
      <Link
        to="/account/orders"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60 hover:text-offgrid-green"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to my orders
      </Link>

      {retail ? (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Retail Order</p>
          <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">{retail.id}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                orderStatusClass(retail.status),
              )}
            >
              {formatOrderStatus(retail.status)}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                paymentStatusClass(retail.paymentStatus),
              )}
            >
              {formatPaymentStatus(retail.paymentStatus)}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Items</h2>
            <div className="mt-4 space-y-3">
              {retail.lines.map((line) => (
                <div
                  key={line.lineItemId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-14 w-14 rounded-lg object-cover border border-offgrid-green/10 bg-white"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-offgrid-green">{line.name}</p>
                      <p className="text-xs text-offgrid-green/55">
                        {line.size} · {line.color} · Qty {line.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-offgrid-green">
                    {formatMoney({
                      amount: line.priceSnapshot.amount * line.quantity,
                      currency: line.priceSnapshot.currency,
                    })}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-offgrid-green/10 pt-4 text-sm text-offgrid-green/75">
              <p>Subtotal: {formatMoney(retail.subtotal)}</p>
              <p>Shipping: {formatMoney(retail.shipping)}</p>
              <p className="mt-1 text-lg font-display font-bold text-offgrid-green">Total: {formatMoney(retail.total)}</p>
            </div>
          </div>
        </>
      ) : null}

      {custom ? (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Custom Order</p>
          <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">{custom.id}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                orderStatusClass(custom.status),
              )}
            >
              {formatOrderStatus(custom.status)}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                paymentStatusClass(custom.paymentStatus),
              )}
            >
              {formatPaymentStatus(custom.paymentStatus)}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Request Details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Design File</p>
                <p className="mt-1 text-sm font-semibold text-offgrid-green">{custom.designFileName ?? "No file uploaded"}</p>
              </div>
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Quantity</p>
                <p className="mt-1 text-sm font-semibold text-offgrid-green">{custom.quantity}</p>
              </div>
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Cut / Material</p>
                <p className="mt-1 text-sm font-semibold text-offgrid-green">
                  {custom.cut ?? "N/A"} · {custom.material ?? "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Estimate</p>
                <p className="mt-1 text-sm font-semibold text-offgrid-green">
                  {formatMoney(custom.estimatedTotal ?? { amount: 0, currency: "PHP" })}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
