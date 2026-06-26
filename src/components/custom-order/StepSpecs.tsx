import type { ChangeEvent } from "react";
import { ArrowRight, ArrowLeft, Download, Upload, ClipboardList } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { downloadTeamOrderKitSheet } from "@/src/lib/teamOrderKitSheet";

export function StepSpecs() {
  const copy = useSiteContentStore((s) => s.customPageContent.wizard.step2);
  const { draft, updateDraft, nextStep, prevStep } = useCustomOrderStore();
  const selectedType =
    draft.category === "apparel"
      ? "jersey_shorts"
      : draft.headwearType === "towel-face"
        ? "face_towel"
        : draft.headwearType === "towel-hand"
          ? "hand_towel"
          : draft.headwearType
            ? draft.headwearType.replace("cap-", "cap_")
            : "headwear";

  const specsComplete = Boolean(draft.orderSheetFileName);

  const onOrderSheetSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateDraft({ orderSheetFileName: file.name });
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-offgrid-green mb-2">{copy.title}</h2>
        <p className="text-sm text-offgrid-green/60">{copy.description}</p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">{copy.cutHeading}</h3>
          <div className="rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/40 p-5">
            <p className="text-sm text-offgrid-green/70">
              Download the OffGrid roster sheet so names, numbers, sizes, quantities, and product types are complete before submission.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              type="button"
              onClick={() => void downloadTeamOrderKitSheet(selectedType)}
            >
              <Download className="h-4 w-4" />
              Download order kit (.xlsx)
            </Button>
            <p className="mt-2 text-[10px] text-offgrid-green/55">
              Current selection:{" "}
              <span className="font-semibold text-offgrid-green">
                {draft.category === "apparel"
                  ? "Jerseys & shorts"
                  : draft.headwearType
                    ? draft.headwearType.replace(/-/g, " ")
                    : "Headwear"}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">{copy.fabricHeading}</h3>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-offgrid-green/20 p-8 transition-all hover:border-offgrid-green/40 hover:bg-offgrid-green/[0.02] sm:p-12">
            <Upload className="h-8 w-8 text-offgrid-green/40" />
            {draft.orderSheetFileName ? (
              <p className="text-sm font-semibold text-offgrid-green">{draft.orderSheetFileName}</p>
            ) : (
              <p className="text-sm text-offgrid-green/50">Upload completed team order sheet</p>
            )}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={onOrderSheetSelect} className="hidden" />
          </label>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">{copy.printHeading}</h3>
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
