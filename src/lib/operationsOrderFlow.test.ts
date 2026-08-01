import { describe, expect, it } from "vitest";
import {
  ADMIN_ORDER_TRANSITIONS,
  canOverridePaymentStatus,
  canTransitionStatus,
} from "./operationsOrderFlow";

describe("admin unrestricted override", () => {
  it("allows any durable fulfillment status including draft", () => {
    for (const next of ADMIN_ORDER_TRANSITIONS) {
      expect(canTransitionStatus("delivered", next, { unrestricted: true })).toBe(true);
    }
  });

  it("blocks staff from skipping the pipeline", () => {
    expect(canTransitionStatus("delivered", "shipped")).toBe(false);
    expect(canTransitionStatus("cancelled", "confirmed")).toBe(false);
  });

  it("payment override is admin-only", () => {
    expect(canOverridePaymentStatus("fully_paid", { unrestricted: true })).toBe(true);
    expect(canOverridePaymentStatus("refunded", { unrestricted: true })).toBe(true);
    expect(canOverridePaymentStatus("fully_paid")).toBe(false);
  });
});
