import type { OrderStatus } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";

const FLOW_STEPS: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "details", label: "Details checked", statuses: ["draft", "pending_deposit"] },
  { key: "design", label: "Design reviewed", statuses: ["pending_deposit"] },
  { key: "order-kit", label: "Roster confirmed", statuses: ["pending_deposit"] },
  { key: "submitted", label: "Quote confirmed", statuses: ["confirmed"] },
  { key: "production", label: "First unit + production", statuses: ["in_production"] },
  { key: "shipping", label: "Shipping + warranty", statuses: ["shipped", "delivered"] },
];

function stepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  if (status === "delivered") return 5;
  if (status === "shipped") return 5;
  if (status === "in_production") return 4;
  if (status === "confirmed") return 3;
  return 2; // pending_deposit = details/design/roster submitted, awaiting quote confirmation
}

interface CustomOrderTimelineProps {
  status: OrderStatus;
  hasOfficialQuote: boolean;
  paymentStatus: string;
  compact?: boolean;
}

export function CustomOrderTimeline({ status, hasOfficialQuote, paymentStatus, compact }: CustomOrderTimelineProps) {
  if (status === "cancelled") {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">This order was cancelled.</p>
    );
  }

  const active = stepIndex(status);
  const quoteDone = hasOfficialQuote || paymentStatus === "deposit_paid" || paymentStatus === "fully_paid" || status === "confirmed";
  const depositDone = paymentStatus === "deposit_paid" || paymentStatus === "fully_paid" || status === "confirmed" || active >= 3;

  return (
    <ol className={cn("flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between", compact ? "gap-2" : "gap-4")}>
      {FLOW_STEPS.map((step, i) => {
        let done = i < active;
        if (step.key === "submitted") done = quoteDone;
        if (step.key === "production") done = active > i;
        if (step.key === "shipping") done = status === "delivered";
        if (step.key === "details" || step.key === "design" || step.key === "order-kit") done = true;

        const isCurrent =
          (step.key === "submitted" && !quoteDone) ||
          (step.key === "submitted" && quoteDone && !depositDone) ||
          (step.key === "production" && depositDone && active === 3) ||
          (step.key === "production" && active === 4) ||
          (step.key === "shipping" && active >= 5);

        return (
          <li key={step.key} className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                done && "border-offgrid-green bg-offgrid-green text-offgrid-cream",
                isCurrent && !done && "border-offgrid-lime bg-offgrid-lime/15 text-offgrid-green",
                !done && !isCurrent && "border-offgrid-green/15 text-offgrid-green/35",
              )}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <div className="min-w-0 sm:mt-2">
              <p
                className={cn(
                  "font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                  isCurrent ? "text-offgrid-green" : done ? "text-offgrid-green/70" : "text-offgrid-green/40",
                )}
              >
                {step.label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
