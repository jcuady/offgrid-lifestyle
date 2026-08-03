import { describe, expect, it } from "vitest";
import {
  adminCustomLifecycleGuide,
  customerCustomLifecycleGuide,
} from "./orderLifecycleGuidance";

describe("customerCustomLifecycleGuide", () => {
  it("waits under review with SLA", () => {
    const g = customerCustomLifecycleGuide({
      status: "under_review",
      paymentStatus: "unpaid",
      hasOfficialQuote: false,
    });
    expect(g.tone).toBe("wait");
    expect(g.title).toMatch(/review/i);
    expect(g.body).toMatch(/1–3 business days/);
  });

  it("asks Pay now when invoice ready", () => {
    const g = customerCustomLifecycleGuide({
      status: "pending_deposit",
      paymentStatus: "unpaid",
      hasOfficialQuote: true,
    });
    expect(g.tone).toBe("action");
    expect(g.nextStep).toBe("Pay now");
  });

  it("guides revision wait state", () => {
    const g = customerCustomLifecycleGuide({
      status: "revision_requested",
      paymentStatus: "unpaid",
      hasOfficialQuote: true,
    });
    expect(g.tone).toBe("wait");
    expect(g.title).toMatch(/revision/i);
  });

  it("asks for remaining balance after deposit", () => {
    const g = customerCustomLifecycleGuide({
      status: "confirmed",
      paymentStatus: "deposit_paid",
      hasOfficialQuote: true,
    });
    expect(g.tone).toBe("action");
    expect(g.nextStep).toBe("Pay remaining balance");
  });

  it("covers terminal and in-flight customer states", () => {
    expect(
      customerCustomLifecycleGuide({
        status: "cancelled",
        paymentStatus: "unpaid",
        hasOfficialQuote: false,
      }).tone,
    ).toBe("done");
    expect(
      customerCustomLifecycleGuide({
        status: "shipped",
        paymentStatus: "fully_paid",
        hasOfficialQuote: true,
      }).tone,
    ).toBe("wait");
    expect(
      customerCustomLifecycleGuide({
        status: "delivered",
        paymentStatus: "fully_paid",
        hasOfficialQuote: true,
      }).tone,
    ).toBe("done");
    expect(
      customerCustomLifecycleGuide({
        status: "in_production",
        paymentStatus: "fully_paid",
        hasOfficialQuote: true,
      }).nextStep.toLowerCase(),
    ).toMatch(/production|revision/);
  });
});

describe("adminCustomLifecycleGuide", () => {
  it("points to Save invoice while reviewing", () => {
    const g = adminCustomLifecycleGuide({
      status: "under_review",
      paymentStatus: "unpaid",
      hasOfficialQuote: false,
    });
    expect(g.tone).toBe("action");
    expect(g.nextStep.toLowerCase()).toContain("invoice");
  });

  it("flags proof confirm", () => {
    const g = adminCustomLifecycleGuide({
      status: "pending_deposit",
      paymentStatus: "unpaid",
      hasOfficialQuote: true,
      hasPaymentProof: true,
    });
    expect(g.nextStep.toLowerCase()).toContain("confirm");
  });

  it("waits for payment when invoice live without proof", () => {
    const g = adminCustomLifecycleGuide({
      status: "pending_deposit",
      paymentStatus: "unpaid",
      hasOfficialQuote: true,
      hasPaymentProof: false,
    });
    expect(g.tone).toBe("wait");
    expect(g.nextStep.toLowerCase()).toMatch(/paymongo|proof/);
  });

  it("points admin at revision note when present", () => {
    const g = adminCustomLifecycleGuide({
      status: "revision_requested",
      paymentStatus: "unpaid",
      hasOfficialQuote: true,
      hasCustomerRevisionNote: true,
    });
    expect(g.tone).toBe("action");
    expect(g.body.toLowerCase()).toContain("revision note");
  });

  it("advances production → ship → deliver", () => {
    expect(
      adminCustomLifecycleGuide({
        status: "confirmed",
        paymentStatus: "deposit_paid",
        hasOfficialQuote: true,
      }).nextStep.toLowerCase(),
    ).toContain("production");
    expect(
      adminCustomLifecycleGuide({
        status: "in_production",
        paymentStatus: "fully_paid",
        hasOfficialQuote: true,
      }).nextStep.toLowerCase(),
    ).toContain("shipped");
    expect(
      adminCustomLifecycleGuide({
        status: "shipped",
        paymentStatus: "fully_paid",
        hasOfficialQuote: true,
      }).nextStep.toLowerCase(),
    ).toContain("delivered");
  });
});
