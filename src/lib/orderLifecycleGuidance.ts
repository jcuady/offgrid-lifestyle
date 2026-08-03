/**
 * Step-by-step copy for custom-order lifecycle — customer + admin.
 * Keeps guidance locality next to STATUS_FLOW rules in orderLifecycle.
 */
import type { OrderStatus, PaymentStatus } from "@/src/types/commerce";
import { REVIEW_SLA_COPY } from "@/src/lib/orderLifecycle";
import { resolveCustomOrderPaymentPhase } from "@/src/lib/customOrderPayment";

export type LifecycleGuide = {
  title: string;
  body: string;
  /** Highlighted next step for the actor */
  nextStep: string;
  tone: "wait" | "action" | "done" | "warn";
};

export function customerCustomLifecycleGuide(input: {
  status: OrderStatus;
  paymentStatus: PaymentStatus | string;
  hasOfficialQuote: boolean;
}): LifecycleGuide {
  if (input.status === "cancelled") {
    return {
      title: "Order cancelled",
      body: "This custom order is cancelled. Start a new request anytime from Custom.",
      nextStep: "No action needed",
      tone: "done",
    };
  }
  if (input.status === "delivered") {
    return {
      title: "Delivered",
      body: "Your gear is with you. Reach out if anything needs follow-up on warranty or fit.",
      nextStep: "Enjoy your order",
      tone: "done",
    };
  }
  if (input.status === "shipped") {
    return {
      title: "On the way",
      body: "Your order has shipped. Track progress here — we’ll update again when it arrives.",
      nextStep: "Wait for delivery",
      tone: "wait",
    };
  }
  if (input.status === "revision_requested") {
    return {
      title: "Revision in review",
      body: "We received your revision note. OFFGRID will review it and update the invoice or specs when ready.",
      nextStep: "Wait for our update (usually 1–3 business days)",
      tone: "wait",
    };
  }
  if (input.status === "under_review" || !input.hasOfficialQuote) {
    return {
      title: "Under review",
      body: `${REVIEW_SLA_COPY} You’ll get a notification when the invoice is ready — then Pay now unlocks.`,
      nextStep: "Wait for invoice · optional: submit a revision if specs changed",
      tone: "wait",
    };
  }

  const phase = resolveCustomOrderPaymentPhase({
    paymentStatus: input.paymentStatus,
    officialTotal: input.hasOfficialQuote ? { amount: 1, currency: "PHP" } : null,
  });

  if (phase === "pay_deposit" || phase === "pay_balance") {
    return {
      title: phase === "pay_deposit" ? "Invoice ready — Pay now" : "Pay remaining balance",
      body:
        phase === "pay_deposit"
          ? "Your invoice is set. Pay now with PayMongo QR Ph (automatic) or GCash QR, then upload proof if you paid manually."
          : "Deposit is in. Pay the remaining balance with PayMongo or GCash, and upload proof for manual payments.",
      nextStep: phase === "pay_deposit" ? "Pay now" : "Pay remaining balance",
      tone: "action",
    };
  }

  if (input.status === "confirmed" || input.status === "in_production") {
    return {
      title: input.status === "confirmed" ? "Confirmed" : "In production",
      body: "Payment is recorded and production is underway. You can still submit a revision if something must change before shipping.",
      nextStep: "Watch for production updates · submit revision only if needed",
      tone: "wait",
    };
  }

  return {
    title: "Order update",
    body: "Check status details below. Contact OFFGRID if you need help.",
    nextStep: "Review order details",
    tone: "wait",
  };
}

export function adminCustomLifecycleGuide(input: {
  status: OrderStatus;
  paymentStatus: PaymentStatus | string;
  hasOfficialQuote: boolean;
  hasPaymentProof?: boolean;
  hasCustomerRevisionNote?: boolean;
}): LifecycleGuide {
  if (input.status === "cancelled") {
    return {
      title: "Cancelled",
      body: "Customer or ops cancelled this order. Override only if restoring is intentional.",
      nextStep: "No pipeline action",
      tone: "done",
    };
  }
  if (input.status === "revision_requested") {
    return {
      title: "Customer revision",
      body: input.hasCustomerRevisionNote
        ? "Read the customer revision note below, update specs or invoice, then move status back to Under review or save the invoice (Pay now unlocks)."
        : "Update specs or invoice for the requested change, then move status back to Under review or save the invoice.",
      nextStep: "Resolve revision → update invoice if needed → notify",
      tone: "action",
    };
  }
  if (!input.hasOfficialQuote || input.status === "under_review") {
    return {
      title: "Review → invoice",
      body: "Review design/specs (typically 1–3 business days). Save Invoice to unlock the customer Pay now button and send quote_ready notify.",
      nextStep: "Save invoice (official total + deposit)",
      tone: "action",
    };
  }
  if (input.paymentStatus === "unpaid") {
    return {
      title: "Awaiting customer payment",
      body: input.hasPaymentProof
        ? "Customer uploaded proof — confirm payment with admin override when verified."
        : "Invoice is live. Customer uses Pay now (PayMongo auto or GCash + proof).",
      nextStep: input.hasPaymentProof ? "Confirm payment received" : "Wait for PayMongo / proof",
      tone: input.hasPaymentProof ? "action" : "wait",
    };
  }
  if (input.status === "confirmed") {
    return {
      title: "Move to production",
      body: "Deposit/payment settled. Advance fulfillment when production starts.",
      nextStep: "Set status → In production",
      tone: "action",
    };
  }
  if (input.status === "in_production") {
    return {
      title: "Produce → ship",
      body: "Finish production, then mark Shipped when handed to courier.",
      nextStep: "Set status → Shipped",
      tone: "action",
    };
  }
  if (input.status === "shipped") {
    return {
      title: "Mark delivered",
      body: "Confirm delivery with the customer, then set Delivered.",
      nextStep: "Set status → Delivered",
      tone: "action",
    };
  }
  return {
    title: "Ops complete",
    body: "Order is at the end of the happy path. Use admin override only for corrections.",
    nextStep: "Monitor only",
    tone: "done",
  };
}
