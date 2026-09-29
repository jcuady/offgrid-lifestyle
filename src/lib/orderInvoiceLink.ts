import { operationalPushUrl } from "@/src/lib/pushAuth";

/** Customer order page, scrolled to the invoice the email already sent. */
export function customerOrderPageUrl(orderId: string): string {
  return `/account/orders/${orderId}#invoice`;
}

/** Operations order page, scrolled to the same invoice. */
export function staffOrderNotificationUrl(orderId: string): string {
  return `${operationalPushUrl(orderId)}#invoice`;
}
