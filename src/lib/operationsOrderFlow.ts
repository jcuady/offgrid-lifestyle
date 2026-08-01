import type { OrderStatus, PaymentStatus } from "@/src/types/commerce";

export const ORDER_TRANSITIONS: OrderStatus[] = [
  "pending_deposit",
  "confirmed",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
];

/** Admin override select — every durable fulfillment status, including draft. */
export const ADMIN_ORDER_TRANSITIONS: OrderStatus[] = ["draft", ...ORDER_TRANSITIONS];

export const PAYMENT_TRANSITIONS: PaymentStatus[] = ["unpaid", "deposit_paid", "fully_paid", "refunded"];

export const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending_deposit", "cancelled"],
  pending_deposit: ["confirmed", "cancelled"],
  confirmed: ["in_production", "cancelled"],
  in_production: ["shipped", "cancelled"],
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
