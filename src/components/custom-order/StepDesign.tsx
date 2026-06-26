import { useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Upload, Download, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";
import { resolveCanonicalTemplates } from "@/src/lib/canonicalTemplates";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { PRIMARY_DESIGN_TEMPLATE_ID, triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";
import { HEADWEAR_TYPE_OPTIONS } from "@/src/data/customHeadwearOptions";

export function StepDesign() {
  const copy = useSiteContentStore((s) => s.customPageContent.wizard.step1);
  const { draft, updateDraft, nextStep } = useCustomOrderStore();
  const customTemplatesRaw = useSiteContentStore((state) => state.customTemplates);
  const templates = useMemo(
    () => resolveCanonicalTemplates(customTemplatesRaw).filter((entry) => entry.isPublished),
    [customTemplatesRaw],
  );
  const primaryTemplate = useMemo(
    () => templates.find((t) => t.id === PRIMARY_DESIGN_TEMPLATE_ID) ?? templates[0],
    [templates],
  );
  const [primaryDlBusy, setPrimaryDlBusy] = useState(false);

  const handlePrimaryDownload = async () => {
    if (!primaryTemplate) return;
    try {
      setPrimaryDlBusy(true);
      await triggerTemplateDownload(primaryTemplate);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setPrimaryDlBusy(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateDraft({ designFileName: file.name });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-offgrid-green mb-2">{copy.title}</h2>
        <p className="text-sm text-offgrid-green/60">{copy.description}</p>
      </div>

      <div>
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
          Team order type
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => updateDraft({ category: "apparel", headwearType: null })}
            className={`rounded-xl border p-4 text-left transition-all ${
              draft.category === "apparel"
                ? "border-offgrid-green bg-offgrid-green/5"
                : "border-offgrid-green/12 bg-offgrid-cream/50 hover:border-offgrid-green/35"
            }`}
          >
            <p className="font-display text-base font-bold text-offgrid-green">Jerseys & shorts</p>
            <p className="mt-1 text-xs text-offgrid-green/60">Best for full roster uniforms and sets.</p>
          </button>
          <button
            type="button"
            onClick={() => updateDraft({ category: "headwear_towels", headwearType: "cap-trucker" })}
            className={`rounded-xl border p-4 text-left transition-all ${
              draft.category === "headwear_towels" &&
              draft.headwearType !== "towel-face" &&
              draft.headwearType !== "towel-hand"
                ? "border-offgrid-green bg-offgrid-green/5"
                : "border-offgrid-green/12 bg-offgrid-cream/50 hover:border-offgrid-green/35"
            }`}
          >
            <p className="font-display text-base font-bold text-offgrid-green">Headwear</p>
            <p className="mt-1 text-xs text-offgrid-green/60">Caps, visors, and headwear logo runs.</p>
          </button>
          <button
            type="button"
            onClick={() => updateDraft({ category: "headwear_towels", headwearType: "towel-hand" })}
            className={`rounded-xl border p-4 text-left transition-all ${
              draft.category === "headwear_towels" &&
              (draft.headwearType === "towel-face" || draft.headwearType === "towel-hand")
                ? "border-offgrid-green bg-offgrid-green/5"
                : "border-offgrid-green/12 bg-offgrid-cream/50 hover:border-offgrid-green/35"
            }`}
          >
            <p className="font-display text-base font-bold text-offgrid-green">Towels</p>
            <p className="mt-1 text-xs text-offgrid-green/60">Face and hand towel custom orders.</p>
          </button>
        </div>
        {draft.category === "headwear_towels" ? (
          <div className="mt-3">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/55">
              Select headwear/towel type
            </p>
            <div className="flex flex-wrap gap-2">
              {HEADWEAR_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateDraft({ headwearType: opt.id })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    draft.headwearType === opt.id
                      ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                      : "border-offgrid-green/20 text-offgrid-green/70 hover:border-offgrid-green/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="bg-offgrid-green/5 rounded-xl p-4 sm:p-6 space-y-3">
        <div>
          <button
            type="button"
            disabled={!primaryTemplate || primaryDlBusy}
            onClick={() => void handlePrimaryDownload()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-offgrid-green hover:text-offgrid-lime transition-colors disabled:pointer-events-none disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            {primaryTemplate ? `Download ${primaryTemplate.name}` : "Download design template"}
          </button>
          <p className="text-[10px] text-offgrid-green/50 mt-1">
            {primaryTemplate?.description ?? "Use our template for best results. Includes bleed lines and safe zones."}
          </p>
        </div>
        <p className="text-xs text-offgrid-green/55 border-t border-offgrid-green/10 pt-3">
          {copy.templatesHint}{" "}
          <Link to="/custom/templates" className="font-semibold text-offgrid-green underline underline-offset-2 hover:text-offgrid-lime">
            Browse all templates
          </Link>
        </p>
      </div>

      <div>
        <label className="mb-3 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
          {copy.uploadLabel}
        </label>
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-offgrid-green/20 rounded-xl p-8 sm:p-12 cursor-pointer hover:border-offgrid-green/40 hover:bg-offgrid-green/[0.02] transition-all">
          <Upload className="w-8 h-8 text-offgrid-green/40" />
          {draft.designFileName ? (
            <p className="text-sm font-semibold text-offgrid-green">{draft.designFileName}</p>
          ) : (
            <p className="text-sm text-offgrid-green/50">{copy.uploadPlaceholder}</p>
          )}
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.ai,.svg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
          {copy.designNotesLabel}
        </label>
        <textarea
          rows={3}
          value={draft.designNotes}
          onChange={(e) => updateDraft({ designNotes: e.target.value })}
          className="w-full resize-none rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
          placeholder={copy.designNotesPlaceholder}
        />
      </div>

      <Button variant="default" size="lg" className="w-full group" onClick={nextStep}>
        {copy.nextButton}
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
