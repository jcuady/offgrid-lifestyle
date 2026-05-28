import React, { useState } from "react";
import { ArrowLeft, Send, Check, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { localOrderService } from "@/src/services";
import { cn } from "@/src/lib/utils";

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-offgrid-green/8 last:border-0">
      <span className="text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green/50 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-offgrid-green text-right">{value}</span>
    </div>
  );
}

export function StepSummary() {
  const copy = useSiteContentStore((s) => s.customPageContent.wizard.step3);
  const { draft, updateDraft, prevStep, resetDraft } = useCustomOrderStore();
  const [submitted, setSubmitted] = useState(false);
  const teamOrderType =
    draft.category === "apparel"
      ? "Jerseys & shorts"
      : draft.headwearType === "towel-face" || draft.headwearType === "towel-hand"
        ? "Towels"
        : "Headwear";

  const canSubmit =
    draft.contactName.trim() !== "" &&
    draft.contactEmail.trim() !== "" &&
    draft.contactPhone.trim() !== "" &&
    Boolean(draft.orderSheetFileName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const submittedDraft = {
      ...draft,
      estimatedTotal: null,
      depositRequired: null,
      status: "pending_deposit",
      createdAt: draft.createdAt ?? new Date().toISOString(),
    } as const;
    updateDraft(submittedDraft);
    localOrderService.submitCustomOrder(submittedDraft);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-8 sm:py-12 space-y-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-offgrid-lime flex items-center justify-center">
          <Check className="w-10 h-10 sm:w-12 sm:h-12 text-offgrid-dark" strokeWidth={3} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-offgrid-green">{copy.successTitle}</h2>
        <p className="text-sm text-offgrid-green/60 max-w-md mx-auto">{copy.successBody}</p>
        <div className="bg-offgrid-green/5 rounded-xl p-4 sm:p-6 text-left max-w-sm mx-auto space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-offgrid-lime flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-offgrid-green text-sm">{copy.depositTitle}</p>
              <p className="text-xs text-offgrid-green/60 mt-0.5">
                {copy.depositBody}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-offgrid-green/55 max-w-md mx-auto leading-relaxed">{copy.accountHint}</p>
        <Button variant="outline" size="lg" className="mt-4" onClick={() => { resetDraft(); setSubmitted(false); }}>
          <RotateCcw className="mr-2 w-4 h-4" />
          {copy.newOrderButton}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-offgrid-green mb-2">{copy.title}</h2>
        <p className="text-sm text-offgrid-green/60">{copy.description}</p>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-offgrid-green/10">
        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3">
          {copy.orderDetailsHeading}
        </h3>
        <SummaryRow label="Team order type" value={teamOrderType} />
        <SummaryRow label="Design" value={draft.designFileName ?? "No file uploaded"} />
        <SummaryRow label="Order sheet" value={draft.orderSheetFileName ?? "No file uploaded"} />
        <SummaryRow
          label="Quantity"
          value={
            <input
              type="number"
              min={1}
              value={draft.quantity}
              onChange={(e) => updateDraft({ quantity: Math.max(1, Number(e.target.value)) })}
              className="w-20 text-right px-2 py-1 rounded-lg border border-offgrid-green/20 focus:border-offgrid-green outline-none text-sm text-offgrid-green bg-white"
            />
          }
        />
      </div>

      {/* Pricing estimate */}
      <div className="bg-offgrid-green rounded-xl p-4 sm:p-6 text-offgrid-cream">
        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50 mb-4">
          {copy.pricingHeading}
        </h3>
        <p className="text-sm leading-relaxed text-offgrid-cream/80">
          We verify your design and team sheet first, then send an official quote, deposit schedule, and production
          start confirmation.
        </p>
        <p className="text-[10px] text-offgrid-cream/40 mt-3">{copy.pricingFootnote}</p>
      </div>

      {/* Contact info */}
      <div>
        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-4">
          {copy.contactHeading}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={draft.contactName}
              onChange={(e) => updateDraft({ contactName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white"
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={draft.contactEmail}
              onChange={(e) => updateDraft({ contactEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white"
              placeholder="juan@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={draft.contactPhone}
              onChange={(e) => updateDraft({ contactPhone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white"
              placeholder="+63 917 123 4567"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
              Team / Organization (Optional)
            </label>
            <input
              type="text"
              value={draft.teamOrOrg}
              onChange={(e) => updateDraft({ teamOrOrg: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white"
              placeholder="Boracay Dragons, Company XYZ…"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" size="lg" className="sm:flex-1" type="button" onClick={prevStep}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          {copy.backButton}
        </Button>
        <Button
          variant="default"
          size="lg"
          className={cn("sm:flex-1 group", !canSubmit && "opacity-50 cursor-not-allowed")}
          type="submit"
          disabled={!canSubmit}
        >
          {copy.submitButton}
          <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  );
}
