/**
 * Shared payment → order status transitions for retail + custom.
 * Used by PayMongo automation and mirrored by the DB advance-on-payment trigger.
 */

export type PaymentKind = "full" | "deposit" | "balance";

export function resolvePaidOrderUpdate(input: {
  orderType: "retail" | "custom";
  paymentKind: PaymentKind;
  currentStatus: string;
  currentPaymentStatus: string;
}): { paymentStatus: "deposit_paid" | "fully_paid"; status: string } {
  const paymentStatus: "deposit_paid" | "fully_paid" =
    input.orderType === "custom" && input.paymentKind === "deposit"
      ? "deposit_paid"
      : "fully_paid";

  const status =
    input.currentStatus === "pending_deposit" || input.currentStatus === "draft"
      ? "confirmed"
      : input.currentStatus;

  return { paymentStatus, status };
}

/** Prefer metadata.payment_kind, then reference_number `orderId:kind`. */
export function resolvePaymentKindFromSession(input: {
  metadata?: Record<string, unknown> | null;
  referenceNumber?: string | null;
  fallback?: PaymentKind;
}): PaymentKind {
  const meta = input.metadata?.payment_kind;
  if (meta === "deposit" || meta === "balance" || meta === "full") return meta;
  const ref = input.referenceNumber;
  if (typeof ref === "string" && ref.includes(":")) {
    const kind = ref.split(":")[1];
    if (kind === "deposit" || kind === "balance" || kind === "full") return kind;
  }
  return input.fallback ?? "full";
}

export function amountsMatchCentavos(
  expected: number | null | undefined,
  paid: number | null | undefined,
): boolean {
  if (expected == null || paid == null) return false;
  if (!Number.isFinite(expected) || !Number.isFinite(paid)) return false;
  return Math.abs(expected - paid) <= 1;
}

/** Return/retry page UI flags — keep in sync with PayMongoReturnPage. */
export function paymongoReturnUi(input: {
  mode: "complete" | "retry";
  paymentStatus?: string | null;
  fullyPaid?: boolean;
  paid?: boolean;
  polls?: number;
}): {
  title: string;
  showSuccess: boolean;
  showWaiting: boolean;
  showRetry: boolean;
  depositOnly: boolean;
  timedOut: boolean;
} {
  const fullyPaid = Boolean(input.fullyPaid);
  const depositOnly = input.paymentStatus === "deposit_paid" && !fullyPaid;
  const settledForAttempt = Boolean(input.paid);
  const timedOut = input.mode === "complete" && !settledForAttempt && (input.polls ?? 0) >= 12;

  if (input.mode === "complete") {
    return {
      title: settledForAttempt
        ? depositOnly
          ? "Deposit received"
          : "Payment received"
        : timedOut
          ? "Still confirming"
          : "Confirming payment",
      showSuccess: settledForAttempt,
      showWaiting: !settledForAttempt,
      showRetry: false,
      depositOnly,
      timedOut,
    };
  }

  // Retry: only treat fully_paid as done — deposit_paid still needs balance retry.
  return {
    title: fullyPaid ? "Already paid" : "Payment incomplete",
    showSuccess: fullyPaid,
    showWaiting: false,
    showRetry: !fullyPaid && input.paymentStatus !== "refunded",
    depositOnly,
    timedOut: false,
  };
}
