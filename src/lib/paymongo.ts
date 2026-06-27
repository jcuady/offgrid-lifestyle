/**
 * PayMongo integration stubs — checkout is not live yet.
 *
 * Production flow (when enabled):
 * 1. Client requests checkout session from your API (never call PayMongo secret key from browser).
 * 2. API creates PayMongo Checkout Session / Payment Intent → stores row in `og_payment_transactions`.
 * 3. Customer completes payment on PayMongo hosted page.
 * 4. Webhook (`PAYMONGO_WEBHOOK_SECRET`) updates `og_payment_transactions` + `og_orders.payment_status`.
 *
 * Server env (Render / Edge Function): PAYMONGO_SECRET_KEY, PAYMONGO_WEBHOOK_SECRET
 * Client / admin UI: public key only via `og_payment_settings.paymongo_public_key`
 */

import type { PayMongoTransactionStatus } from "@/src/types/payments";

export const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

export interface CreatePayMongoCheckoutInput {
  orderId: string;
  orderType: "retail" | "custom";
  amountCentavos: number;
  currency?: string;
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PayMongoCheckoutSessionStub {
  checkoutSessionId: string;
  checkoutUrl: string;
  status: PayMongoTransactionStatus;
}

/** Throws until a server endpoint is wired. Client must not create sessions directly. */
export async function createPayMongoCheckoutSession(
  _input: CreatePayMongoCheckoutInput,
): Promise<PayMongoCheckoutSessionStub> {
  throw new Error(
    "PayMongo checkout is coming soon. Use GCash QR, COD, or card for now.",
  );
}

/** Webhook event types we will handle in production. */
export const PAYMONGO_WEBHOOK_EVENTS = [
  "checkout_session.payment.paid",
  "payment.paid",
  "payment.failed",
] as const;

export function paymongoWebhookPath(): string {
  return "/api/webhooks/paymongo";
}
