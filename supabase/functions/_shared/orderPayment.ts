/** Mirrors src/lib/orderPaymentTransitions.ts for Edge Functions. */

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

/** Reject under/over-payment vs ledger amount (1 centavo tolerance). */
export function amountsMatchCentavos(
  expected: number | null | undefined,
  paid: number | null | undefined,
): boolean {
  if (expected == null || paid == null) return true; // ponytail: skip when PayMongo omits amount
  return Math.abs(expected - paid) <= 1;
}

/**
 * Retail PayMongo charge = og_orders.total_centavos (catalog selling prices + shipping).
 * DB trigger og_apply_live_retail_prices uses og_products.price, never base_price.
 */
export function retailPayMongoChargeCentavos(totalCentavos: number | null | undefined): number {
  return totalCentavos ?? 0;
}

/** Keep false — OFFGRID absorbs QR Ph fees (mirrors src/lib/paymongo.ts PAYMONGO_PASS_ON_FEES). */
export const PAYMONGO_PASS_ON_FEES = false as const;
