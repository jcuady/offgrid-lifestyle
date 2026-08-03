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
});
