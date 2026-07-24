/**
 * Inbox + Web Push + receipt email after PayMongo settlement.
 * Shared by webhook, payment-status sync, and create-checkout reuse.
 */
import { dispatchPaymentConfirmedPush } from "./dispatchPaymentPush.ts";
import { dispatchPaymentReceiptEmail } from "./dispatchPaymentReceipt.ts";
import { resolvePaymentPushUserIds } from "./paymentPushRecipients.ts";
import type { createServiceClient } from "./paymongo.ts";

type AdminClient = ReturnType<typeof createServiceClient>;

export async function notifyPaymentConfirmed(
  admin: AdminClient,
  orderId: string,
  customerId: string | null,
  customerEmail: string | null,
): Promise<void> {
  const emailMatchedUserIds: string[] = [];
  const email = customerEmail?.trim();
  if (email) {
    const { data } = await admin
      .from("og_portal_users")
      .select("id")
      .eq("role", "customer")
      .eq("status", "active")
      .ilike("email", email);
    for (const row of data ?? []) {
      if (row.id) emailMatchedUserIds.push(row.id);
    }
  }

  const recipientIds = resolvePaymentPushUserIds({
    customerId,
    emailMatchedUserIds,
  });

  for (const userId of recipientIds) {
    const { error } = await admin.from("og_notifications").insert({
      user_id: userId,
      title: "Payment confirmed",
      body: `We received your payment for order ${orderId}. A receipt is on the way to your email.`,
      url: `/account/orders/${orderId}`,
      category: "order",
    });
    if (error) console.error("og_notifications insert", error);
  }

  void dispatchPaymentConfirmedPush(orderId, recipientIds);
  await dispatchPaymentReceiptEmail(orderId);
}
