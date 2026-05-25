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

export function canTransitionStatus(current: OrderStatus, next: OrderStatus): boolean {
  return current === next || STATUS_FLOW[current].includes(next);
}
