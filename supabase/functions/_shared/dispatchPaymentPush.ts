/**
 * Fire-and-forget customer Web Push after PayMongo settlement.
 * Uses send-push with the service role (targeted user_ids only).
 */
export async function dispatchPaymentConfirmedPush(
  orderId: string,
  userIds: string[],
): Promise<void> {
  if (!orderId || !userIds.length) return;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Payment confirmed",
        body: `We received your payment for order ${orderId}.`,
        url: `/account/orders/${orderId}`,
        user_ids: userIds.slice(0, 50),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("dispatchPaymentConfirmedPush", res.status, text);
    }
  } catch (err) {
    console.error("dispatchPaymentConfirmedPush", err);
  }
}
