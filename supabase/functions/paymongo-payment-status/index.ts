import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { assertOrderPaymentAccess } from "../_shared/orderAccess.ts";
import {
  createServiceClient,
  jsonResponse,
  paymongoErrorMessage,
  paymongoFetch,
  PAYMONGO_API_V1,
  resolvePayMongoSecretKey,
} from "../_shared/paymongo.ts";
import {
  amountsMatchCentavos,
  PAYMONGO_PASS_ON_FEES,
  resolvePaidOrderUpdate,
  resolvePaymentKindFromSession,
  type PaymentKind,
} from "../_shared/orderPayment.ts";
import { dispatchPaymentReceiptEmail } from "../_shared/dispatchPaymentReceipt.ts";

type CheckoutSessionData = {
  id?: string;
  attributes?: {
    status?: string;
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
    checkout_url?: string;
  };
};

Deno.serve(async (req: Request) => {
  const cors = corsHeadersFor(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, cors);
  }

  try {
    const url = new URL(req.url);
    let orderId = url.searchParams.get("order_id")?.trim() ?? "";
    let sessionId = url.searchParams.get("session_id")?.trim() ?? "";
    let sync = url.searchParams.get("sync") === "1";
    let claimEmail = url.searchParams.get("email")?.trim() ?? "";

    if (req.method === "POST") {
      const body = (await req.json()) as {
        orderId?: string;
        sessionId?: string;
        sync?: boolean;
        email?: string;
      };
      orderId = typeof body.orderId === "string" ? body.orderId.trim() : orderId;
      sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : sessionId;
      claimEmail = typeof body.email === "string" ? body.email.trim() : claimEmail;
      if (body.sync) sync = true;
    }

    if (!orderId) {
      return jsonResponse({ error: "orderId is required." }, 400, cors);
    }

    const admin = createServiceClient();
    const { data: order, error } = await admin
      .from("og_orders")
      .select(
        "id, order_type, status, payment_status, payment_method, payment_provider, payment_provider_ref, total_centavos, customer_id, customer_email, created_at",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (error || !order) {
      return jsonResponse({ error: "Order not found." }, 404, cors);
    }

    const access = await assertOrderPaymentAccess({
      req,
      admin,
      order: {
        id: order.id,
        customer_id: order.customer_id,
        customer_email: order.customer_email,
        created_at: order.created_at,
      },
      claimEmail,
    });
    if (!access.ok) {
      return jsonResponse({ error: access.error }, access.status, cors);
    }

    if (!sessionId) {
      sessionId = (order.payment_provider_ref as string | null) ?? "";
    }
    if (!sessionId) {
      const { data: tx } = await admin
        .from("og_payment_transactions")
        .select("provider_checkout_session_id")
        .eq("order_id", orderId)
        .eq("provider", "paymongo")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      sessionId = tx?.provider_checkout_session_id ?? "";
    }

    let checkoutStatus: string | null = null;
    let checkoutUrl: string | null = null;
    let synced = false;

    const needsSettlement =
      order.status !== "cancelled" &&
      (order.payment_status === "unpaid" ||
        (order.order_type === "custom" && order.payment_status === "deposit_paid"));

    if (sessionId && (sync || needsSettlement)) {
      try {
        const secretKey = await resolvePayMongoSecretKey(admin);
        const remote = await paymongoFetch(
          `${PAYMONGO_API_V1}/checkout_sessions/${sessionId}`,
          secretKey,
          { method: "GET" },
        );
        if (remote.ok) {
          const session = (remote.json as { data?: CheckoutSessionData })?.data;
          checkoutStatus = session?.attributes?.status ?? null;
          checkoutUrl = session?.attributes?.checkout_url ?? null;
          const paidPayment = session?.attributes?.payments?.find(
            (p) => p.attributes?.status === "paid" || p.attributes?.status === "succeeded",
          );
          const looksPaid =
            checkoutStatus === "paid" ||
            Boolean(paidPayment) ||
            (Array.isArray(session?.attributes?.payments) &&
              session!.attributes!.payments!.length > 0 &&
              session!.attributes!.payments!.some((p) => p.attributes?.status === "paid"));

          if (looksPaid && needsSettlement) {
            const kind = resolvePaymentKindFromSession({
              metadata: session?.attributes?.metadata,
              referenceNumber: session?.attributes?.reference_number,
              fallback: "full",
            });

            if (!(order.payment_status === "deposit_paid" && kind === "deposit")) {
              const { data: tx } = await admin
                .from("og_payment_transactions")
                .select("amount_centavos")
                .eq("provider_checkout_session_id", sessionId)
                .maybeSingle();
              const expected =
                typeof tx?.amount_centavos === "number" ? tx.amount_centavos : null;
              const paidAmount = paidPayment?.attributes?.amount ?? null;
              if (!amountsMatchCentavos(expected, paidAmount)) {
                console.error("paymongo-payment-status amount mismatch", {
                  orderId,
                  expected,
                  paidAmount,
                });
              } else {
                const paymentId = paidPayment?.id ?? session?.attributes?.payments?.[0]?.id ?? null;

                await admin
                  .from("og_payment_transactions")
                  .update({
                    status: "succeeded",
                    provider_payment_id: paymentId,
                    payment_method: paidPayment?.attributes?.source?.type ?? "qrph",
                    metadata: {
                      payment_kind: kind,
                      last_event: "client_sync",
                      fee_centavos: paidPayment?.attributes?.fee ?? null,
                      pass_on_fees: PAYMONGO_PASS_ON_FEES,
                    },
                  })
                  .eq("provider_checkout_session_id", sessionId);

                const next = resolvePaidOrderUpdate({
                  orderType: order.order_type === "custom" ? "custom" : "retail",
                  paymentKind: kind,
                  currentStatus: order.status,
                  currentPaymentStatus: order.payment_status,
                });

                await admin
                  .from("og_orders")
                  .update({
                    payment_status: next.paymentStatus,
                    status: next.status,
                    payment_provider: "paymongo",
                    payment_method: "paymongo",
                    payment_provider_ref: sessionId,
                  })
                  .eq("id", orderId);

                synced = true;
                order.payment_status = next.paymentStatus;
                order.status = next.status;
                await dispatchPaymentReceiptEmail(orderId);
              }
            } else {
              await dispatchPaymentReceiptEmail(orderId);
            }
          } else if (checkoutStatus === "expired" || checkoutStatus === "inactive") {
            await admin
              .from("og_payment_transactions")
              .update({ status: "cancelled" })
              .eq("provider_checkout_session_id", sessionId)
              .in("status", ["pending", "awaiting_payment_method", "processing"]);
          }
        } else {
          console.warn("paymongo status fetch", paymongoErrorMessage(remote.json));
        }
      } catch (err) {
        console.error("paymongo-payment-status sync", err);
      }
    }

    const paid = order.payment_status === "fully_paid";
    const depositSettled = order.payment_status === "deposit_paid" || paid;

    if (sync && depositSettled && !synced) {
      await dispatchPaymentReceiptEmail(orderId);
    }

    return jsonResponse(
      {
        orderId: order.id,
        orderType: order.order_type,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        paid: depositSettled,
        fullyPaid: paid,
        checkoutSessionId: sessionId || null,
        checkoutStatus,
        checkoutUrl,
        synced,
        canRetry: !paid && order.payment_status !== "refunded" && order.status !== "cancelled",
      },
      200,
      cors,
    );
  } catch (err) {
    console.error("paymongo-payment-status", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Could not load payment status." },
      500,
      cors,
    );
  }
});
