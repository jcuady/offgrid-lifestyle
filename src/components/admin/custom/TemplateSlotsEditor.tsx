import { useState, type ChangeEvent } from "react";
import { CmsField, CmsImageInput, CmsSectionPanel, CmsTextInput } from "@/src/components/admin/landing/CmsField";
import { resolveCanonicalTemplates } from "@/src/lib/canonicalTemplates";
import { deleteTemplateBlob, putTemplateBlob } from "@/src/lib/templateBlobStorage";
import { triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";
import { fileAcceptAttribute, fileRuleHint, validateUploadedFile } from "@/src/lib/fileValidation";

const CATEGORY_LABELS = {
  jerseys: "Jerseys",
  headwear: "Headwear",
  towels: "Towels",
  shorts: "Shorts",
} as const;

function formatFromFileName(fileName: string): string {
  const part = fileName.includes(".") ? fileName.split(".").pop() : "";
  const ext = part?.toUpperCase() ?? "FILE";
  return ext.length <= 8 ? ext : "FILE";
}

export function TemplateSlotsEditor() {
  const raw = useSiteContentStore((s) => s.customTemplates);
  const templates = resolveCanonicalTemplates(raw);
  const updateCanonicalTemplate = useSiteContentStore((s) => s.updateCanonicalTemplate);
  const applyFileOverride = useSiteContentStore((s) => s.applyCanonicalTemplateFileOverride);
  const resetCanonicalTemplateSlot = useSiteContentStore((s) => s.resetCanonicalTemplateSlot);

  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORY_LABELS>("jerseys");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const filteredTemplates = templates.filter((t) => t.category === selectedCategory);
  const selected =
    filteredTemplates.find((t) => t.id === selectedId) ??
    filteredTemplates[0] ??
    templates.find((t) => t.id === selectedId) ??
    templates[0];
  const isIdb = (selected?.storageKind ?? "static") === "idb";

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) {
      setPendingFile(null);
      return;
    }
    const check = validateUploadedFile(file, "templateAsset");
    if (check.ok === false) {
      setFileError(check.error);
      setPendingFile(null);
      return;
    }
    setFileError(null);
    setPendingFile(file);
  };

  const saveFileOverride = async () => {
    if (!selected || !pendingFile) return;
    setBusy(true);
    try {
      await putTemplateBlob(selected.id, pendingFile);
      applyFileOverride(selected.id, {
        fileName: pendingFile.name,
        format: formatFromFileName(pendingFile.name),
      });
      setPendingFile(null);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const clearFileOverride = async () => {
    if (!selected || !isIdb) return;
    if (!window.confirm(`Restore bundled file for ${selected.name}?`)) return;
    setBusy(true);
    try {
      await deleteTemplateBlob(selected.id);
      resetCanonicalTemplateSlot(selected.id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not reset file.");
    } finally {
      setBusy(false);
    }
  };

  const testDownload = async () => {
    if (!selected) return;
    try {
      await triggerTemplateDownload(selected);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Download failed.");
    }
  };

  if (!selected) return null;

  return (
    <>
      <CmsSectionPanel
        title="Template library"
        description="Fixed template slots grouped by category (jerseys, headwear, towels, shorts). Edit labels and preview images; optionally replace the downloadable file for this browser (IndexedDB)."
      >
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setSelectedCategory(category);
                const first = templates.find((t) => t.category === category);
                if (first) setSelectedId(first.id);
                setPendingFile(null);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                selectedCategory === category
                  ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                  : "border-offgrid-green/20 text-offgrid-green/70 hover:border-offgrid-green/40",
              )}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setSelectedId(template.id);
                setPendingFile(null);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                selected.id === template.id
                  ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                  : "border-offgrid-green/20 text-offgrid-green/70 hover:border-offgrid-green/40",
              )}
            >
              {template.name}
            </button>
          ))}
        </div>
      </CmsSectionPanel>

      <CmsSectionPanel
        title={selected.name}
        description={`${CATEGORY_LABELS[selected.category]} · Slot ID: ${selected.id} · ${
          isIdb ? "Custom file (this browser)" : `Bundled: ${selected.fileUrl}`
        }`}
      >
        <CmsField label="Display name" className="sm:col-span-2">
          <CmsTextInput
            value={selected.name}
            onChange={(v) => updateCanonicalTemplate(selected.id, { name: v })}
          />
        </CmsField>
        <CmsField label="Description" className="sm:col-span-2">
          <CmsTextInput
            value={selected.description}
            onChange={(v) => updateCanonicalTemplate(selected.id, { description: v })}
            multiline
            rows={3}
          />
        </CmsField>
        <CmsField label="Card preview image" className="sm:col-span-2">
          <CmsImageInput
            value={selected.previewImageUrl ?? ""}
            onChange={(v) => updateCanonicalTemplate(selected.id, { previewImageUrl: v })}
            alt={selected.name}
          />
        </CmsField>
        <CmsField label="Published on /custom/templates">
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-offgrid-green">
            <input
              type="checkbox"
              checked={selected.isPublished}
              onChange={(e) => updateCanonicalTemplate(selected.id, { isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-offgrid-green/30"
            />
            Visible to customers
          </label>
        </CmsField>
        <CmsField
          label="Replace downloadable file (optional)"
          className="sm:col-span-2"
          hint="MVP: replacement is stored in this browser only. Production needs cloud storage + API."
        >
          <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-offgrid-green/25 px-4 py-4 text-sm text-offgrid-green/70 hover:bg-offgrid-green/[0.03]">
            <span className="font-semibold text-offgrid-green">Choose .ai, .pdf, .jpg…</span>
            <span className="text-xs">{pendingFile ? pendingFile.name : "No new file selected"}</span>
            <input
              type="file"
              accept={fileAcceptAttribute("templateAsset")}
              className="hidden"
              onChange={onPickFile}
            />
          </label>
          {fileError ? (
            <p className="mt-2 text-xs font-medium text-red-600" role="alert">
              {fileError}
            </p>
          ) : null}
          <p className="mt-1 text-[10px] text-offgrid-green/50">{fileRuleHint("templateAsset")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!pendingFile || busy}
              onClick={() => void saveFileOverride()}
              className="rounded-xl bg-offgrid-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream disabled:opacity-40"
            >
              Save file override
            </button>
            {isIdb ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void clearFileOverride()}
                className="rounded-xl border border-offgrid-green/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green"
              >
                Restore bundled file
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void testDownload()}
              className="rounded-xl border border-offgrid-green/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green"
            >
              Test download
            </button>
          </div>
        </CmsField>
      </CmsSectionPanel>
    </>
  );
}
