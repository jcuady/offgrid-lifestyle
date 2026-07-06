import { useState, type ChangeEvent } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { CmsField, CmsImageInput, CmsSectionPanel, CmsTextInput } from "@/src/components/admin/landing/CmsField";
import { isCanonicalTemplateId, resolveCanonicalTemplates } from "@/src/lib/canonicalTemplates";
import { uploadTemplateFile } from "@/src/lib/cmsImageUpload";
import { triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";
import { localContentService } from "@/src/services";
import type { CustomTemplateAsset, TemplateCategory } from "@/src/store/useSiteContentStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { fileAcceptAttribute, fileRuleHint, validateUploadedFile } from "@/src/lib/fileValidation";

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  jerseys: "Jerseys",
  headwear: "Headwear",
  towels: "Towels",
  shorts: "Shorts",
};

function formatFromFileName(fileName: string): string {
  const part = fileName.includes(".") ? fileName.split(".").pop() : "";
  const ext = part?.toUpperCase() ?? "FILE";
  return ext.length <= 8 ? ext : "FILE";
}

function TemplatePreviewCard({ template }: { template: CustomTemplateAsset }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/10">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-offgrid-green/[0.06] bg-offgrid-cream/50">
        {template.previewImageUrl ? (
          <img
            src={template.previewImageUrl}
            alt={`${template.name} preview`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-offgrid-green/35">
            <ImageIcon className="h-6 w-6" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em]">{template.format}</span>
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-offgrid-green/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-offgrid-cream backdrop-blur">
          {template.format}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-offgrid-green">{template.name}</h3>
        <p className="mt-1 text-sm text-offgrid-green/65">{template.description}</p>
        <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/40">
          {template.fileName}
        </p>
      </div>
    </article>
  );
}

export function TemplateSlotsEditor() {
  const raw = useSiteContentStore((s) => s.customTemplates);
  const templates = resolveCanonicalTemplates(raw);
  const resetCanonicalTemplates = useSiteContentStore((s) => s.resetCanonicalTemplates);

  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("jerseys");
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredTemplates = templates.filter((t) => t.category === selectedCategory);
  const selected =
    filteredTemplates.find((t) => t.id === selectedId) ??
    filteredTemplates[0] ??
    templates.find((t) => t.id === selectedId) ??
    templates[0];

  const patchSelected = async (patch: Partial<CustomTemplateAsset>) => {
    if (!selected) return;
    setFormError(null);
    setBusy(true);
    const err = await localContentService.updateTemplate(selected.id, patch);
    setBusy(false);
    if (err) setFormError(err);
  };

  const handleAdd = async () => {
    setFormError(null);
    setBusy(true);
    const id = `tpl-custom-${crypto.randomUUID().slice(0, 8)}`;
    const asset: CustomTemplateAsset = {
      id,
      category: selectedCategory,
      name: "New template",
      description: "Describe this template for customers.",
      fileName: "template.ai",
      fileUrl: "#",
      format: "AI",
      isPublished: false,
      updatedAt: new Date().toISOString(),
      storageKind: "static",
    };
    const err = await localContentService.addTemplate(asset);
    setBusy(false);
    if (err) {
      setFormError(err);
      return;
    }
    setSelectedId(id);
  };

  const handleDelete = async () => {
    if (!selected) return;
    const canonical = isCanonicalTemplateId(selected.id);
    const message = canonical
      ? `Unpublish "${selected.name}" from the template library? The bundled slot stays in admin.`
      : `Delete "${selected.name}" permanently?`;
    if (!window.confirm(message)) return;

    setFormError(null);
    setBusy(true);
    const err = await localContentService.removeTemplate(selected.id);
    setBusy(false);
    if (err) {
      setFormError(err);
      return;
    }
    const remaining = resolveCanonicalTemplates(useSiteContentStore.getState().customTemplates).filter(
      (t) => t.category === selectedCategory,
    );
    setSelectedId(remaining[0]?.id ?? "");
  };

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file || !selected) return;

    const check = validateUploadedFile(file, "templateAsset");
    if (check.ok === false) {
      setFileError(check.error);
      return;
    }

    setFileError(null);
    setBusy(true);
    const uploaded = await uploadTemplateFile(file, selected.id);
    if (uploaded.ok === false) {
      setBusy(false);
      setFileError(uploaded.error);
      return;
    }

    const err = await localContentService.updateTemplate(selected.id, {
      fileName: file.name,
      fileUrl: uploaded.publicUrl,
      format: formatFromFileName(file.name),
      storageKind: "storage",
    });
    setBusy(false);
    if (err) setFileError(err);
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
        description="Create, edit, preview, and publish downloadable artwork templates. Changes save to Supabase and appear on /custom/templates."
      >
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setSelectedCategory(category);
                const first = templates.find((t) => t.category === category);
                if (first) setSelectedId(first.id);
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

        <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedId(template.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                selected.id === template.id
                  ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                  : "border-offgrid-green/20 text-offgrid-green/70 hover:border-offgrid-green/40",
                !template.isPublished && "opacity-60",
              )}
            >
              {template.name}
              {!template.isPublished ? " (draft)" : null}
            </button>
          ))}
        </div>

        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" disabled={busy} onClick={() => void handleAdd()}>
            <Plus className="h-3.5 w-3.5" />
            Add template
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 text-red-700"
            disabled={busy}
            onClick={() => void handleDelete()}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isCanonicalTemplateId(selected.id) ? "Unpublish" : "Delete"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              if (!window.confirm("Reset all template slots to factory defaults in this browser?")) return;
              resetCanonicalTemplates();
              const first = resolveCanonicalTemplates(useSiteContentStore.getState().customTemplates)[0];
              setSelectedId(first?.id ?? "");
            }}
          >
            Reset defaults
          </Button>
        </div>

        {formError ? (
          <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {formError}
          </p>
        ) : null}
      </CmsSectionPanel>

      <CmsSectionPanel title="Storefront preview" description="How this card appears on /custom/templates">
        <div className="sm:col-span-2 max-w-md">
          <TemplatePreviewCard template={selected} />
        </div>
      </CmsSectionPanel>

      <CmsSectionPanel
        title={selected.name}
        description={`${CATEGORY_LABELS[selected.category]} · ${selected.id} · ${
          selected.storageKind === "storage"
            ? "Cloud file"
            : selected.storageKind === "idb"
              ? "Browser-only override"
              : `Bundled: ${selected.fileUrl}`
        }`}
      >
        <CmsField label="Category">
          <select
            value={selected.category}
            onChange={(e) => void patchSelected({ category: e.target.value as TemplateCategory })}
            className="w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green"
          >
            {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </CmsField>

        <CmsField label="Display name" className="sm:col-span-2">
          <CmsTextInput value={selected.name} onChange={(v) => void patchSelected({ name: v })} />
        </CmsField>

        <CmsField label="Description" className="sm:col-span-2">
          <CmsTextInput
            value={selected.description}
            onChange={(v) => void patchSelected({ description: v })}
            multiline
            rows={3}
          />
        </CmsField>

        <CmsField label="Card preview image" className="sm:col-span-2">
          <CmsImageInput
            value={selected.previewImageUrl ?? ""}
            onChange={(v) => void patchSelected({ previewImageUrl: v })}
            alt={selected.name}
            uploadSection={`templates-${selected.id}`}
          />
        </CmsField>

        <CmsField label="Published on /custom/templates">
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-offgrid-green">
            <input
              type="checkbox"
              checked={selected.isPublished}
              onChange={(e) => void patchSelected({ isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-offgrid-green/30"
            />
            Visible to customers
          </label>
        </CmsField>

        <CmsField label="Downloadable file" className="sm:col-span-2" hint="Uploads to site-cms storage and links the public URL.">
          <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-offgrid-green/25 px-4 py-4 text-sm text-offgrid-green/70 hover:bg-offgrid-green/[0.03]">
            <span className="font-semibold text-offgrid-green">Choose .ai, .pdf, .jpg…</span>
            <span className="text-xs">{selected.fileName}</span>
            <input type="file" accept={fileAcceptAttribute("templateAsset")} className="hidden" onChange={onPickFile} />
          </label>
          {fileError ? (
            <p className="mt-2 text-xs font-medium text-red-600" role="alert">
              {fileError}
            </p>
          ) : null}
          <p className="mt-1 text-[10px] text-offgrid-green/50">{fileRuleHint("templateAsset")}</p>
          <div className="mt-3">
            <button
              type="button"
              disabled={busy}
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
