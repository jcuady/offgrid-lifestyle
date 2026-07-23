import { notifyUser } from "@/src/lib/notifications";
import { logger } from "@/src/lib/logger";
import { sendOrderUpdateEmail } from "@/src/services/emailService";
import { supabase } from "@/src/lib/supabase";
import type { CustomerOrderEvent } from "@/src/lib/customerNotifyEvents";

export type { CustomerOrderEvent } from "@/src/lib/customerNotifyEvents";
export {
  customerEventForFulfillmentStatus,
  customerEventForPaymentStatus,
  fulfillmentAfterPaymentSettle,
} from "@/src/lib/customerNotifyEvents";

const MESSAGES: Record<CustomerOrderEvent, (orderId: string) => { title: string; body: string }> = {
  order_confirmed: (id) => ({
    title: "Order confirmed",
    body: `Order ${id} is confirmed and queued for processing.`,
  }),
  in_production: (id) => ({
    title: "Order in production",
    body: `Order ${id} is now in production. We'll notify you when it ships.`,
  }),
  payment_confirmed: (id) => ({
    title: "Payment confirmed",
    body: `We received your payment for order ${id}. Production will begin soon.`,
  }),
  quote_ready: (id) => ({
    title: "Your custom quote is ready",
    body: `Review the official quote and deposit details for order ${id}.`,
  }),
  shipped: (id) => ({
    title: "Order shipped",
    body: `Order ${id} is on its way. Track it in My orders.`,
  }),
  delivered: (id) => ({
    title: "Order delivered",
    body: `Order ${id} was delivered. Leave a review when you're ready.`,
  }),
};

async function resolveCustomerId(
  orderId: string,
  hint: string | null | undefined,
): Promise<string | null> {
  if (hint) return hint;
  const { data } = await supabase
    .from("og_orders")
    .select("customer_id")
    .eq("id", orderId)
    .maybeSingle();
  return data?.customer_id ?? null;
}

/** In-app + push + email. Actor-agnostic — works for admin, staff, or system callers. */
export async function notifyCustomerOrderEvent(
  customerId: string | null | undefined,
  orderId: string,
  event: CustomerOrderEvent,
): Promise<void> {
  const { title, body } = MESSAGES[event](orderId);
  const resolvedCustomerId = await resolveCustomerId(orderId, customerId);

  if (resolvedCustomerId) {
    try {
      await notifyUser(resolvedCustomerId, {
        title,
        body,
        url: `/account/orders/${orderId}`,
        category: "order",
        tagKey: `${event}-${orderId}`,
      });
      logger.info("Customer notification sent", {
        operation: "notifyCustomerOrderEvent",
        userId: resolvedCustomerId,
        orderId,
        event,
      });
    } catch (err) {
      logger.warn("Customer notification failed", {
        operation: "notifyCustomerOrderEvent",
        userId: resolvedCustomerId,
        orderId,
        event,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  void sendOrderUpdateEmail({ orderId, event });
}
