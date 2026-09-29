import type { OrderStatus } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import { customOrderProgressSteps } from "@/src/lib/customOrderProgress";
import { Check } from "lucide-react";

interface CustomOrderTimelineProps {
  status: OrderStatus;
  hasOfficialQuote: boolean;
  paymentStatus: string;
  towelOrder?: boolean;
  compact?: boolean;
}

export function CustomOrderTimeline({
  status,
  hasOfficialQuote,
  paymentStatus,
  towelOrder,
  compact,
}: CustomOrderTimelineProps) {
  if (status === "cancelled") {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">This order was cancelled.</p>
    );
  }

  const steps = customOrderProgressSteps({ status, hasOfficialQuote, paymentStatus, towelOrder });

  return (
    <ol
      className={cn("flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between", compact ? "gap-2" : "gap-4")}
      aria-label="Order progress"
    >
      {steps.map((step, i) => (
        <li
          key={step.key}
          className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center"
          aria-current={step.current ? "step" : undefined}
        >
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
              step.done && "border-offgrid-green bg-offgrid-green text-offgrid-cream",
              step.current && "border-offgrid-lime bg-offgrid-lime/15 text-offgrid-green",
              !step.done && !step.current && "border-offgrid-green/15 text-offgrid-green/35",
            )}
          >
            {step.done ? <Check className="h-4 w-4" aria-hidden="true" strokeWidth={3} /> : i + 1}
          </span>
          <div className="min-w-0 sm:mt-2">
            <p
              className={cn(
                "font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                step.current ? "text-offgrid-green" : step.done ? "text-offgrid-green/70" : "text-offgrid-green/40",
              )}
            >
              {step.label}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
