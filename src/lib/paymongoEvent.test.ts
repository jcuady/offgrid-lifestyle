import { describe, expect, it } from "vitest";
import {
  isSettlementEvent,
  parsePaymongoEvent,
} from "../../supabase/functions/_shared/paymongoEvent";

// Shapes copied from real events recorded in og_paymongo_webhook_events:
// data.type is always "event"; the real name lives in data.attributes.type.
const checkoutPaid = {
  data: {
    id: "evt_checkoutPaid1",
    type: "event",
    attributes: {
      type: "checkout_session.payment.paid",
      livemode: true,
      data: {
        id: "cs_abc123",
        type: "checkout_session",
        attributes: {
          reference_number: "PRE-2026-0001:full",
          metadata: { order_id: "PRE-2026-0001", order_type: "retail", payment_kind: "full" },
          payments: [{ id: "pay_1", attributes: { status: "paid", amount: 76000, fee: 1140 } }],
        },
      },
    },
  },
};

const paymentPaid = {
  data: {
    id: "evt_paymentPaid1",
    type: "event",
    attributes: {
      type: "payment.paid",
      livemode: true,
      data: {
        id: "pay_1",
        type: "payment",
        attributes: { amount: 76000, metadata: { order_id: "PRE-2026-0001" } },
      },
    },
  },
};

describe("parsePaymongoEvent", () => {
  it("reads the real event name, not the envelope type 'event'", () => {
    const evt = parsePaymongoEvent(checkoutPaid);
    expect(evt?.eventType).toBe("checkout_session.payment.paid");
    expect(evt?.eventId).toBe("evt_checkoutPaid1");
    expect(evt?.livemode).toBe(true);
  });

  it("exposes the nested checkout session with metadata and paid amount", () => {
    const evt = parsePaymongoEvent(checkoutPaid);
    expect(evt?.session?.id).toBe("cs_abc123");
    expect(evt?.session?.attributes?.metadata?.order_id).toBe("PRE-2026-0001");
    expect(evt?.session?.attributes?.payments?.[0]?.attributes?.amount).toBe(76000);
  });

  it("returns null for garbage", () => {
    expect(parsePaymongoEvent(null)).toBeNull();
    expect(parsePaymongoEvent({})).toBeNull();
    expect(parsePaymongoEvent({ data: { type: "event", attributes: {} } })).toBeNull();
  });
});

describe("isSettlementEvent", () => {
  it("settles only on checkout_session.payment.paid", () => {
    expect(isSettlementEvent("checkout_session.payment.paid")).toBe(true);
  });

  it("acknowledges but never settles on bare payment events or the envelope type", () => {
    // payment.paid carries a payment id, not a session id or payments[] — can't be amount-verified.
    expect(isSettlementEvent("payment.paid")).toBe(false);
    expect(isSettlementEvent("payment.failed")).toBe(false);
    expect(isSettlementEvent("event")).toBe(false);
  });

  it("parses the bare payment event under its real name", () => {
    expect(parsePaymongoEvent(paymentPaid)?.eventType).toBe("payment.paid");
  });
});
