import { describe, expect, it } from "vitest";
import { formatOrderStatus } from "./portal";
import { applyQuoteToCustomPayload, customPayloadFromManaged } from "./customOrderPayload";
import type { ManagedCustomOrder } from "@/src/store/usePortalStore";

describe("formatOrderStatus custom quote gate", () => {
  it("shows Awaiting quote before official total", () => {
    expect(formatOrderStatus("pending_deposit", "custom", { hasOfficialQuote: false })).toBe(
      "Awaiting quote",
    );
  });

  it("shows Pending deposit only after official quote", () => {
    expect(formatOrderStatus("pending_deposit", "custom", { hasOfficialQuote: true })).toBe(
      "Pending deposit",
    );
  });

  it("keeps retail pending_deposit as Order placed", () => {
    expect(formatOrderStatus("pending_deposit", "retail")).toBe("Order placed");
  });
});

function sampleOrder(partial: Partial<ManagedCustomOrder> = {}): ManagedCustomOrder {
  return {
    id: "CO-1",
    type: "custom",
    status: "pending_deposit",
    paymentStatus: "unpaid",
    customerId: null,
    customerName: "A",
    customerEmail: "a@b.com",
    customerPhone: "09",
    teamOrOrg: "T",
    quantity: 10,
    category: "apparel",
    headwearType: null,
    cuts: ["short_sleeve"],
    materials: ["dri_fit"],
    printMethod: "sublimation",
    designFileName: null,
    designFileKey: null,
    designFileUrl: null,
    orderSheetFileName: null,
    orderSheetFileKey: null,
    orderSheetFileUrl: null,
    designNotes: "",
    estimatedTotal: { amount: 1000, currency: "PHP" },
    depositRequired: { amount: 600, currency: "PHP" },
    officialTotal: null,
    officialDeposit: null,
    quoteCustomerNotes: "",
    quoteInternalNotes: "secret staff note",
    quotedAt: null,
    quotedBy: null,
    shippingInfo: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

describe("customPayloadFromManaged", () => {
  it("does not put internal notes in customer-readable payload", () => {
    const payload = customPayloadFromManaged(sampleOrder());
    expect(payload).not.toHaveProperty("customerName");
    expect(payload).not.toHaveProperty("quoteInternalNotes");
    expect(payload.contactName).toBe("A");
  });

  it("applyQuoteToCustomPayload merge-patches quote keys only (no internal notes)", () => {
    const base = customPayloadFromManaged(sampleOrder());
    const next = applyQuoteToCustomPayload(
      base,
      {
        officialTotal: { amount: 5000, currency: "PHP" },
        officialDeposit: null,
        quoteCustomerNotes: "Hi",
        quoteInternalNotes: "ops",
      },
      { quotedAt: "t", quotedBy: "admin", updatedAt: "t2" },
    );
    expect(next.officialTotal?.amount).toBe(5000);
    expect(next.officialDeposit?.amount).toBe(3000);
    expect(next.cuts).toEqual(["short_sleeve"]);
    expect(next.quoteCustomerNotes).toBe("Hi");
    expect(next).not.toHaveProperty("quoteInternalNotes");
  });
});
