import { notificationService } from "@/src/services/notificationService";
import { sendPushNotification, type OperationalAlertType } from "@/src/lib/pushSubscription";
import { logger } from "@/src/lib/logger";

export interface NotifyPayload {
  title: string;
  body: string;
  url?: string;
  category?: string;
}

/** Persist in-app notification and send Web Push when subscribed. */
export async function notifyUser(userId: string, payload: NotifyPayload): Promise<void> {
  await notificationService.create({
    userId,
    title: payload.title,
    body: payload.body,
    url: payload.url,
    category: payload.category ?? "order",
  });

  try {
    await sendPushNotification({
      title: payload.title,
      body: payload.body,
      url: payload.url,
      userIds: [userId],
    });
  } catch (err) {
    logger.warn("Push delivery failed", {
      operation: "notifyUser",
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function notifyUsers(userIds: string[], payload: NotifyPayload): Promise<void> {
  const unique = [...new Set(userIds.filter(Boolean))];
  await Promise.all(unique.map((userId) => notifyUser(userId, payload)));
}

export type StaffOrderEvent = "new_retail_order" | "new_custom_order" | "payment_proof";

const STAFF_MESSAGES: Record<StaffOrderEvent, (orderId: string) => NotifyPayload> = {
  new_retail_order: (id) => ({
    title: "New shop order",
    body: `Retail order ${id} needs review in Operations.`,
    url: `/portal/admin/orders/${id}`,
    category: "operations",
  }),
  new_custom_order: (id) => ({
    title: "New custom request",
    body: `Custom order ${id} was submitted and awaits quote review.`,
    url: `/portal/admin/orders/${id}`,
    category: "operations",
  }),
  payment_proof: (id) => ({
    title: "Payment proof uploaded",
    body: `Customer uploaded payment proof for order ${id}.`,
    url: `/portal/admin/orders/${id}`,
    category: "payment",
  }),
};

/** Web Push to staff/admin. In-app inbox rows are created by database triggers. */
export async function notifyStaffOrderEvent(orderId: string, event: StaffOrderEvent): Promise<void> {
  const payload = STAFF_MESSAGES[event](orderId);
  try {
    await sendPushNotification({
      title: payload.title,
      body: payload.body,
      url: payload.url,
      operationalAlert: { orderId, alertType: event as OperationalAlertType },
    });
  } catch (err) {
    logger.warn("Staff push delivery failed", {
      operation: "notifyStaffOrderEvent",
      orderId,
      event,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
