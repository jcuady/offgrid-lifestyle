import { describe, expect, it } from "vitest";

/**
 * Mirrors send-order-email og_order_email_log key.
 * Keep in sync with supabase/functions/send-order-email/index.ts.
 */
function orderEmailDedupeKey(event: string, paymentStatus: string): string {
  const status =
    event === "payment_confirmed"
      ? paymentStatus || ""
      : event.startsWith("order_receipt")
        ? "placed"
        : "";
  return `${event}:${status}`;
}

describe("orderEmailDedupeKey", () => {
  it("sends separate receipts for deposit vs full payment", () => {
    expect(orderEmailDedupeKey("payment_confirmed", "deposit_paid")).toBe(
      "payment_confirmed:deposit_paid",
    );
    expect(orderEmailDedupeKey("payment_confirmed", "fully_paid")).toBe(
      "payment_confirmed:fully_paid",
    );
  });

  it("dedupes placement receipts regardless of payment_status column", () => {
    expect(orderEmailDedupeKey("order_receipt_retail", "unpaid")).toBe(
      "order_receipt_retail:placed",
    );
    expect(orderEmailDedupeKey("order_receipt_custom", "unpaid")).toBe(
      "order_receipt_custom:placed",
    );
  });
});
