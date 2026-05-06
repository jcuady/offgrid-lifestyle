import { AnimatePresence, motion } from "motion/react";
import { StepIndicator } from "@/src/components/custom-order/StepIndicator";
import { StepDesign } from "@/src/components/custom-order/StepDesign";
import { StepSpecs } from "@/src/components/custom-order/StepSpecs";
import { StepSummary } from "@/src/components/custom-order/StepSummary";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";

export function CustomOrderWizard() {
  const currentStep = useCustomOrderStore((s) => s.currentStep);

  return (
    <section id="order-flow" className="bg-offgrid-cream py-12 sm:py-20 scroll-mt-28">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <div className="mb-8 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
            Custom quote
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-display font-black text-offgrid-green leading-tight">
            Build your order
          </h2>
          <p className="mt-2 text-sm text-offgrid-green/60 max-w-lg">
            Three quick steps — upload your design, lock in garment specs, then review and submit for pricing.
          </p>
        </div>

        <div className="mb-8 sm:mb-12">
          <StepIndicator />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-offgrid-cream rounded-2xl"
          >
            {currentStep === 1 && <StepDesign />}
            {currentStep === 2 && <StepSpecs />}
            {currentStep === 3 && <StepSummary />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
