import type { OrderStatus } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";

const FLOW_STEPS: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "submitted", label: "Submitted", statuses: ["pending_deposit", "draft"] },
  { key: "quote", label: "Quote review", statuses: ["pending_deposit"] },
  { key: "confirmed", label: "Deposit paid", statuses: ["confirmed"] },
  { key: "production", label: "In production", statuses: ["in_production"] },
  { key: "shipped", label: "Shipped", statuses: ["shipped", "delivered"] },
];

function stepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  if (status === "delivered") return 4;
  if (status === "shipped") return 4;
  if (status === "in_production") return 3;
  if (status === "confirmed") return 2;
  return 1; // pending_deposit = submitted + awaiting quote/deposit
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
  const quoteDone = hasOfficialQuote || paymentStatus === "deposit_paid" || paymentStatus === "fully_paid";
  const depositDone = paymentStatus === "deposit_paid" || paymentStatus === "fully_paid" || status === "confirmed" || active >= 3;

  return (
    <ol className={cn("flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between", compact ? "gap-2" : "gap-4")}>
      {FLOW_STEPS.map((step, i) => {
        let done = i < active;
        if (step.key === "quote") done = quoteDone || i < active;
        if (step.key === "confirmed") done = depositDone;
        if (step.key === "submitted") done = true;

        const isCurrent =
          (step.key === "submitted" && active <= 1 && !quoteDone) ||
          (step.key === "quote" && !quoteDone && active <= 1) ||
          (step.key === "confirmed" && quoteDone && !depositDone) ||
          (step.key === "production" && depositDone && active === 3) ||
          (step.key === "shipped" && active >= 4);

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
