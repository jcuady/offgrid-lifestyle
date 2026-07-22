/**
 * Fire-and-forget customer payment receipt via send-order-email.
 * Dedup lives inside send-order-email (og_order_email_log).
 */
export async function dispatchPaymentReceiptEmail(orderId: string): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey || !orderId) return;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event: "payment_confirmed", order_id: orderId }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("dispatchPaymentReceiptEmail", res.status, text);
    }
  } catch (err) {
    console.error("dispatchPaymentReceiptEmail", err);
  }
}
