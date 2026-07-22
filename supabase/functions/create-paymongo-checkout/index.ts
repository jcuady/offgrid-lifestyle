import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { assertOrderPaymentAccess } from "../_shared/orderAccess.ts";
import {
  PAYMONGO_PASS_ON_FEES,
  resolvePaidOrderUpdate,
  resolvePaymentKindFromSession,
  retailPayMongoChargeCentavos,
  type PaymentKind,
} from "../_shared/orderPayment.ts";
import {
  createServiceClient,
  jsonResponse,
  paymongoErrorMessage,
  paymongoFetch,
  PAYMONGO_API_V1,
  PAYMONGO_API_V2,
  resolvePayMongoSecretKey,
  siteBaseUrl,
} from "../_shared/paymongo.ts";

type OrderRow = {
  id: string;
  order_type: "retail" | "custom";
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_provider: string | null;
  customer_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  total_centavos: number | null;
  line_items: unknown;
  custom_payload: Record<string, unknown> | null;
  created_at: string;
};

type TxRow = {
  id: string;
  provider_checkout_session_id: string | null;
  status: string;
  amount_centavos: number | null;
  metadata: Record<string, unknown> | null;
};

function asMoneyAmount(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const amount = (value as { amount?: unknown }).amount;
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? amount : null;
}

function resolveCharge(
  order: OrderRow,
  requestedKind?: PaymentKind,
): { kind: PaymentKind; amountCentavos: number; lineName: string } {
  if (order.order_type === "retail") {
    const amount = retailPayMongoChargeCentavos(order.total_centavos);
    if (amount < 100) throw new Error("Order total is too small to charge via PayMongo.");
    return { kind: "full", amountCentavos: amount, lineName: `OFFGRID order ${order.id}` };
  }

  const payload = order.custom_payload ?? {};
  const officialTotal = asMoneyAmount(payload.officialTotal);
  const officialDeposit = asMoneyAmount(payload.officialDeposit);
  const estimatedDeposit = asMoneyAmount(payload.depositRequired);

  const kind: PaymentKind =
    requestedKind ??
    (order.payment_status === "deposit_paid" ? "balance" : "deposit");

  if (kind === "balance") {
    if (order.payment_status !== "deposit_paid") {
      throw new Error("Balance payment is only available after the deposit is paid.");
    }
    if (!officialTotal || !officialDeposit) {
      throw new Error("Official quote is required before paying the remaining balance.");
    }
    const remaining = Math.round((officialTotal - officialDeposit) * 100);
    if (remaining < 100) throw new Error("No remaining balance to charge.");
    return {
      kind: "balance",
      amountCentavos: remaining,
      lineName: `OFFGRID custom balance ${order.id}`,
    };
  }

  if (order.payment_status !== "unpaid") {
    throw new Error("Deposit is already paid for this order.");
  }
  if (!officialTotal || !officialDeposit) {
    throw new Error("Wait for your official quote before paying via QR Ph.");
  }
  const depositCentavos = Math.round(officialDeposit * 100);
  if (depositCentavos < 100) {
    const fallback = estimatedDeposit ? Math.round(estimatedDeposit * 100) : 0;
    if (fallback < 100) throw new Error("Deposit amount is invalid.");
    return {
      kind: "deposit",
      amountCentavos: fallback,
      lineName: `OFFGRID custom deposit ${order.id}`,
    };
  }
  return {
    kind: "deposit",
    amountCentavos: depositCentavos,
    lineName: `OFFGRID custom deposit ${order.id}`,
  };
}

async function settleFromPaidSession(
  admin: ReturnType<typeof createServiceClient>,
  order: OrderRow,
  sessionId: string,
  kind: PaymentKind,
  paymentId: string | null,
): Promise<OrderRow> {
  const next = resolvePaidOrderUpdate({
    orderType: order.order_type === "custom" ? "custom" : "retail",
    paymentKind: kind,
    currentStatus: order.status,
    currentPaymentStatus: order.payment_status,
  });

  await admin
    .from("og_payment_transactions")
    .update({
      status: "succeeded",
      provider_payment_id: paymentId,
      payment_method: "qrph",
      metadata: {
        payment_kind: kind,
        last_event: "create_checkout_sync",
        pass_on_fees: PAYMONGO_PASS_ON_FEES,
      },
    })
    .eq("provider_checkout_session_id", sessionId);

  await admin
    .from("og_orders")
    .update({
      payment_status: next.paymentStatus,
      status: next.status,
      payment_provider: "paymongo",
      payment_method: "paymongo",
      payment_provider_ref: sessionId,
    })
    .eq("id", order.id);

  return {
    ...order,
    payment_status: next.paymentStatus,
    status: next.status,
    payment_method: "paymongo",
    payment_provider: "paymongo",
  };
}

Deno.serve(async (req: Request) => {
  const cors = corsHeadersFor(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, cors);
  }

  try {
    const body = (await req.json()) as {
      orderId?: string;
      paymentKind?: PaymentKind;
      email?: string;
    };
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId || orderId.length > 64) {
      return jsonResponse({ error: "A valid orderId is required." }, 400, cors);
    }

    const admin = createServiceClient();
    const { data: order, error: orderErr } = await admin
      .from("og_orders")
      .select(
        "id, order_type, status, payment_status, payment_method, payment_provider, customer_id, customer_email, customer_name, total_centavos, line_items, custom_payload, created_at",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return jsonResponse({ error: "Order not found." }, 404, cors);
    }

    const row = order as OrderRow;
    const access = await assertOrderPaymentAccess({
      req,
      admin,
      order: row,
      claimEmail: typeof body.email === "string" ? body.email : undefined,
    });
    if (!access.ok) {
      return jsonResponse({ error: access.error }, access.status, cors);
    }

    if (row.status === "cancelled") {
      return jsonResponse({ error: "This order was cancelled." }, 400, cors);
    }
    if (row.payment_status === "fully_paid" || row.payment_status === "refunded") {
      return jsonResponse({ error: "This order is already settled.", alreadyPaid: true }, 400, cors);
    }

    if (row.order_type === "retail" && row.payment_method !== "paymongo") {
      return jsonResponse({ error: "This order was not placed with PayMongo." }, 400, cors);
    }

    let charge: { kind: PaymentKind; amountCentavos: number; lineName: string };
    try {
      charge = resolveCharge(row, body.paymentKind);
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : "Could not determine charge amount." },
        400,
        cors,
      );
    }

    const { data: existingTx } = await admin
      .from("og_payment_transactions")
      .select("id, provider_checkout_session_id, status, amount_centavos, metadata")
      .eq("order_id", orderId)
      .eq("provider", "paymongo")
      .order("created_at", { ascending: false })
      .limit(8);

    const secretKey = await resolvePayMongoSecretKey(admin);
    const base = siteBaseUrl(req);
    const successUrl = `${base}/checkout/paymongo/complete?order_id=${encodeURIComponent(orderId)}`;
    const cancelUrl = `${base}/checkout/paymongo/retry?order_id=${encodeURIComponent(orderId)}`;

    let liveOrder = row;

    for (const tx of (existingTx ?? []) as TxRow[]) {
      const metaKind =
        typeof tx.metadata?.payment_kind === "string" ? tx.metadata.payment_kind : null;
      if (metaKind && metaKind !== charge.kind) continue;
      if (
        typeof tx.amount_centavos === "number" &&
        tx.amount_centavos > 0 &&
        tx.amount_centavos !== charge.amountCentavos
      ) {
        continue;
      }
      const sessionId = tx.provider_checkout_session_id;
      if (!sessionId) continue;

      const existing = await paymongoFetch(
        `${PAYMONGO_API_V1}/checkout_sessions/${sessionId}`,
        secretKey,
        { method: "GET" },
      );
      if (!existing.ok) continue;
      const attrs = (existing.json as { data?: { attributes?: Record<string, unknown> } })?.data
        ?.attributes;
      const status = typeof attrs?.status === "string" ? attrs.status : "";
      const checkoutUrl = typeof attrs?.checkout_url === "string" ? attrs.checkout_url : "";
      const payments = Array.isArray(attrs?.payments) ? attrs.payments : [];
      const paidPayment = payments.find((p) => {
        const st = (p as { attributes?: { status?: string } })?.attributes?.status;
        return st === "paid" || st === "succeeded";
      }) as { id?: string } | undefined;
      const looksPaid = status === "paid" || Boolean(paidPayment);

      // Already paid on PayMongo but DB lag — settle, never open a second charge.
      if (looksPaid) {
        const kind = resolvePaymentKindFromSession({
          metadata: (attrs?.metadata as Record<string, unknown> | undefined) ?? tx.metadata,
          referenceNumber: typeof attrs?.reference_number === "string" ? attrs.reference_number : null,
          fallback: charge.kind,
        });
        if (!(liveOrder.payment_status === "deposit_paid" && kind === "deposit")) {
          if (liveOrder.status !== "cancelled") {
            liveOrder = await settleFromPaidSession(
              admin,
              liveOrder,
              sessionId,
              kind,
              paidPayment?.id ?? null,
            );
          }
        }
        return jsonResponse(
          {
            alreadyPaid: true,
            checkoutSessionId: sessionId,
            checkoutUrl: null,
            status: "paid",
            amountCentavos: charge.amountCentavos,
            paymentKind: kind,
            paymentStatus: liveOrder.payment_status,
            orderStatus: liveOrder.status,
            reused: true,
          },
          200,
          cors,
        );
      }

      if (
        checkoutUrl &&
        status !== "expired" &&
        status !== "inactive" &&
        ["pending", "awaiting_payment_method", "processing"].includes(tx.status)
      ) {
        return jsonResponse(
          {
            checkoutSessionId: sessionId,
            checkoutUrl,
            status: "pending",
            amountCentavos: charge.amountCentavos,
            paymentKind: charge.kind,
            reused: true,
          },
          200,
          cors,
        );
      }
    }

    const payload = {
      data: {
        attributes: {
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          description: charge.lineName,
          line_items: [
            {
              name: charge.lineName,
              quantity: 1,
              currency: "PHP",
              amount: charge.amountCentavos,
            },
          ],
          payment_method_types: ["qrph"],
          pass_on_fees: PAYMONGO_PASS_ON_FEES,
          success_url: successUrl,
          cancel_url: cancelUrl,
          reference_number: `${orderId}:${charge.kind}`,
          metadata: {
            order_id: orderId,
            order_type: liveOrder.order_type,
            payment_kind: charge.kind,
          },
          billing: {
            name: liveOrder.customer_name || "OFFGRID Customer",
            email: liveOrder.customer_email || undefined,
          },
        },
      },
    };

    const created = await paymongoFetch(`${PAYMONGO_API_V2}/checkout_sessions`, secretKey, {
      method: "POST",
      body: JSON.stringify(payload),
      idempotencyKey: `${orderId}:${charge.kind}:${charge.amountCentavos}`,
    });

    if (!created.ok) {
      return jsonResponse(
        { error: paymongoErrorMessage(created.json) },
        created.status >= 400 && created.status < 600 ? created.status : 502,
        cors,
      );
    }

    const session = (created.json as {
      data?: { id?: string; attributes?: { checkout_url?: string } };
    })?.data;
    const checkoutSessionId = session?.id;
    const checkoutUrl = session?.attributes?.checkout_url;
    if (!checkoutSessionId || !checkoutUrl) {
      return jsonResponse({ error: "PayMongo did not return a checkout URL." }, 502, cors);
    }

    const { error: txErr } = await admin.from("og_payment_transactions").insert({
      order_id: orderId,
      order_type: liveOrder.order_type,
      provider: "paymongo",
      provider_checkout_session_id: checkoutSessionId,
      amount_centavos: charge.amountCentavos,
      currency: "PHP",
      status: "awaiting_payment_method",
      payment_method: "qrph",
      metadata: {
        payment_kind: charge.kind,
        pass_on_fees: PAYMONGO_PASS_ON_FEES,
      },
    });

    if (txErr) {
      console.error("og_payment_transactions insert failed", txErr);
      return jsonResponse({ error: "Could not record payment transaction." }, 500, cors);
    }

    await admin
      .from("og_orders")
      .update({
        payment_method: "paymongo",
        payment_provider: "paymongo",
        payment_provider_ref: checkoutSessionId,
      })
      .eq("id", orderId);

    return jsonResponse(
      {
        checkoutSessionId,
        checkoutUrl,
        status: "awaiting_payment_method",
        amountCentavos: charge.amountCentavos,
        paymentKind: charge.kind,
        reused: false,
      },
      200,
      cors,
    );
  } catch (err) {
    console.error("create-paymongo-checkout", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Could not start PayMongo checkout." },
      500,
      cors,
    );
  }
});
