import { useState, type ChangeEvent } from "react";
import type { CustomContentSection, CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { deleteTemplateBlob, putTemplateBlob } from "@/src/lib/templateBlobStorage";
import { triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";
import { localContentService } from "@/src/services";

function formatFromFileName(fileName: string): string {
  const part = fileName.includes(".") ? fileName.split(".").pop() : "";
  const ext = part?.toUpperCase() ?? "FILE";
  return ext.length <= 8 ? ext : "FILE";
}

function emptyTemplateDraft(): CustomTemplateAsset {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    description: "",
    fileName: "",
    fileUrl: "",
    format: "PDF",
    isPublished: true,
    updatedAt: now,
    storageKind: "static",
    previewImageUrl: "",
  };
}

export function AdminCustomContentPage() {
  const sections = useSiteContentStore((state) => state.customSections);
  const templates = useSiteContentStore((state) => state.customTemplates);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id ?? "");
  const [templateDraft, setTemplateDraft] = useState<CustomTemplateAsset>(() => emptyTemplateDraft());
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [templateBusy, setTemplateBusy] = useState(false);

  const selectedSection = sections.find((entry) => entry.id === selectedSectionId) ?? sections[0];

  const updateSelected = (patch: Partial<CustomContentSection>) => {
    if (!selectedSection) return;
    localContentService.updateCustomSection(selectedSection.id, patch);
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setPendingFile(null);
    setTemplateDraft(emptyTemplateDraft());
  };

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPendingFile(file ?? null);
    e.target.value = "";
  };

  const saveTemplate = async () => {
    const name = templateDraft.name.trim();
    if (!name) {
      window.alert("Add a template name.");
      return;
    }

    setTemplateBusy(true);
    try {
      const updatedAt = new Date().toISOString();

      if (editingTemplateId) {
        if (pendingFile) {
          await putTemplateBlob(editingTemplateId, pendingFile);
          localContentService.updateTemplate(editingTemplateId, {
            name,
            description: templateDraft.description.trim(),
            fileName: pendingFile.name,
            format: formatFromFileName(pendingFile.name),
            fileUrl: "",
            storageKind: "idb",
            isPublished: templateDraft.isPublished,
            previewImageUrl: templateDraft.previewImageUrl?.trim() || "",
          });
        } else {
          const existing = templates.find((t) => t.id === editingTemplateId);
          const kind = existing?.storageKind ?? "static";
          if (kind === "idb") {
            localContentService.updateTemplate(editingTemplateId, {
              name,
              description: templateDraft.description.trim(),
              isPublished: templateDraft.isPublished,
              previewImageUrl: templateDraft.previewImageUrl?.trim() || "",
            });
          } else {
            localContentService.updateTemplate(editingTemplateId, {
              name,
              description: templateDraft.description.trim(),
              fileName: templateDraft.fileName.trim() || templateDraft.name.replace(/\s+/g, "-"),
              fileUrl: templateDraft.fileUrl.trim(),
              format: templateDraft.format.trim() || "FILE",
              storageKind: "static",
              isPublished: templateDraft.isPublished,
              previewImageUrl: templateDraft.previewImageUrl?.trim() || "",
            });
          }
        }
        resetTemplateForm();
        return;
      }

      const id = templateDraft.id.trim() || `tpl-${crypto.randomUUID().slice(0, 8)}`;

      if (pendingFile) {
        await putTemplateBlob(id, pendingFile);
        localContentService.addTemplate({
          id,
          name,
          description: templateDraft.description.trim() || "Custom template",
          fileName: pendingFile.name,
          format: formatFromFileName(pendingFile.name),
          fileUrl: "",
          storageKind: "idb",
          isPublished: templateDraft.isPublished,
          previewImageUrl: templateDraft.previewImageUrl?.trim() || "",
          updatedAt,
        });
        resetTemplateForm();
        return;
      }

      const url = templateDraft.fileUrl.trim();
      if (!url || url === "#") {
        window.alert("Choose a file to upload, or enter a static file URL path.");
        return;
      }

      localContentService.addTemplate({
        id,
        name,
        description: templateDraft.description.trim() || "Template link",
        fileName: templateDraft.fileName.trim() || "download",
        fileUrl: url,
        format: templateDraft.format.trim() || formatFromFileName(templateDraft.fileName),
        storageKind: "static",
        isPublished: templateDraft.isPublished,
        previewImageUrl: templateDraft.previewImageUrl?.trim() || "",
        updatedAt,
      });
      resetTemplateForm();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not save template.");
    } finally {
      setTemplateBusy(false);
    }
  };

  const deleteTemplateRow = async (template: CustomTemplateAsset) => {
    if (!window.confirm(`Delete ${template.name}?`)) return;
    try {
      if ((template.storageKind ?? "static") === "idb") {
        await deleteTemplateBlob(template.id);
      }
      if (editingTemplateId === template.id) resetTemplateForm();
      localContentService.removeTemplate(template.id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const testDownload = async (template: CustomTemplateAsset) => {
    try {
      await triggerTemplateDownload(template);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Download failed.");
    }
  };

  const startEditTemplate = (template: CustomTemplateAsset) => {
    setEditingTemplateId(template.id);
    setPendingFile(null);
    setTemplateDraft({ ...template });
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        Admin Custom Content
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">
        Ordering guide + templates
      </h1>
      <p className="mt-2 text-sm text-offgrid-green/60">
        Guide sections render as accordion panels on <span className="font-medium text-offgrid-green/80">/custom</span>{" "}
        (deep links: <span className="font-medium text-offgrid-green/80">/custom#slug</span>). Templates:{" "}
        <span className="font-medium text-offgrid-green/80">/custom/templates</span>. Quote funnel:{" "}
        <span className="font-medium text-offgrid-green/80">/custom/order</span>. Use{" "}
        <span className="font-medium text-offgrid-green/80">/custom/order</span> for section CTAs that should start an
        order. Manage template assets below.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <h2 className="text-lg font-display font-bold text-offgrid-green">Custom Sections</h2>
          <div className="mt-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  selectedSection?.id === section.id
                    ? "border-offgrid-green bg-offgrid-green/5 text-offgrid-green"
                    : "border-offgrid-green/15 text-offgrid-green/65"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          {selectedSection && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
              <h3 className="text-xl font-display font-bold text-offgrid-green">Edit Page Content</h3>
              <div className="mt-4 space-y-3">
                <input
                  value={selectedSection.title}
                  onChange={(e) => updateSelected({ title: e.target.value })}
                  className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                />
                <input
                  value={selectedSection.subtitle}
                  onChange={(e) => updateSelected({ subtitle: e.target.value })}
                  className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                />
                <textarea
                  rows={2}
                  value={selectedSection.summary}
                  onChange={(e) => updateSelected({ summary: e.target.value })}
                  className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                />
                <textarea
                  rows={8}
                  value={selectedSection.body}
                  onChange={(e) => updateSelected({ body: e.target.value })}
                  className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                />
                <input
                  value={selectedSection.heroImage}
                  onChange={(e) => updateSelected({ heroImage: e.target.value })}
                  className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={selectedSection.ctaLabel}
                    onChange={(e) => updateSelected({ ctaLabel: e.target.value })}
                    className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                  />
                  <input
                    value={selectedSection.ctaHref}
                    onChange={(e) => updateSelected({ ctaHref: e.target.value })}
                    placeholder="/custom/order"
                    className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedSection.isPublished}
                    onChange={(e) => updateSelected({ isPublished: e.target.checked })}
                  />
                  Published
                </label>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
            <h3 className="text-xl font-display font-bold text-offgrid-green">Template Upload Manager</h3>
            <p className="mt-1 text-sm text-offgrid-green/60">
              Bundled OG files live under <span className="font-medium text-offgrid-green/80">public/templates/og-client/</span>.
              New uploads are stored in this browser&apos;s IndexedDB (not synced across devices).
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <input
                value={templateDraft.name}
                onChange={(e) => setTemplateDraft((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Template name"
                className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
              <input
                value={templateDraft.fileName}
                onChange={(e) => setTemplateDraft((prev) => ({ ...prev, fileName: e.target.value }))}
                placeholder="Display file name (optional if uploading)"
                className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
              <input
                value={templateDraft.fileUrl}
                onChange={(e) =>
                  setTemplateDraft((prev) => ({
                    ...prev,
                    fileUrl: e.target.value,
                    storageKind: e.target.value.trim() ? "static" : prev.storageKind,
                  }))
                }
                placeholder="Static URL e.g. /templates/og-client/...."
                className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
              <input
                value={templateDraft.format}
                onChange={(e) => setTemplateDraft((prev) => ({ ...prev, format: e.target.value }))}
                placeholder="Format (PDF/AI/JPG)"
                className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
              <input
                value={templateDraft.previewImageUrl ?? ""}
                onChange={(e) => setTemplateDraft((prev) => ({ ...prev, previewImageUrl: e.target.value }))}
                placeholder="Preview image URL (optional)"
                className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm md:col-span-2"
              />
            </div>
            <label className="mt-3 flex cursor-pointer flex-col gap-1 rounded-xl border border-dashed border-offgrid-green/25 px-3 py-3 text-sm text-offgrid-green/70 hover:bg-offgrid-green/[0.03]">
              <span className="font-semibold text-offgrid-green">Upload file (IndexedDB)</span>
              <span className="text-xs text-offgrid-green/55">
                {pendingFile ? pendingFile.name : "Choose .ai, .pdf, .svg, .jpg…"}
              </span>
              <input type="file" accept=".ai,.pdf,.svg,.jpg,.jpeg,.png,.eps,.zip" className="hidden" onChange={onPickFile} />
            </label>
            <textarea
              rows={2}
              value={templateDraft.description}
              onChange={(e) => setTemplateDraft((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="mt-2 w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={templateDraft.isPublished}
                onChange={(e) => setTemplateDraft((prev) => ({ ...prev, isPublished: e.target.checked }))}
              />
              Published
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={templateBusy}
                onClick={() => void saveTemplate()}
                className="rounded-xl bg-offgrid-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream disabled:opacity-50"
              >
                {editingTemplateId ? "Save changes" : "Add template"}
              </button>
              {(editingTemplateId || pendingFile || templateDraft.name) && (
                <button
                  type="button"
                  disabled={templateBusy}
                  onClick={resetTemplateForm}
                  className="rounded-xl border border-offgrid-green/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {templates.map((template) => (
                <div key={template.id} className="rounded-xl border border-offgrid-green/10 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-offgrid-green">{template.name}</p>
                      <p className="text-xs text-offgrid-green/55">
                        {template.fileName} · {template.format} · {(template.storageKind ?? "static") === "idb" ? "IDB" : "URL"}
                      </p>
                      {template.previewImageUrl && (
                        <p className="text-[11px] text-offgrid-green/50 mt-1 truncate">
                          Preview: {template.previewImageUrl}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditTemplate(template)}
                        className="rounded-lg border border-offgrid-green/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void testDownload(template)}
                        className="rounded-lg border border-offgrid-green/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                      >
                        Test DL
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          localContentService.updateTemplate(template.id, {
                            isPublished: !template.isPublished,
                          })
                        }
                        className="rounded-lg border border-offgrid-green/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                      >
                        {template.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteTemplateRow(template)}
                        className="rounded-lg border border-red-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-offgrid-green/60">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
