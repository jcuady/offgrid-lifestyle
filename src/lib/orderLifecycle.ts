/**
 * Order lifecycle — single module for fulfillment transitions, cancel window,
 * revision rules, and customer CTAs. UI + DB must agree on this interface.
 */
import type { OrderStatus, OrderType, PaymentStatus } from "@/src/types/commerce";

export const ORDER_TRANSITIONS: OrderStatus[] = [
  "pending_deposit",
  "under_review",
  "revision_requested",
  "confirmed",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
];

/** Admin override select — every durable fulfillment status, including draft. */
export const ADMIN_ORDER_TRANSITIONS: OrderStatus[] = ["draft", ...ORDER_TRANSITIONS];

export const PAYMENT_TRANSITIONS: PaymentStatus[] = ["unpaid", "deposit_paid", "fully_paid", "refunded"];

/**
 * Staff / customer happy-path edges. Admin bypasses via `unrestricted` (UI)
 * and Postgres `og_portal_role() = 'admin'` (DB).
 */
export const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  draft: ["under_review", "pending_deposit", "cancelled"],
  under_review: ["pending_deposit", "revision_requested", "cancelled"],
  pending_deposit: ["confirmed", "under_review", "revision_requested", "cancelled"],
  revision_requested: ["under_review", "pending_deposit", "confirmed", "in_production", "cancelled"],
  confirmed: ["in_production", "revision_requested", "cancelled"],
  in_production: ["shipped", "revision_requested", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** Staff follow the pipeline; admin may set any durable status (ops correction). */
export function canTransitionStatus(
  current: OrderStatus,
  next: OrderStatus,
  opts?: { unrestricted?: boolean },
): boolean {
  if (current === next) return true;
  if (opts?.unrestricted) {
    return ADMIN_ORDER_TRANSITIONS.includes(next);
  }
  return STATUS_FLOW[current]?.includes(next) ?? false;
}

/** Admin may set any payment status; staff have no payment override UI. */
export function canOverridePaymentStatus(
  next: PaymentStatus,
  opts?: { unrestricted?: boolean },
): boolean {
  if (!opts?.unrestricted) return false;
  return PAYMENT_TRANSITIONS.includes(next);
}

/** Customer may cancel while unpaid and not yet in production/shipping. */
export function canCustomerCancelOrder(input: {
  paymentStatus: PaymentStatus | string;
  status: OrderStatus;
}): boolean {
  if (input.paymentStatus !== "unpaid") return false;
  return (
    input.status === "draft" ||
    input.status === "under_review" ||
    input.status === "pending_deposit" ||
    input.status === "revision_requested"
  );
}

/** Customer may request revision until the order ships. */
export function canCustomerRequestRevision(input: {
  status: OrderStatus;
  orderType: OrderType;
}): boolean {
  if (input.orderType !== "custom") return false;
  return (
    input.status === "under_review" ||
    input.status === "pending_deposit" ||
    input.status === "confirmed" ||
    input.status === "in_production" ||
    input.status === "revision_requested"
  );
}

export const REVIEW_SLA_COPY = "We typically review custom orders within 1–3 business days.";
