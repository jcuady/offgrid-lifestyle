import { useState } from "react";
import type { CustomContentSection, CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export function AdminCustomContentPage() {
  const sections = useSiteContentStore((state) => state.customSections);
  const templates = useSiteContentStore((state) => state.customTemplates);
  const updateSection = useSiteContentStore((state) => state.updateCustomSection);
  const addTemplate = useSiteContentStore((state) => state.addTemplate);
  const updateTemplate = useSiteContentStore((state) => state.updateTemplate);
  const removeTemplate = useSiteContentStore((state) => state.removeTemplate);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id ?? "");
  const [templateDraft, setTemplateDraft] = useState<CustomTemplateAsset>({
    id: "",
    name: "",
    description: "",
    fileName: "",
    fileUrl: "#",
    format: "PDF",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  });

  const selectedSection = sections.find((entry) => entry.id === selectedSectionId) ?? sections[0];

  const updateSelected = (patch: Partial<CustomContentSection>) => {
    if (!selectedSection) return;
    updateSection(selectedSection.id, patch);
  };

  const submitTemplate = () => {
    const payload = {
      ...templateDraft,
      id: templateDraft.id || `tpl-${crypto.randomUUID().slice(0, 8)}`,
      updatedAt: new Date().toISOString(),
    };
    addTemplate(payload);
    setTemplateDraft({
      id: "",
      name: "",
      description: "",
      fileName: "",
      fileUrl: "#",
      format: "PDF",
      isPublished: true,
      updatedAt: new Date().toISOString(),
    });
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
              MVP stores uploaded file metadata and URL references in local state.
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
                placeholder="File name"
                className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
              <input
                value={templateDraft.fileUrl}
                onChange={(e) => setTemplateDraft((prev) => ({ ...prev, fileUrl: e.target.value }))}
                placeholder="File URL"
                className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
              <input
                value={templateDraft.format}
                onChange={(e) => setTemplateDraft((prev) => ({ ...prev, format: e.target.value }))}
                placeholder="Format (PDF/AI/SVG)"
                className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
            </div>
            <textarea
              rows={2}
              value={templateDraft.description}
              onChange={(e) => setTemplateDraft((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="mt-2 w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <button
              onClick={submitTemplate}
              className="mt-3 rounded-xl bg-offgrid-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream"
            >
              Add Template
            </button>

            <div className="mt-4 space-y-2">
              {templates.map((template) => (
                <div key={template.id} className="rounded-xl border border-offgrid-green/10 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-offgrid-green">{template.name}</p>
                      <p className="text-xs text-offgrid-green/55">{template.fileName} · {template.format}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTemplate(template.id, { isPublished: !template.isPublished })}
                        className="rounded-lg border border-offgrid-green/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                      >
                        {template.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => removeTemplate(template.id)}
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
