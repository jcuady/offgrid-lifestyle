/** Pure helpers shared by send-push authorization and unit tests. */

export const RECENT_GUEST_ORDER_MS = 10 * 60 * 1000;

export type OperationalAlertType = "new_retail_order" | "new_custom_order" | "payment_proof";

export interface OperationalPushContext {
  orderCustomerId: string | null;
  orderCreatedAt: string;
  alertType: OperationalAlertType;
  callerPortalId: string | null;
  callerRole: "admin" | "staff" | "customer" | null;
  nowMs?: number;
}

export function isRecentGuestOrder(customerId: string | null, createdAt: string, nowMs = Date.now()): boolean {
  if (customerId) return false;
  const ageMs = nowMs - new Date(createdAt).getTime();
  return ageMs >= 0 && ageMs < RECENT_GUEST_ORDER_MS;
}

/** Whether the caller may trigger a staff operational Web Push for this order. */
export function canDispatchOperationalPush(ctx: OperationalPushContext): boolean {
  const isStaffOrAdmin = ctx.callerRole === "admin" || ctx.callerRole === "staff";
  const isOwner = Boolean(ctx.orderCustomerId && ctx.callerPortalId === ctx.orderCustomerId);
  // Order owner may alert staff for new order + payment proof on their own order.
  const isOwnerOperationalAlert =
    isOwner &&
    (ctx.alertType === "payment_proof" ||
      ctx.alertType === "new_retail_order" ||
      ctx.alertType === "new_custom_order");
  // Guest checkout may alert staff only for new-order events inside the time window.
  const isGuestCheckoutAlert =
    isRecentGuestOrder(ctx.orderCustomerId, ctx.orderCreatedAt, ctx.nowMs) &&
    (ctx.alertType === "new_retail_order" || ctx.alertType === "new_custom_order");

  return isStaffOrAdmin || isOwnerOperationalAlert || isGuestCheckoutAlert;
}

export function portalOrderDetailPath(
  orderId: string,
  role: "admin" | "staff" | "customer" | null,
): string {
  if (role === "admin") return `/portal/admin/orders/${orderId}`;
  if (role === "staff") return `/portal/staff/orders/${orderId}`;
  return `/portal/orders/${orderId}`;
}

/** Neutral path used in push payloads; redirects by signed-in portal role. */
export function operationalPushUrl(orderId: string): string {
  return `/portal/orders/${orderId}`;
}
