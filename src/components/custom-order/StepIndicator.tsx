import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { buildWizardStepIndicator } from "@/src/components/custom-order/customOrderFlowMeta";
import { useCustomOrderStore, TOTAL_STEPS } from "@/src/store/useCustomOrderStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export function StepIndicator() {
  const { currentStep, setStep } = useCustomOrderStore();
  const stepLabels = useSiteContentStore((s) => s.customPageContent.wizard.stepLabels);
  const steps = buildWizardStepIndicator(stepLabels);

  return (
    <div className="flex items-start justify-center">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;
        const reachable = stepNum <= currentStep;
        const Icon = step.icon;

        return (
          <div key={step.label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* left connector */}
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  i === 0 ? "opacity-0" : isComplete || isActive ? "bg-offgrid-green" : "bg-offgrid-green/15",
                )}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => reachable && setStep(stepNum)}
                disabled={!reachable}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${stepNum}: ${step.label}`}
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isActive && "border-offgrid-lime bg-offgrid-lime text-white shadow-md",
                  isComplete && "border-offgrid-green bg-offgrid-green text-offgrid-cream",
                  !isActive && !isComplete && "border-offgrid-green/15 bg-white text-offgrid-green/35",
                  reachable ? "cursor-pointer" : "cursor-not-allowed",
                )}
              >
                {isComplete ? <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} /> : <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
              {/* right connector */}
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  i === TOTAL_STEPS - 1 ? "opacity-0" : isComplete ? "bg-offgrid-green" : "bg-offgrid-green/15",
                )}
                aria-hidden
              />
            </div>
            <span
              className={cn(
                "mt-2 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-[10px]",
                isActive ? "text-offgrid-green" : "text-offgrid-green/45",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
