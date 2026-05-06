import { cn } from "@/src/lib/utils";
import { Upload, Layers3, ClipboardCheck } from "lucide-react";
import { useCustomOrderStore, TOTAL_STEPS } from "@/src/store/useCustomOrderStore";

const STEPS = [
  { label: "Design", icon: Upload },
  { label: "Specs", icon: Layers3 },
  { label: "Summary", icon: ClipboardCheck },
] as const;

export function StepIndicator() {
  const { currentStep, setStep } = useCustomOrderStore();

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;
        const Icon = step.icon;

        return (
          <div key={step.label} className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <button
              onClick={() => stepNum <= currentStep && setStep(stepNum)}
              disabled={stepNum > currentStep}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer",
                isActive && "bg-offgrid-lime text-offgrid-dark",
                isComplete && "bg-offgrid-green text-offgrid-cream",
                !isActive && !isComplete && "bg-offgrid-green/10 text-offgrid-green/40",
                stepNum > currentStep && "cursor-not-allowed",
              )}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden md:inline">{step.label}</span>
            </button>
            {i < TOTAL_STEPS - 1 && (
              <div className={cn(
                "w-4 sm:w-8 h-px",
                stepNum < currentStep ? "bg-offgrid-green" : "bg-offgrid-green/15",
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
