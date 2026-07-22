import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createServiceClient,
  jsonResponse,
  paymongoFetch,
  PAYMONGO_API_V1,
  resolvePayMongoSecretKey,
  resolvePayMongoWebhookSecret,
  verifyPaymongoSignature,
} from "../_shared/paymongo.ts";
import {
  amountsMatchCentavos,
  resolvePaidOrderUpdate,
  resolvePaymentKindFromSession,
  type PaymentKind,
} from "../_shared/orderPayment.ts";
import { dispatchPaymentReceiptEmail } from "../_shared/dispatchPaymentReceipt.ts";

type CheckoutSessionData = {
  id?: string;
  attributes?: {
    reference_number?: string;
    metadata?: Record<string, unknown>;
    payments?: Array<{
      id?: string;
      attributes?: {
        status?: string;
        amount?: number;
        fee?: number;
        net_amount?: number;
        source?: { type?: string };
      };
    }>;
    payment_intent?: { id?: string };
    status?: string;
  };
};

function extractEvent(payload: unknown): {
  eventId: string;
  eventType: string;
  session: CheckoutSessionData | null;
  livemode: boolean;
} | null {
  const root = payload as Record<string, unknown>;
  const envelope = (root.data ?? root) as Record<string, unknown>;
  const eventType =
    (typeof envelope.type === "string" && envelope.type) ||
    (typeof root.type === "string" && root.type) ||
    "";
  const eventId =
    (typeof envelope.id === "string" && envelope.id) ||
    (typeof root.id === "string" && root.id) ||
    "";
  if (!eventType) return null;

  const nested = (envelope.data ?? root.data) as CheckoutSessionData | undefined;
  const session =
    nested && typeof nested === "object"
      ? nested
      : (envelope as unknown as CheckoutSessionData);

  return {
    eventId: eventId || `${eventType}:${session?.id ?? crypto.randomUUID()}`,
    eventType,
    session: session ?? null,
    livemode: Boolean(envelope.livemode ?? root.livemode),
  };
}

function resolveOrderId(session: CheckoutSessionData): string | null {
  const meta = session.attributes?.metadata;
  if (meta && typeof meta.order_id === "string" && meta.order_id.trim()) {
    return meta.order_id.trim();
  }
  const ref = session.attributes?.reference_number;
  if (typeof ref === "string" && ref.includes(":")) return ref.split(":")[0] ?? null;
  if (typeof ref === "string" && ref.trim()) return ref.trim();
  return null;
}

function resolvePaymentKind(session: CheckoutSessionData): PaymentKind {
  return resolvePaymentKindFromSession({
    metadata: session.attributes?.metadata,
    referenceNumber: session.attributes?.reference_number,
  });
}

async function notifyPaymentConfirmed(
  admin: ReturnType<typeof createServiceClient>,
  orderId: string,
  customerId: string | null,
): Promise<void> {
  if (customerId) {
    await admin.from("og_notifications").insert({
      user_id: customerId,
      title: "Payment confirmed",
      body: `We received your payment for order ${orderId}. A receipt is on the way to your email.`,
      url: `/account/orders/${orderId}`,
      category: "order",
    }).then(({ error }) => {
      if (error) console.error("og_notifications insert", error);
    });
  }

  await dispatchPaymentReceiptEmail(orderId);
}

async function markOrderPaid(
  admin: ReturnType<typeof createServiceClient>,
  orderId: string,
  session: CheckoutSessionData,
  eventType: string,
): Promise<"settled" | "skipped" | "failed"> {
  const { data: order } = await admin
    .from("og_orders")
    .select("id, order_type, payment_status, status, customer_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return "skipped";

  const kind = resolvePaymentKind(session);
  const payment = session.attributes?.payments?.[0];
  const paymentId = payment?.id ?? null;
  const sessionId = session.id ?? null;

  if (eventType.includes("failed") || payment?.attributes?.status === "failed") {
    if (sessionId) {
      await admin
        .from("og_payment_transactions")
        .update({
          status: "failed",
          provider_payment_id: paymentId,
          metadata: {
            payment_kind: kind,
            last_event: eventType,
            fee_centavos: payment?.attributes?.fee ?? null,
          },
        })
        .eq("provider_checkout_session_id", sessionId);
    }
    return "skipped";
  }

  if (order.status === "cancelled") {
    console.warn("paymongo-webhook skip cancelled order", orderId);
    return "skipped";
  }

  // Already settled — still attempt receipt (dedupe in send-order-email).
  if (order.payment_status === "fully_paid" || order.payment_status === "refunded") {
    await dispatchPaymentReceiptEmail(orderId);
    return "settled";
  }
  if (order.payment_status === "deposit_paid" && kind === "deposit") {
    await dispatchPaymentReceiptEmail(orderId);
    return "settled";
  }

  let expectedAmount: number | null = null;
  if (sessionId) {
    const { data: tx } = await admin
      .from("og_payment_transactions")
      .select("amount_centavos")
      .eq("provider_checkout_session_id", sessionId)
      .maybeSingle();
    expectedAmount = typeof tx?.amount_centavos === "number" ? tx.amount_centavos : null;
  }
  const paidAmount = payment?.attributes?.amount;
  if (!amountsMatchCentavos(expectedAmount, paidAmount)) {
    console.error("paymongo-webhook amount mismatch", {
      orderId,
      expectedAmount,
      paidAmount,
    });
    return "failed";
  }

  const next = resolvePaidOrderUpdate({
    orderType: order.order_type === "custom" ? "custom" : "retail",
    paymentKind: kind,
    currentStatus: order.status,
    currentPaymentStatus: order.payment_status,
  });

  if (sessionId) {
    await admin
      .from("og_payment_transactions")
      .update({
        status: "succeeded",
        provider_payment_id: paymentId,
        payment_method: payment?.attributes?.source?.type ?? "qrph",
        metadata: {
          payment_kind: kind,
          last_event: eventType,
          fee_centavos: payment?.attributes?.fee ?? null,
          net_amount_centavos: payment?.attributes?.net_amount ?? null,
          pass_on_fees: false,
        },
      })
      .eq("provider_checkout_session_id", sessionId);
  }

  const { error: updateErr } = await admin
    .from("og_orders")
    .update({
      payment_status: next.paymentStatus,
      status: next.status,
      payment_provider: "paymongo",
      payment_method: "paymongo",
      payment_provider_ref: sessionId ?? paymentId,
    })
    .eq("id", orderId);

  if (updateErr) {
    console.error("markOrderPaid update", updateErr);
    return "failed";
  }

  await notifyPaymentConfirmed(admin, orderId, order.customer_id ?? null);
  return "settled";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, {});
  }

  const rawBody = await req.text();
  let admin: ReturnType<typeof createServiceClient>;
  try {
    admin = createServiceClient();
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: "Server misconfigured." }, 500, {});
  }

  let eventIdForRollback: string | null = null;

  try {
    const webhookSecret = await resolvePayMongoWebhookSecret(admin);
    if (webhookSecret) {
      const header = req.headers.get("Paymongo-Signature") ?? req.headers.get("paymongo-signature");
      const ok = await verifyPaymongoSignature(rawBody, header, webhookSecret);
      if (!ok) {
        return jsonResponse({ error: "Invalid signature." }, 401, {});
      }
    } else {
      // ponytail: bootstrap only — rotate webhook secret in vault for prod.
      console.warn("PAYMONGO_WEBHOOK_SECRET missing — skipping signature verification");
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Invalid JSON." }, 400, {});
    }

    const parsed = extractEvent(payload);
    if (!parsed) {
      return jsonResponse({ received: true, ignored: true }, 200, {});
    }

    const { eventId, eventType, session } = parsed;
    eventIdForRollback = eventId;

    const { error: insertEvtErr } = await admin.from("og_paymongo_webhook_events").insert({
      event_id: eventId,
      event_type: eventType,
      order_id: session ? resolveOrderId(session) : null,
      payload: payload as Record<string, unknown>,
    });

    const isDuplicate = insertEvtErr?.code === "23505";
    if (insertEvtErr && !isDuplicate) {
      console.error("webhook event insert", insertEvtErr);
    }

    const handledTypes = new Set([
      "checkout_session.payment.paid",
      "payment.paid",
      "payment.failed",
      "checkout_session.payment.failed",
    ]);

    if (!handledTypes.has(eventType)) {
      return jsonResponse({ received: true, ignored: true, eventType }, 200, {});
    }

    if (!session) {
      return jsonResponse({ received: true, ignored: true }, 200, {});
    }

    let orderId = resolveOrderId(session);
    if (!orderId && session.id) {
      const { data: tx } = await admin
        .from("og_payment_transactions")
        .select("order_id")
        .eq("provider_checkout_session_id", session.id)
        .maybeSingle();
      orderId = tx?.order_id ?? null;
    }

    if (!orderId) {
      return jsonResponse({ received: true, unmatched: true }, 200, {});
    }

    // Duplicate events still re-run settlement (idempotent) — recovers from partial failures.
    let sessionData = session;
    if (
      eventType === "checkout_session.payment.paid" ||
      eventType === "payment.paid"
    ) {
      if (session.id && (!session.attributes?.payments || session.attributes.payments.length === 0)) {
        try {
          const secretKey = await resolvePayMongoSecretKey(admin);
          const refreshed = await paymongoFetch(
            `${PAYMONGO_API_V1}/checkout_sessions/${session.id}`,
            secretKey,
            { method: "GET" },
          );
          if (refreshed.ok) {
            sessionData = (refreshed.json as { data?: CheckoutSessionData })?.data ?? session;
          }
        } catch {
          // keep original session
        }
      }
    }

    const result = await markOrderPaid(admin, orderId, sessionData, eventType);
    if (result === "failed") {
      if (!isDuplicate && eventIdForRollback) {
        await admin.from("og_paymongo_webhook_events").delete().eq("event_id", eventIdForRollback);
      }
      return jsonResponse({ error: "Settlement failed." }, 500, {});
    }

    return jsonResponse({ received: true, duplicate: isDuplicate }, 200, {});
  } catch (err) {
    console.error("paymongo-webhook", err);
    if (eventIdForRollback) {
      await admin.from("og_paymongo_webhook_events").delete().eq("event_id", eventIdForRollback);
    }
    return jsonResponse({ error: "Webhook processing failed." }, 500, {});
  }
});
