import type { OrderStatus, PaymentStatus } from "@/src/types/commerce";

export const ORDER_TRANSITIONS: OrderStatus[] = [
  "pending_deposit",
  "confirmed",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
];

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

/** Staff follow the pipeline; admin may set any listed status (ops correction). */
export function canTransitionStatus(
  current: OrderStatus,
  next: OrderStatus,
  opts?: { unrestricted?: boolean },
): boolean {
  if (current === next) return true;
  if (opts?.unrestricted) {
    return ORDER_TRANSITIONS.includes(next) || next === "draft";
  }
  return STATUS_FLOW[current]?.includes(next) ?? false;
}
