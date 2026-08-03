import { describe, expect, it } from "vitest";
import type { OrderStatus } from "@/src/types/commerce";
import {
  ADMIN_ORDER_TRANSITIONS,
  STATUS_FLOW,
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

describe("STATUS_FLOW matrix", () => {
  const allStatuses = Object.keys(STATUS_FLOW) as OrderStatus[];

  it("allows every documented happy-path edge", () => {
    for (const [from, tos] of Object.entries(STATUS_FLOW) as [OrderStatus, OrderStatus[]][]) {
      for (const to of tos) {
        expect(canTransitionStatus(from, to), `${from} → ${to}`).toBe(true);
      }
    }
  });

  it("blocks non-edges for staff (except self)", () => {
    for (const from of allStatuses) {
      const allowed = new Set(STATUS_FLOW[from]);
      for (const to of allStatuses) {
        if (from === to) {
          expect(canTransitionStatus(from, to)).toBe(true);
          continue;
        }
        if (allowed.has(to)) continue;
        expect(canTransitionStatus(from, to), `${from} ↛ ${to}`).toBe(false);
      }
    }
  });

  it("admin may land on every ADMIN_ORDER_TRANSITIONS entry", () => {
    for (const next of ADMIN_ORDER_TRANSITIONS) {
      expect(canTransitionStatus("delivered", next, { unrestricted: true })).toBe(true);
    }
  });
});

describe("cancel + revision covers every eligible status", () => {
  const cancelable: OrderStatus[] = [
    "draft",
    "under_review",
    "pending_deposit",
    "revision_requested",
  ];
  const notCancelable: OrderStatus[] = [
    "confirmed",
    "in_production",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const revisable: OrderStatus[] = [
    "under_review",
    "pending_deposit",
    "confirmed",
    "in_production",
    "revision_requested",
  ];

  it("cancel true only unpaid + cancelable statuses", () => {
    for (const status of cancelable) {
      expect(canCustomerCancelOrder({ status, paymentStatus: "unpaid" }), status).toBe(true);
      expect(canCustomerCancelOrder({ status, paymentStatus: "deposit_paid" }), status).toBe(false);
      expect(canCustomerCancelOrder({ status, paymentStatus: "fully_paid" }), status).toBe(false);
    }
    for (const status of notCancelable) {
      expect(canCustomerCancelOrder({ status, paymentStatus: "unpaid" }), status).toBe(false);
    }
  });

  it("revision for custom only on revisable statuses", () => {
    for (const status of revisable) {
      expect(canCustomerRequestRevision({ status, orderType: "custom" }), status).toBe(true);
    }
    for (const status of allTerminalOrBlocked()) {
      expect(canCustomerRequestRevision({ status, orderType: "custom" }), status).toBe(false);
    }
  });
});

function allTerminalOrBlocked(): OrderStatus[] {
  return ["draft", "shipped", "delivered", "cancelled"];
}
