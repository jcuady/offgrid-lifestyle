import type { OrderStatus } from "@/src/types/commerce";

export interface CustomOrderProgressStep {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
}

const FLOW_STEPS: { key: string; label: string }[] = [
  { key: "details", label: "Details checked" },
  { key: "design", label: "Design reviewed" },
  { key: "order-kit", label: "Roster confirmed" },
  { key: "submitted", label: "Invoice confirmed" },
  { key: "production", label: "First unit + production" },
  { key: "shipping", label: "Shipping + warranty" },
];

type Stage = "review" | "production" | "shipping" | "complete";

function stageFor(status: OrderStatus): Stage {
  if (status === "confirmed" || status === "in_production") return "production";
  if (status === "shipped") return "shipping";
  if (status === "delivered") return "complete";
  return "review";
}

function reviewLabel(
  status: OrderStatus,
  hasOfficialQuote: boolean,
  paymentStatus: string,
  done: boolean,
): string {
  if (done) {
    return hasOfficialQuote || paymentStatus === "deposit_paid" || paymentStatus === "fully_paid"
      ? "Invoice confirmed"
      : "Review complete";
  }
  if (status === "revision_requested") return "Revision requested";
  if (status === "pending_deposit" && hasOfficialQuote) return "Invoice ready — Pay now";
  if (status === "pending_deposit") return "Awaiting invoice";
  return "Under review";
}

/** One current step, and later stages never complete ahead of an earlier one. */
export function customOrderProgressSteps(input: {
  status: OrderStatus;
  hasOfficialQuote: boolean;
  paymentStatus: string;
  towelOrder?: boolean;
}): CustomOrderProgressStep[] {
  const stage = stageFor(input.status);
  const submittedDone = stage !== "review";
  const productionDone = stage === "shipping" || stage === "complete";
  const shippingDone = stage === "complete";

  return FLOW_STEPS.map((step) => {
    let done = true;
    let current = false;
    if (step.key === "submitted") {
      done = submittedDone;
      current = stage === "review";
    } else if (step.key === "production") {
      done = productionDone;
      current = stage === "production";
    } else if (step.key === "shipping") {
      done = shippingDone;
      current = stage === "shipping";
    }

    let label = step.label;
    if (step.key === "submitted") {
      label = reviewLabel(input.status, input.hasOfficialQuote, input.paymentStatus, done);
    }
    if (step.key === "order-kit" && input.towelOrder) label = "Quantity noted";

    return { key: step.key, label, done, current };
  });
}
