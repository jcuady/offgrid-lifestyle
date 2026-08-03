import { describe, expect, it } from "vitest";
import {
  canCustomerCancelOrder,
  canCustomerRequestRevision,
  canOverridePaymentStatus,
  canTransitionStatus,
} from "./orderLifecycle";

describe("orderLifecycle", () => {
  it("admin unrestricted can skip to shipped", () => {
    expect(canTransitionStatus("confirmed", "shipped", { unrestricted: true })).toBe(true);
    expect(canTransitionStatus("confirmed", "shipped")).toBe(false);
  });

  it("staff can move under_review → pending_deposit", () => {
    expect(canTransitionStatus("under_review", "pending_deposit")).toBe(true);
  });

  it("cancel window is unpaid + pre-production only", () => {
    expect(
      canCustomerCancelOrder({ status: "under_review", paymentStatus: "unpaid" }),
    ).toBe(true);
    expect(
      canCustomerCancelOrder({ status: "confirmed", paymentStatus: "unpaid" }),
    ).toBe(false);
    expect(
      canCustomerCancelOrder({ status: "pending_deposit", paymentStatus: "deposit_paid" }),
    ).toBe(false);
  });

  it("revision until shipped", () => {
    expect(
      canCustomerRequestRevision({ status: "in_production", orderType: "custom" }),
    ).toBe(true);
    expect(canCustomerRequestRevision({ status: "shipped", orderType: "custom" })).toBe(false);
    expect(canCustomerRequestRevision({ status: "confirmed", orderType: "retail" })).toBe(false);
  });

  it("payment override is admin-only", () => {
    expect(canOverridePaymentStatus("fully_paid", { unrestricted: true })).toBe(true);
    expect(canOverridePaymentStatus("fully_paid")).toBe(false);
  });

  it("admin unrestricted can set any durable status including draft", () => {
    expect(canTransitionStatus("delivered", "draft", { unrestricted: true })).toBe(true);
    expect(canTransitionStatus("delivered", "shipped", { unrestricted: true })).toBe(true);
    expect(canTransitionStatus("cancelled", "confirmed", { unrestricted: true })).toBe(true);
  });

  it("admin may refund; staff cannot", () => {
    expect(canOverridePaymentStatus("refunded", { unrestricted: true })).toBe(true);
    expect(canOverridePaymentStatus("refunded")).toBe(false);
  });
});
