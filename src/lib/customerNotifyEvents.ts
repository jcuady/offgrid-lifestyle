/** Customer-facing order lifecycle events (push + inbox + email). */
export type CustomerOrderEvent =
  | "order_confirmed"
  | "in_production"
  | "payment_confirmed"
  | "quote_ready"
  | "shipped"
  | "delivered";

/** Map fulfillment status → customer notify event (admin/staff/system — actor-agnostic). */
export function customerEventForFulfillmentStatus(status: string): CustomerOrderEvent | null {
  switch (status) {
    case "confirmed":
      return "order_confirmed";
    case "in_production":
      return "in_production";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    default:
      return null;
  }
}

/** Map payment status → customer notify event. */
export function customerEventForPaymentStatus(status: string): CustomerOrderEvent | null {
  if (status === "deposit_paid" || status === "fully_paid") return "payment_confirmed";
  return null;
}

/**
 * Mirrors `og_orders_advance_on_payment` — when payment settles, draft/pending_deposit → confirmed.
 */
export function fulfillmentAfterPaymentSettle(
  previousFulfillment: string,
  previousPayment: string,
  nextPayment: string,
): "confirmed" | null {
  if (previousPayment === nextPayment) return null;
  if (nextPayment !== "deposit_paid" && nextPayment !== "fully_paid") return null;
  if (previousFulfillment === "draft" || previousFulfillment === "pending_deposit") return "confirmed";
  return null;
}
