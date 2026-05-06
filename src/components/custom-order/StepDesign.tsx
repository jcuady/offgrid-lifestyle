import { useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Upload, Download, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { PRIMARY_DESIGN_TEMPLATE_ID, triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";

export function StepDesign() {
  const { draft, updateDraft, nextStep } = useCustomOrderStore();
  const customTemplatesRaw = useSiteContentStore((state) => state.customTemplates);
  const templates = useMemo(
    () => customTemplatesRaw.filter((entry) => entry.isPublished),
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
        <h2 className="text-xl sm:text-2xl font-display font-bold text-offgrid-green mb-2">
          Submit Your Design
        </h2>
        <p className="text-sm text-offgrid-green/60">
          Upload your artwork or use our template to get started. We accept PNG, JPG, PDF, and AI files.
        </p>
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
          Need another silhouette?{" "}
          <Link to="/custom/templates" className="font-semibold text-offgrid-green underline underline-offset-2 hover:text-offgrid-lime">
            Browse all templates
          </Link>
          .
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-3">
          Upload Design File
        </label>
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-offgrid-green/20 rounded-xl p-8 sm:p-12 cursor-pointer hover:border-offgrid-green/40 hover:bg-offgrid-green/[0.02] transition-all">
          <Upload className="w-8 h-8 text-offgrid-green/40" />
          {draft.designFileName ? (
            <p className="text-sm font-semibold text-offgrid-green">{draft.designFileName}</p>
          ) : (
            <p className="text-sm text-offgrid-green/50">Click to browse or drag your file here</p>
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
        <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
          Design Notes (Optional)
        </label>
        <textarea
          rows={3}
          value={draft.designNotes}
          onChange={(e) => updateDraft({ designNotes: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white resize-none"
          placeholder="Describe your vision — colors, placement, special instructions…"
        />
      </div>

      <Button variant="default" size="lg" className="w-full group" onClick={nextStep}>
        Next: Garment &amp; print specs
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
