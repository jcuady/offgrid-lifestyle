import { notifyUser } from "@/src/lib/notifications";
import { logger } from "@/src/lib/logger";
import { sendOrderUpdateEmail } from "@/src/services/emailService";

export type CustomerOrderEvent =
  | "payment_confirmed"
  | "quote_ready"
  | "shipped"
  | "delivered";

const MESSAGES: Record<CustomerOrderEvent, (orderId: string) => { title: string; body: string }> = {
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

/** In-app + push + email notification for a customer order event. */
export async function notifyCustomerOrderEvent(
  customerId: string | null | undefined,
  orderId: string,
  event: CustomerOrderEvent,
): Promise<void> {
  const { title, body } = MESSAGES[event](orderId);

  if (customerId) {
    try {
      await notifyUser(customerId, {
        title,
        body,
        url: `/account/orders/${orderId}`,
        category: "order",
      });
      logger.info("Customer notification sent", {
        operation: "notifyCustomerOrderEvent",
        userId: customerId,
        orderId,
        event,
      });
    } catch (err) {
      logger.warn("Customer notification failed", {
        operation: "notifyCustomerOrderEvent",
        userId: customerId,
        orderId,
        event,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  void sendOrderUpdateEmail({ orderId, event });
}
