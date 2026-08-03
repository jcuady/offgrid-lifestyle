import type { PaymentStatus } from "@/src/types/commerce";
import {
  isGcashQrReady,
  isPayMongoCheckoutAvailable,
  type PayMongoSettings,
} from "@/src/types/payments";
import { customOrderGCashAmountDue, hasOfficialCustomQuote } from "@/src/lib/portal";

export type CustomOrderPaymentPhase =
  | "awaiting_quote"
  | "pay_deposit"
  | "pay_balance"
  | "settled"
  | "unavailable";

export function resolveCustomOrderPaymentPhase(input: {
  paymentStatus: PaymentStatus | string;
  officialTotal?: { amount: number; currency: string } | null;
}): CustomOrderPaymentPhase {
  if (input.paymentStatus === "fully_paid" || input.paymentStatus === "refunded") {
    return "settled";
  }
  if (!hasOfficialCustomQuote(input.officialTotal)) return "awaiting_quote";
  if (input.paymentStatus === "deposit_paid") return "pay_balance";
  if (input.paymentStatus === "unpaid") {
    return "pay_deposit";
  }
  return "unavailable";
}

export function customOrderPayMongoKind(
  phase: CustomOrderPaymentPhase,
): "deposit" | "balance" | null {
  if (phase === "pay_deposit") return "deposit";
  if (phase === "pay_balance") return "balance";
  return null;
}

export function isCustomOrderPayMongoActionAvailable(
  phase: CustomOrderPaymentPhase,
  paymongo: PayMongoSettings,
): boolean {
  if (!customOrderPayMongoKind(phase)) return false;
  return isPayMongoCheckoutAvailable("paymongo", paymongo);
}

export function isCustomOrderGCashActionAvailable(
  phase: CustomOrderPaymentPhase,
  gcashQrImageUrl: string | null | undefined,
  amounts: {
    paymentStatus: string;
    officialTotal?: { amount: number; currency: string } | null;
    officialDeposit?: { amount: number; currency: string } | null;
  },
): boolean {
  if (phase !== "pay_deposit" && phase !== "pay_balance") return false;
  if (!isGcashQrReady(gcashQrImageUrl)) return false;
  return customOrderGCashAmountDue(amounts) !== null;
}

/** Account list / detail CTA label for the active payment phase. */
export function customOrderPaymentCtaLabel(phase: CustomOrderPaymentPhase): string | null {
  if (phase === "pay_deposit") return "Pay now";
  if (phase === "pay_balance") return "Pay remaining balance";
  return null;
}
