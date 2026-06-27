import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, Download, Upload, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { OptionCard } from "@/src/components/custom-order/OptionCard";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { CUT_OPTIONS, MATERIAL_OPTIONS, PRINT_OPTIONS } from "@/src/data/customOptions";
import {
  headwearOptionLabel,
  orderSheetProductTypeForHeadwear,
  resolveHeadwearOptions,
} from "@/src/data/customHeadwearOptions";
import { downloadTeamOrderKitSheet } from "@/src/lib/teamOrderKitSheet";
import { PENDING_SHEET_KEY, saveCustomOrderFile } from "@/src/lib/customOrderFiles";
import { fileAcceptAttribute, fileRuleHint, validateUploadedFile } from "@/src/lib/fileValidation";
import { cn } from "@/src/lib/utils";

export function StepSpecs() {
  const copy = useSiteContentStore((s) => s.customPageContent.wizard.step2);
  const headwearRaw = useSiteContentStore((s) => s.customHeadwearOptions);
  const headwearOptions = useMemo(() => resolveHeadwearOptions(headwearRaw), [headwearRaw]);
  const { draft, setCut, setMaterial, setPrintMethod, updateDraft, nextStep, prevStep } = useCustomOrderStore();
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isApparel = draft.category === "apparel";

  const selectedType =
    draft.category === "apparel"
      ? "jersey_shorts"
      : orderSheetProductTypeForHeadwear(draft.headwearType, headwearOptions);

  const productSpecsComplete = isApparel
    ? Boolean(draft.cut && draft.material && draft.printMethod)
    : Boolean(draft.printMethod);

  const specsComplete = productSpecsComplete && Boolean(draft.orderSheetFileName);

  const onOrderSheetSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const check = validateUploadedFile(file, "customOrderSheet");
    if (check.ok === false) {
      setUploadError(check.error);
      return;
    }

    try {
      setUploadError(null);
      setUploadBusy(true);
      await saveCustomOrderFile(PENDING_SHEET_KEY, file);
      updateDraft({ orderSheetFileName: file.name, orderSheetFileKey: PENDING_SHEET_KEY });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadBusy(false);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      <div>
        <h2 className="mb-2 text-xl font-display font-bold text-offgrid-green sm:text-2xl">{copy.title}</h2>
        <p className="text-sm text-offgrid-green/60">{copy.description}</p>
      </div>

      {/* Product specifications — DH Ultimate parity: cut, fabric, print */}
      <div className="space-y-8">
        {isApparel ? (
          <>
            <div>
              <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
                {copy.cutHeading}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CUT_OPTIONS.map((opt) => (
                  <div key={opt.id}>
                    <OptionCard
                      label={opt.label}
                      description={opt.description}
                      selected={draft.cut === opt.id}
                      onClick={() => setCut(opt.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
                {copy.fabricHeading}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MATERIAL_OPTIONS.map((opt) => (
                  <div key={opt.id}>
                    <OptionCard
                      label={opt.label}
                      description={opt.description}
                      selected={draft.material === opt.id}
                      onClick={() => setMaterial(opt.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
            {copy.printHeading}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRINT_OPTIONS.map((opt) => (
              <div key={opt.id}>
                <OptionCard
                  label={opt.label}
                  description={opt.description}
                  selected={draft.printMethod === opt.id}
                  onClick={() => setPrintMethod(opt.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team order kit — roster sheet */}
      <div className="space-y-8 border-t border-offgrid-green/10 pt-8">
        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
            {copy.orderKitDownloadHeading}
          </h3>
          <div className="rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/40 p-5">
            <p className="text-sm text-offgrid-green/70">{copy.orderKitDownloadDescription}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              type="button"
              onClick={() => void downloadTeamOrderKitSheet(selectedType)}
            >
              <Download className="h-4 w-4" />
              {copy.orderKitDownloadButton}
            </Button>
            <p className="mt-2 text-[10px] text-offgrid-green/55">
              Current selection:{" "}
              <span className="font-semibold text-offgrid-green">
                {draft.category === "apparel"
                  ? "Jerseys & shorts"
                  : headwearOptionLabel(draft.headwearType, headwearOptions)}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
            {copy.orderKitUploadHeading}
          </h3>
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all sm:p-12",
              uploadError
                ? "border-red-400/60 bg-red-50/40"
                : "border-offgrid-green/20 hover:border-offgrid-green/40 hover:bg-offgrid-green/[0.02]",
              uploadBusy && "pointer-events-none opacity-60",
            )}
          >
            {uploadBusy ? (
              <Loader2 className="h-8 w-8 animate-spin text-offgrid-green/50" />
            ) : (
              <Upload className="h-8 w-8 text-offgrid-green/40" />
            )}
            {draft.orderSheetFileName ? (
              <p className="text-sm font-semibold text-offgrid-green">{draft.orderSheetFileName}</p>
            ) : (
              <p className="text-sm text-offgrid-green/50">{copy.orderKitUploadPlaceholder}</p>
            )}
            <input
              type="file"
              accept={fileAcceptAttribute("customOrderSheet")}
              onChange={(e) => void onOrderSheetSelect(e)}
              className="hidden"
            />
          </label>
          {uploadError ? (
            <p className="mt-2 text-xs font-medium text-red-600" role="alert">
              {uploadError}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-offgrid-green/50">Accepted: {fileRuleHint("customOrderSheet")}</p>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
            {copy.orderKitChecklistHeading}
          </h3>
          <div className="rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/40 p-5">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-4 w-4 text-offgrid-green/60" />
              <ul className="space-y-1.5 text-sm text-offgrid-green/70">
                <li>- Include player names and jersey numbers (if needed)</li>
                <li>- Confirm sizes and quantities per product type</li>
                <li>- Add notes for captain sets, alternates, and special placements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {!specsComplete ? (
        <p className="text-center text-xs text-offgrid-green/55">
          {!productSpecsComplete
            ? "Select all product options above to continue."
            : "Upload your completed team order sheet to continue."}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" size="lg" className="sm:flex-1" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {copy.backButton}
        </Button>
        <Button variant="default" size="lg" className="group sm:flex-1" disabled={!specsComplete} onClick={nextStep}>
          {copy.nextButton}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
