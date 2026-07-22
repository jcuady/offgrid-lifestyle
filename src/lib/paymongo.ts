/**
 * PayMongo QR Ph client — talks to Supabase Edge Functions only.
 * Secret key never leaves the server / Vault.
 *
 * Flow: create checkout → redirect to hosted QR Ph → webhook or client sync marks paid.
 * OFFGRID sets pass_on_fees: false so the customer is not charged the processing fee.
 */

import { buildEdgeFunctionHeaders, readEdgeFunctionError } from "@/src/lib/edgeRequest";
import { supabase } from "@/src/lib/supabase";
import type { PayMongoTransactionStatus } from "@/src/types/payments";

export const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

/** Must stay false — merchant absorbs QR Ph processing fee (mirrors Edge checkout payload). */
export const PAYMONGO_PASS_ON_FEES = false as const;

export type PayMongoPaymentKind = "full" | "deposit" | "balance";

export interface CreatePayMongoCheckoutInput {
  orderId: string;
  paymentKind?: PayMongoPaymentKind;
  email?: string;
}

export interface PayMongoCheckoutSession {
  checkoutSessionId: string;
  checkoutUrl: string | null;
  status: PayMongoTransactionStatus | string;
  amountCentavos: number;
  paymentKind: PayMongoPaymentKind;
  reused?: boolean;
  alreadyPaid?: boolean;
  paymentStatus?: string;
  orderStatus?: string;
}

export interface PayMongoPaymentStatus {
  orderId: string;
  orderType: "retail" | "custom";
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  /** True when deposit or full payment is settled. */
  paid: boolean;
  fullyPaid?: boolean;
  checkoutSessionId: string | null;
  checkoutStatus: string | null;
  checkoutUrl: string | null;
  synced: boolean;
  canRetry: boolean;
  error?: string;
}

/** Webhook event types handled by `paymongo-webhook`. */
export const PAYMONGO_WEBHOOK_EVENTS = [
  "checkout_session.payment.paid",
  "payment.paid",
  "payment.failed",
  "checkout_session.payment.failed",
] as const;

const EMAIL_KEY_PREFIX = "og_pm_email:";

export function rememberPayMongoOrderEmail(orderId: string, email: string): void {
  const id = orderId.trim();
  const value = email.trim().toLowerCase();
  if (!id || !value || typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(`${EMAIL_KEY_PREFIX}${id}`, value);
}

export function recallPayMongoOrderEmail(orderId: string): string | undefined {
  if (typeof sessionStorage === "undefined") return undefined;
  return sessionStorage.getItem(`${EMAIL_KEY_PREFIX}${orderId.trim()}`) ?? undefined;
}

export function paymongoWebhookPath(): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) return "/functions/v1/paymongo-webhook";
  return `${base.replace(/\/$/, "")}/functions/v1/paymongo-webhook`;
}

async function edgeSessionToken(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

function functionsBase(): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) throw new Error("Missing VITE_SUPABASE_URL.");
  return `${base.replace(/\/$/, "")}/functions/v1`;
}

function resolveClaimEmail(orderId: string, email?: string): string | undefined {
  const trimmed = email?.trim();
  if (trimmed) {
    rememberPayMongoOrderEmail(orderId, trimmed);
    return trimmed.toLowerCase();
  }
  return recallPayMongoOrderEmail(orderId);
}

/** Creates a QR Ph hosted checkout session and returns the redirect URL. */
export async function createPayMongoCheckoutSession(
  input: CreatePayMongoCheckoutInput,
): Promise<PayMongoCheckoutSession> {
  const orderId = input.orderId?.trim();
  if (!orderId) throw new Error("Order id is required to start PayMongo checkout.");

  const email = resolveClaimEmail(orderId, input.email);
  const token = await edgeSessionToken();
  const response = await fetch(`${functionsBase()}/create-paymongo-checkout`, {
    method: "POST",
    headers: buildEdgeFunctionHeaders(token, true),
    body: JSON.stringify({
      orderId,
      paymentKind: input.paymentKind,
      email,
    }),
  });

  if (!response.ok) {
    throw new Error(await readEdgeFunctionError(response));
  }

  const json = (await response.json()) as PayMongoCheckoutSession & { error?: string };
  if (json.alreadyPaid) return json;
  if (!json.checkoutUrl || !json.checkoutSessionId) {
    throw new Error(json.error ?? "PayMongo did not return a checkout URL.");
  }
  return json;
}

/** Redirect helper — use after create. */
export function redirectToPayMongoCheckout(checkoutUrl: string): void {
  if (!checkoutUrl.startsWith("https://")) {
    throw new Error("Invalid PayMongo checkout URL.");
  }
  window.location.assign(checkoutUrl);
}

/** Poll / sync payment status after return from PayMongo (or on retry page). */
export async function fetchPayMongoPaymentStatus(input: {
  orderId: string;
  sessionId?: string;
  sync?: boolean;
  email?: string;
}): Promise<PayMongoPaymentStatus> {
  const orderId = input.orderId?.trim();
  if (!orderId) throw new Error("Order id is required.");

  const email = resolveClaimEmail(orderId, input.email);
  const token = await edgeSessionToken();
  const response = await fetch(`${functionsBase()}/paymongo-payment-status`, {
    method: "POST",
    headers: buildEdgeFunctionHeaders(token, true),
    body: JSON.stringify({
      orderId,
      sessionId: input.sessionId,
      sync: input.sync ?? true,
      email,
    }),
  });

  if (!response.ok) {
    throw new Error(await readEdgeFunctionError(response));
  }

  return (await response.json()) as PayMongoPaymentStatus;
}
