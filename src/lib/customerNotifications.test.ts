import { describe, expect, it } from "vitest";
import { buildWebPushTag } from "@/src/lib/pushPayload";
import {
  customerEventForFulfillmentStatus,
  customerEventForPaymentStatus,
  fulfillmentAfterPaymentSettle,
} from "@/src/lib/customerNotifyEvents";

/** Stable customer push tags (playbook: no Date.now() in tags). */
function customerOrderPushTag(event: string, orderId: string, url: string): string {
  return buildWebPushTag(url, `${event}-${orderId}`);
}

describe("customerOrderPushTag", () => {
  it("is stable for the same event and order", () => {
    const a = customerOrderPushTag("shipped", "OG-2026-1", "/account/orders/OG-2026-1");
    const b = customerOrderPushTag("shipped", "OG-2026-1", "/account/orders/OG-2026-1");
    expect(a).toBe(b);
    expect(a).toContain("shipped-OG-2026-1");
  });

  it("differs by event so status updates renotify", () => {
    const shipped = customerOrderPushTag("shipped", "OG-1", "/account/orders/OG-1");
    const delivered = customerOrderPushTag("delivered", "OG-1", "/account/orders/OG-1");
    expect(shipped).not.toBe(delivered);
  });
});

describe("customerEventForFulfillmentStatus", () => {
  it("maps ops statuses customers care about", () => {
    expect(customerEventForFulfillmentStatus("confirmed")).toBe("order_confirmed");
    expect(customerEventForFulfillmentStatus("in_production")).toBe("in_production");
    expect(customerEventForFulfillmentStatus("shipped")).toBe("shipped");
    expect(customerEventForFulfillmentStatus("delivered")).toBe("delivered");
  });

  it("ignores non-customer statuses", () => {
    expect(customerEventForFulfillmentStatus("pending_deposit")).toBeNull();
    expect(customerEventForFulfillmentStatus("cancelled")).toBeNull();
    expect(customerEventForFulfillmentStatus("draft")).toBeNull();
  });
});

describe("customerEventForPaymentStatus", () => {
  it("notifies on settled payment only", () => {
    expect(customerEventForPaymentStatus("deposit_paid")).toBe("payment_confirmed");
    expect(customerEventForPaymentStatus("fully_paid")).toBe("payment_confirmed");
    expect(customerEventForPaymentStatus("unpaid")).toBeNull();
    expect(customerEventForPaymentStatus("refunded")).toBeNull();
  });
});

describe("fulfillmentAfterPaymentSettle", () => {
  it("mirrors DB advance-on-payment → confirmed", () => {
    expect(fulfillmentAfterPaymentSettle("pending_deposit", "unpaid", "fully_paid")).toBe("confirmed");
    expect(fulfillmentAfterPaymentSettle("draft", "unpaid", "deposit_paid")).toBe("confirmed");
  });

  it("does not re-advance already progressing orders", () => {
    expect(fulfillmentAfterPaymentSettle("confirmed", "unpaid", "fully_paid")).toBeNull();
    expect(fulfillmentAfterPaymentSettle("in_production", "deposit_paid", "fully_paid")).toBeNull();
    expect(fulfillmentAfterPaymentSettle("pending_deposit", "fully_paid", "fully_paid")).toBeNull();
  });
});
