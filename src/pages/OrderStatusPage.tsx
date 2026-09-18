import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Printer, Search } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { OrderReceiptView } from "@/src/components/orders/OrderReceiptView";
import { siteContainer } from "@/src/lib/brandLayout";
import { isValidEmail } from "@/src/lib/formValidation";
import { lookupGuestOrder, type GuestOrderLookupResult } from "@/src/services/guestOrderLookup";
import { usePortalStore } from "@/src/store/usePortalStore";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";

export function OrderStatusPage() {
  const [params, setSearchParams] = useSearchParams();
  const currentUser = usePortalStore((s) => s.currentUser);
  const [orderId, setOrderId] = useState(params.get("id") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [order, setOrder] = useState<GuestOrderLookupResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const receiptMode = params.get("receipt") === "1" || params.get("mode") === "receipt";

  const runLookup = async (id: string, mail: string) => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setOrder(null);
    try {
      const result = await lookupGuestOrder(id, mail);
      if (!result) {
        setNotFound(true);
        return;
      }
      setOrder(result);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("id", id.trim());
          next.set("email", mail.trim());
          return next;
        },
        { replace: true },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = params.get("id")?.trim();
    const mail = params.get("email")?.trim();
    if (!id || !mail || !isValidEmail(mail)) return;
    void runLookup(id, mail);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lookup when URL params change
  }, []);

  useEffect(() => {
    if (receiptMode && order) {
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [receiptMode, order]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !isValidEmail(email)) {
      setError("Enter your order ID and the email used at checkout.");
      return;
    }
    void runLookup(orderId, email);
  };

  const trackHref =
    currentUser?.role === "customer" && order
      ? `/account/orders/${order.id}`
      : order
        ? `/order-status?id=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.customerEmail)}`
        : "#";

  return (
    <div className={`${siteContainer} py-10 sm:py-14`}>
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl font-black text-offgrid-green">Track your order</h1>
        <p className="mt-2 text-sm text-offgrid-green/60">
          Enter your order ID and email to view status or print a receipt.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
              placeholder="CO-2026-1234 or OG-…"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {notFound ? (
            <p className="text-sm text-amber-800" role="status">
              No order found for that ID and email. Check for typos or use the email from your confirmation.
            </p>
          ) : null}
          <Button type="submit" variant="default" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Looking up…
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Look up order
              </>
            )}
          </Button>
        </form>

        {order ? (
          <div className="mt-10 space-y-6 print:mt-0">
            {!receiptMode ? (
              <div className="rounded-xl border border-offgrid-lime/30 bg-offgrid-lime/10 px-4 py-3 text-sm text-offgrid-green">
                <p className="font-semibold">Order found</p>
                <p className="mt-1 text-offgrid-green/70">
                  Status: {order.status.replace(/_/g, " ")} · Payment: {order.paymentStatus.replace(/_/g, " ")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                  <Button variant="default" size="sm" asChild>
                    <Link to={trackHref}>Track order</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/order-status?id=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.customerEmail)}&receipt=1`}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print receipt
                    </Link>
                  </Button>
                  {currentUser?.role !== "customer" ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`${CUSTOMER_SIGN_IN_PATH}?email=${encodeURIComponent(order.customerEmail)}`}>
                        Sign in to save order
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <OrderReceiptView
              orderId={order.id}
              orderType={order.orderType}
              customerName={order.customerName}
              customerEmail={order.customerEmail}
              status={order.status}
              paymentStatus={order.paymentStatus}
              createdAt={order.createdAt}
              paymentMethod={order.paymentMethod}
              lineItems={order.lineItems}
              subtotal={order.subtotal}
              shipping={order.shipping}
              tax={order.tax}
              total={order.total}
              customPayload={order.customPayload}
            />

            {receiptMode ? (
              <div className="flex justify-center print:hidden">
                <Button type="button" variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print again
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
