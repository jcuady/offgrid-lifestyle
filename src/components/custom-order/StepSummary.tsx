import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Check, AlertCircle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useStore } from "@/src/store/store";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { localOrderService } from "@/src/services";
import { persistCheckoutShipping } from "@/src/services/customerShippingService";
import { CUT_OPTIONS, MATERIAL_OPTIONS, PRINT_OPTIONS, estimateUnitPrice } from "@/src/data/customOptions";
import { estimateHeadwearUnitPrice, isTowelHeadwearType, resolveHeadwearOptions, headwearOptionLabel } from "@/src/data/customHeadwearOptions";
import { formatMoney, php } from "@/src/types/commerce";
import {
  validateCustomOrderDraft,
  validateDeliveryAddressFields,
  mergeCustomOrderShipping,
  normalizeShippingInfo,
  isValidEmail,
  isValidPhone,
  type DeliveryAddressFieldErrors,
} from "@/src/lib/formValidation";
import { formatCityProvinceZipLine } from "@/src/lib/portal";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";
import { cn } from "@/src/lib/utils";

const PhilippinesAddressFields = lazy(() =>
  import("@/src/components/checkout/PhilippinesAddressFields").then((m) => ({
    default: m.PhilippinesAddressFields,
  })),
);

const contactInputClass = (hasError: boolean) =>
  cn(
    "min-h-11 w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-base text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25 sm:text-sm",
    hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
  );

function scrollToFirstFieldError(container: HTMLElement | null) {
  if (!container) return;
  requestAnimationFrame(() => {
    const target =
      container.querySelector<HTMLElement>("[data-field-error]") ??
      container.querySelector<HTMLElement>("[aria-invalid='true']");
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-offgrid-green/8 last:border-0">
      <span className="flex-shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/50">{label}</span>
      <span className="text-sm font-medium text-offgrid-green text-right">{value}</span>
    </div>
  );
}

export function StepSummary() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const copy = useSiteContentStore((s) => s.customPageContent.wizard.step3);
  const { draft, updateDraft, prevStep, resetDraft } = useCustomOrderStore();
  const currentUser = usePortalStore((s) => s.currentUser);
  const savedShipping = useStore((s) => s.shippingInfo);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [fileUploadWarnings, setFileUploadWarnings] = useState<string[]>([]);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [deliveryFieldErrors, setDeliveryFieldErrors] = useState<DeliveryAddressFieldErrors>({});
  const headwearRaw = useSiteContentStore((s) => s.customHeadwearOptions);
  const headwearOptions = useMemo(() => resolveHeadwearOptions(headwearRaw), [headwearRaw]);
  const teamOrderType =
    draft.category === "apparel"
      ? "Jerseys & shorts"
      : isTowelHeadwearType(draft.headwearType, headwearOptions)
        ? "Towels"
        : "Headwear";

  const unitPrice = useMemo(() => {
    if (draft.category === "apparel") {
      return estimateUnitPrice(draft.cut, draft.material, draft.printMethod);
    }
    return estimateHeadwearUnitPrice(draft.headwearType, draft.printMethod, headwearOptions);
  }, [draft.category, draft.cut, draft.material, draft.printMethod, draft.headwearType, headwearOptions]);

  const estimatedTotal = useMemo(() => php(unitPrice * draft.quantity), [unitPrice, draft.quantity]);
  const estimatedDeposit = useMemo(
    () => php(Math.round(estimatedTotal.amount * 0.6)),
    [estimatedTotal.amount],
  );

  const labelFor = (options: { id: string; label: string }[], id: string | null) =>
    options.find((o) => o.id === id)?.label ?? "—";

  const minQuantity = draft.category === "apparel" ? 10 : 1;

  const deliveryComplete = useMemo(() => {
    const errors = validateDeliveryAddressFields(mergeCustomOrderShipping(draft));
    return Object.keys(errors).length === 0;
  }, [draft]);

  useEffect(() => {
    if (currentUser?.role !== "customer") return;
    updateDraft({
      contactName: draft.contactName || currentUser.name,
      contactEmail: currentUser.email,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prefill once per session
  }, [currentUser?.id]);

  useEffect(() => {
    if (draft.shippingInfo.regionCode) return;
    if (!savedShipping.regionCode) return;
    updateDraft({ shippingInfo: normalizeShippingInfo(savedShipping) });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prefill saved address once
  }, []);

  const clearDeliveryError = (field: keyof DeliveryAddressFieldErrors) => {
    setDeliveryFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const canSubmit =
    draft.contactName.trim() !== "" &&
    isValidEmail(draft.contactEmail) &&
    isValidPhone(draft.contactPhone) &&
    Boolean(draft.orderSheetFileName) &&
    draft.quantity >= minQuantity &&
    deliveryComplete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const deliveryErrors = validateDeliveryAddressFields(mergeCustomOrderShipping(draft));
    setDeliveryFieldErrors(deliveryErrors);

    const errors = validateCustomOrderDraft(draft);
    if (errors.length > 0) {
      setSubmitErrors(errors);
      scrollToFirstFieldError(formRef.current);
      return;
    }

    setSubmitErrors([]);
    setDeliveryFieldErrors({});
    setSubmitting(true);
    try {
      const submittedDraft = {
        ...draft,
        shippingInfo: mergeCustomOrderShipping(draft),
        estimatedTotal,
        depositRequired: estimatedDeposit,
        status: "pending_deposit" as const,
        createdAt: draft.createdAt ?? new Date().toISOString(),
      };
      const result = await localOrderService.submitCustomOrder(submittedDraft);
      setSubmittedEmail(submittedDraft.contactEmail);
      setFileUploadWarnings(result.fileUploadWarnings);
      void persistCheckoutShipping(submittedDraft.shippingInfo);
      resetDraft();

      if (currentUser?.role === "customer") {
        if (result.fileUploadWarnings.length > 0) {
          try {
            sessionStorage.setItem(
              `og-file-warn:${result.orderId}`,
              JSON.stringify(result.fileUploadWarnings),
            );
          } catch {
            // ignore quota
          }
        }
        navigate(`/account/orders/${result.orderId}`);
        return;
      }

      setSubmittedOrderId(result.orderId);
    } catch (err) {
      setSubmitErrors([err instanceof Error ? err.message : "Submission failed. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedOrderId) {
    return (
      <div className="text-center py-8 sm:py-12 space-y-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-offgrid-lime flex items-center justify-center">
          <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={3} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-offgrid-green">{copy.successTitle}</h2>
        <p className="font-mono text-sm font-bold text-offgrid-green">{submittedOrderId}</p>
        <p className="text-sm text-offgrid-green/60 max-w-md mx-auto">{copy.successBody}</p>
        {fileUploadWarnings.length > 0 ? (
          <div className="mx-auto max-w-md rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
            <p className="font-semibold">Order received — file upload issue</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {fileUploadWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-amber-900/80">
              Your order is saved. Contact support or re-submit files if staff cannot download them.
            </p>
          </div>
        ) : null}
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
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="default" size="lg" asChild>
            <Link to={`${CUSTOMER_SIGN_IN_PATH}?email=${encodeURIComponent(submittedEmail)}`}>Sign in to track</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/custom">Back to ordering guide</Link>
          </Button>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="mt-2"
          onClick={() => {
            setSubmittedOrderId(null);
            setFileUploadWarnings([]);
          }}
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          {copy.newOrderButton}
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-offgrid-green mb-2">{copy.title}</h2>
        <p className="text-sm text-offgrid-green/60">{copy.description}</p>
      </div>

      {/* Order summary */}
      <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-4 sm:p-6">
        <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
          {copy.orderDetailsHeading}
        </h3>
        <SummaryRow label="Team order type" value={teamOrderType} />
        {draft.category === "headwear_towels" ? (
          <SummaryRow label="Product type" value={headwearOptionLabel(draft.headwearType, headwearOptions)} />
        ) : null}
        {draft.category === "apparel" ? (
          <>
            <SummaryRow label="Cut" value={labelFor(CUT_OPTIONS, draft.cut)} />
            <SummaryRow label="Fabric" value={labelFor(MATERIAL_OPTIONS, draft.material)} />
          </>
        ) : null}
        <SummaryRow label="Print" value={labelFor(PRINT_OPTIONS, draft.printMethod)} />
        <SummaryRow label="Design" value={draft.designFileName ?? "Brief only — design support requested"} />
        <SummaryRow label="Order sheet" value={draft.orderSheetFileName ?? "No file uploaded"} />
        {draft.shippingInfo.barangay && draft.shippingInfo.city ? (
          <SummaryRow
            label="Delivery"
            value={formatCityProvinceZipLine(mergeCustomOrderShipping(draft))}
          />
        ) : (
          <SummaryRow label="Delivery" value="Add address below" />
        )}
        <SummaryRow
          label="Quantity"
          value={
            <input
              type="number"
              min={minQuantity}
              value={draft.quantity}
              onChange={(e) => updateDraft({ quantity: Math.max(minQuantity, Number(e.target.value)) })}
              className="min-h-11 w-20 rounded-lg border border-offgrid-green/20 bg-white px-2 py-2 text-right text-base text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25 sm:text-sm"
            />
          }
        />
        {draft.category === "apparel" ? (
          <p className="mt-2 text-[10px] text-offgrid-green/50">Minimum 10 pieces per design (mix cuts within the run).</p>
        ) : null}
      </div>

      {/* Pricing estimate */}
      <div className="bg-offgrid-green rounded-xl p-4 sm:p-6 text-offgrid-cream">
        <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-cream/50">
          {copy.pricingHeading}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-offgrid-cream/70">Est. unit price</span>
            <span className="font-semibold">{formatMoney(php(unitPrice))}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-offgrid-cream/70">Est. order total ({draft.quantity} pcs)</span>
            <span className="font-semibold">{formatMoney(estimatedTotal)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-offgrid-cream/15 pt-2">
            <span className="text-offgrid-cream/70">Est. 60% deposit</span>
            <span className="font-display text-lg font-black text-offgrid-lime">{formatMoney(estimatedDeposit)}</span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-offgrid-cream/80">
          Official quote and deposit are confirmed after design and roster review — same standard as industry custom
          apparel flows.
        </p>
        <p className="text-[10px] text-offgrid-cream/40 mt-3">{copy.pricingFootnote}</p>
      </div>

      {/* Contact info */}
      <div>
        <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
          {copy.contactHeading}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={draft.contactName}
              onChange={(e) => {
                updateDraft({ contactName: e.target.value });
                setSubmitErrors([]);
              }}
              className={contactInputClass(submitErrors.some((m) => m.includes("Full name")))}
              placeholder="Juan Dela Cruz"
              aria-invalid={submitErrors.some((m) => m.includes("Full name"))}
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
              Email *
            </label>
            <input
              type="email"
              required
              readOnly={currentUser?.role === "customer"}
              value={draft.contactEmail}
              onChange={(e) => {
                updateDraft({ contactEmail: e.target.value });
                setSubmitErrors([]);
              }}
              className={cn(
                contactInputClass(submitErrors.some((m) => m.includes("email"))),
                currentUser?.role === "customer" && "cursor-not-allowed bg-offgrid-cream/60",
              )}
              placeholder="juan@email.com"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={draft.contactPhone}
              onChange={(e) => {
                updateDraft({ contactPhone: e.target.value });
                setSubmitErrors([]);
              }}
              className={contactInputClass(submitErrors.some((m) => m.includes("phone")))}
              placeholder="+63 917 123 4567"
              aria-invalid={submitErrors.some((m) => m.includes("phone"))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
              Team / Organization (Optional)
            </label>
            <input
              type="text"
              value={draft.teamOrOrg}
              onChange={(e) => updateDraft({ teamOrOrg: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-base text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25 sm:text-sm"
              placeholder="Boracay Dragons, Company XYZ…"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
          Delivery address *
        </h3>
        <p className="mb-4 text-sm text-offgrid-green/60">
          Where should we ship your finished order? Select manually or use quick-fill search and map.
        </p>
        <Suspense
          fallback={
            <p className="rounded-xl border border-offgrid-green/15 bg-white px-4 py-6 text-sm text-offgrid-green/60">
              Loading Philippines address options…
            </p>
          }
        >
          <PhilippinesAddressFields
            value={draft.shippingInfo}
            onChange={(shippingInfo) => updateDraft({ shippingInfo })}
            errors={deliveryFieldErrors}
            onClearError={clearDeliveryError}
          />
        </Suspense>
      </div>

      {submitErrors.length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4" role="alert">
          <p className="text-sm font-semibold text-red-800">Please fix the following before submitting:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-700">
            {submitErrors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" size="lg" className="sm:flex-1" type="button" onClick={prevStep}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          {copy.backButton}
        </Button>
        <Button
          variant="default"
          size="lg"
          className={cn("sm:flex-1 group", (!canSubmit || submitting) && "opacity-50 cursor-not-allowed")}
          type="submit"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              {copy.submitButton}
              <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
