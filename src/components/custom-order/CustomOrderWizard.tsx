import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { StepIndicator } from "@/src/components/custom-order/StepIndicator";
import { StepDesign } from "@/src/components/custom-order/StepDesign";
import { StepSpecs } from "@/src/components/custom-order/StepSpecs";
import { StepSummary } from "@/src/components/custom-order/StepSummary";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export function CustomOrderWizard() {
  const currentStep = useCustomOrderStore((s) => s.currentStep);
  const draft = useCustomOrderStore((s) => s.draft);
  const updateDraft = useCustomOrderStore((s) => s.updateDraft);
  const intro = useSiteContentStore((s) => s.customPageContent.wizard);
  const currentUser = usePortalStore((s) => s.currentUser);

  useEffect(() => {
    if (currentUser?.role !== "customer") return;
    if (draft.contactEmail.trim()) return;
    updateDraft({
      contactName: currentUser.name,
      contactEmail: currentUser.email,
    });
  }, [currentUser, draft.contactEmail, updateDraft]);

  useEffect(() => {
    document.getElementById("order-flow")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  return (
    <section id="order-flow" className="scroll-mt-28 border-t border-offgrid-green/8 bg-offgrid-cream py-12 sm:py-20">
      <div className={cn(siteContainer, "max-w-3xl")}>
        <div className="mb-8 text-center sm:text-left">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
            {intro.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-black leading-tight text-offgrid-green sm:text-4xl">
            {intro.title}
          </h2>
          <p className="mt-2 max-w-lg text-sm text-offgrid-green/60">{intro.description}</p>
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
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10 sm:p-8"
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
