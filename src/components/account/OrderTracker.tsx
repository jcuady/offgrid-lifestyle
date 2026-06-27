import { Check, X } from "lucide-react";
import type { OrderStatus, OrderType } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";

const RETAIL_STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"] as const;
const CUSTOM_STEPS = ["Submitted", "In production", "Shipped", "Delivered"] as const;

/** Map an order status onto the 4-stage delivery tracker (cancelled handled separately). */
function activeStepIndex(status: OrderStatus): number {
  switch (status) {
    case "draft":
    case "pending_deposit":
      return 0;
    case "confirmed":
    case "in_production":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return 0;
  }
}

interface OrderTrackerProps {
  status: OrderStatus;
  type: OrderType;
  className?: string;
}

/** Compact, brand-consistent delivery/order status stepper used across the account area. */
export function OrderTracker({ status, type, className }: OrderTrackerProps) {
  const steps = type === "custom" ? CUSTOM_STEPS : RETAIL_STEPS;

  if (status === "cancelled") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5",
          className,
        )}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700">
          Order cancelled
        </p>
      </div>
    );
  }

  const current = activeStepIndex(status);

  return (
    <ol className={cn("flex items-start", className)} aria-label="Order progress">
      {steps.map((label, index) => {
        const done = index < current;
        const isCurrent = index === current;
        const reached = done || isCurrent;
        return (
          <li
            key={label}
            className={cn("flex items-center", index < steps.length - 1 ? "flex-1" : "flex-none")}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold tabular-nums transition-colors",
                  done
                    ? "border-offgrid-lime bg-offgrid-lime text-white"
                    : isCurrent
                      ? "border-offgrid-lime bg-offgrid-lime/15 text-offgrid-green ring-4 ring-offgrid-lime/15"
                      : "border-offgrid-green/15 bg-white text-offgrid-green/30",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  "max-w-[4.5rem] text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.08em] sm:max-w-none sm:text-[10px] sm:tracking-[0.12em]",
                  reached ? "text-offgrid-green" : "text-offgrid-green/35",
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "mx-1 mt-3.5 h-0.5 flex-1 rounded-full sm:mx-2",
                  done ? "bg-offgrid-lime" : "bg-offgrid-green/12",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
