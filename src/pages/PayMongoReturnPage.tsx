import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, QrCode, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import {
  createPayMongoCheckoutSession,
  fetchPayMongoPaymentStatus,
  redirectToPayMongoCheckout,
  type PayMongoPaymentStatus,
} from "@/src/lib/paymongo";
import { paymongoReturnUi } from "@/src/lib/orderPaymentTransitions";
import { electricBluePill, marketingPageHero, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

type PageMode = "complete" | "retry";

function accountOrderPath(orderId: string) {
  return `/account/orders/${encodeURIComponent(orderId)}`;
}

function inferRetryKind(status: PayMongoPaymentStatus | null): "full" | "deposit" | "balance" {
  if (status?.orderType === "custom") {
    return status.paymentStatus === "deposit_paid" ? "balance" : "deposit";
  }
  return "full";
}

export function PayMongoReturnPage({ mode }: { mode: PageMode }) {
  const [params] = useSearchParams();
  const orderId = (params.get("order_id") ?? "").trim();
  const sessionId = (params.get("session_id") ?? "").trim() || undefined;

  const [status, setStatus] = useState<PayMongoPaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [polls, setPolls] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setError("Missing order reference. Return from checkout or open your order from My orders.");
      setLoading(false);
      return;
    }
    if (orderId.length > 64 || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(orderId)) {
      setError("Invalid order reference.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const load = async (sync: boolean) => {
      try {
        const next = await fetchPayMongoPaymentStatus({ orderId, sessionId, sync });
        if (cancelled) return;
        setStatus(next);
        setError(null);
        setLoading(false);

        if (mode === "complete" && !next.paid && polls < 12) {
          timer = window.setTimeout(() => {
            setPolls((p) => p + 1);
          }, 2500);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not verify payment.");
        setLoading(false);
      }
    };

    void load(true);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderId, sessionId, mode, polls]);

  const ui = useMemo(
    () =>
      paymongoReturnUi({
        mode,
        paymentStatus: status?.paymentStatus,
        fullyPaid: status?.fullyPaid,
        paid: status?.paid,
        polls,
      }),
    [mode, status?.paymentStatus, status?.fullyPaid, status?.paid, polls],
  );

  const handleRetry = async () => {
    if (!orderId) return;
    setRetrying(true);
    setError(null);
    try {
      const session = await createPayMongoCheckoutSession({
        orderId,
        paymentKind: inferRetryKind(status),
      });
      if (session.alreadyPaid) {
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                paid: true,
                fullyPaid: session.paymentStatus === "fully_paid" || prev.fullyPaid,
                paymentStatus: session.paymentStatus ?? prev.paymentStatus,
                status: session.orderStatus ?? prev.status,
              }
            : prev,
        );
        setRetrying(false);
        return;
      }
      if (!session.checkoutUrl) {
        throw new Error("PayMongo did not return a checkout URL.");
      }
      redirectToPayMongoCheckout(session.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restart PayMongo checkout.");
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-offgrid-cream">
      <header className={marketingPageHero}>
        <div className={cn(siteContainer, "relative z-10")}>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream/60">
            PayMongo · QR Ph
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-black tracking-tight text-offgrid-cream sm:text-5xl">
            {ui.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-offgrid-cream/75 sm:text-base">
            {mode === "complete"
              ? "OFFGRID absorbs the PayMongo fee — you only pay your order total."
              : "You can retry QR Ph checkout securely. Your order is saved."}
          </p>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,10,255,0.35),transparent_55%)]"
        />
      </header>

      <main className={cn(siteContainer, "py-12 sm:py-16")}>
        <div className="mx-auto max-w-lg rounded-2xl border border-offgrid-green/10 bg-white p-6 shadow-sm sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8 text-offgrid-green/70">
              <Loader2 className="h-8 w-8 animate-spin text-offgrid-lime" aria-hidden />
              <p className="text-sm font-medium">Checking payment status…</p>
            </div>
          ) : null}

          {!loading && ui.showSuccess ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-offgrid-lime" aria-hidden />
              <p className="font-display text-xl font-bold text-offgrid-green">
                {ui.depositOnly ? "Deposit confirmed" : "Thank you — payment confirmed"}
              </p>
              <p className="text-sm text-offgrid-green/65">
                Order <span className="font-mono font-semibold">{orderId}</span>
              </p>
              {ui.depositOnly ? (
                <p className="text-sm text-offgrid-green/70">
                  Remaining balance can be paid from your order page when you are ready.
                </p>
              ) : null}
              <dl className="mx-auto grid max-w-xs gap-2 text-left text-sm text-offgrid-green/80">
                <div className="flex justify-between gap-3">
                  <dt className="text-offgrid-green/55">Payment</dt>
                  <dd className="font-semibold capitalize">
                    {(status?.paymentStatus ?? "").replace(/_/g, " ")}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-offgrid-green/55">Order</dt>
                  <dd className="font-semibold capitalize">
                    {(status?.status ?? "").replace(/_/g, " ")}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to={accountOrderPath(orderId)} className={electricBluePill}>
                  View order
                </Link>
                <Button variant="outline" asChild>
                  <Link to="/shop">Continue shopping</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {!loading && ui.showWaiting ? (
            <div className="space-y-4 text-center">
              {ui.timedOut ? (
                <XCircle className="mx-auto h-12 w-12 text-amber-500" aria-hidden />
              ) : (
                <Loader2 className="mx-auto h-10 w-8 animate-spin text-offgrid-lime" aria-hidden />
              )}
              <p className="font-display text-xl font-bold text-offgrid-green">
                {ui.timedOut ? "Payment not confirmed yet" : "Waiting for confirmation"}
              </p>
              <p className="text-sm text-offgrid-green/65">
                {ui.timedOut
                  ? "If you completed QR Ph payment, refresh status or open retry. You can also check My orders shortly."
                  : "If you just paid via QR Ph, this usually updates within a few seconds. Keep this page open or check My orders shortly."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  className={electricBluePill}
                  onClick={() => {
                    setLoading(true);
                    setPolls((p) => p + 1);
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh status
                </button>
                <Button variant="outline" asChild>
                  <Link to={`/checkout/paymongo/retry?order_id=${encodeURIComponent(orderId)}`}>
                    Go to retry
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          {!loading && ui.showRetry ? (
            <div className="space-y-4 text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500" aria-hidden />
              <p className="font-display text-xl font-bold text-offgrid-green">
                {ui.depositOnly
                  ? "Balance payment incomplete"
                  : "Payment was cancelled or incomplete"}
              </p>
              <p className="text-sm text-offgrid-green/65">
                {ui.depositOnly
                  ? "Your deposit is already recorded. Retry QR Ph for the remaining balance — fees stay on OFFGRID."
                  : "No charge was completed. Retry QR Ph checkout — processing fees stay on OFFGRID."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  disabled={retrying}
                  onClick={() => void handleRetry()}
                  className={cn(electricBluePill, retrying && "opacity-60")}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  {retrying
                    ? "Starting…"
                    : ui.depositOnly
                      ? "Retry balance payment"
                      : "Retry QR Ph payment"}
                </button>
                {orderId ? (
                  <Button variant="outline" asChild>
                    <Link to={accountOrderPath(orderId)}>View order</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {error ? (
            <p
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export function PayMongoCompletePage() {
  return <PayMongoReturnPage mode="complete" />;
}

export function PayMongoRetryPage() {
  return <PayMongoReturnPage mode="retry" />;
}
