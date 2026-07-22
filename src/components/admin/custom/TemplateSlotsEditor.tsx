import { Fragment, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CmsImageInput } from "@/src/components/admin/landing/CmsField";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";
import { Button } from "@/src/components/ui/Button";
import { isCanonicalTemplateId, resolveCanonicalTemplates } from "@/src/lib/canonicalTemplates";
import { uploadTemplateFile } from "@/src/lib/cmsImageUpload";
import { fileAcceptAttribute, fileRuleHint, validateUploadedFile } from "@/src/lib/fileValidation";
import { triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";
import { cn } from "@/src/lib/utils";
import { localContentService } from "@/src/services";
import type { CustomTemplateAsset, TemplateCategory, TemplateStorageKind } from "@/src/store/useSiteContentStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  jerseys: "Jerseys",
  headwear: "Headwear",
  towels: "Towels",
  shorts: "Shorts",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TemplateCategory[];

const inputClass =
  "w-full min-w-0 rounded-xl border border-offgrid-green/20 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25 sm:px-4 sm:py-3";

type PublishFilter = "all" | "published" | "draft";

type DraftForm = {
  id: string;
  category: TemplateCategory;
  name: string;
  description: string;
  previewImageUrl: string;
  isPublished: boolean;
  fileName: string;
  fileUrl: string;
  format: string;
  storageKind: TemplateStorageKind;
};

function formatFromFileName(fileName: string): string {
  const part = fileName.includes(".") ? fileName.split(".").pop() : "";
  const ext = part?.toUpperCase() ?? "FILE";
  return ext.length <= 8 ? ext : "FILE";
}

function emptyDraft(category: TemplateCategory): DraftForm {
  return {
    id: `tpl-custom-${crypto.randomUUID().slice(0, 8)}`,
    category,
    name: "",
    description: "",
    previewImageUrl: "",
    isPublished: false,
    fileName: "template.ai",
    fileUrl: "#",
    format: "AI",
    storageKind: "static",
  };
}

function resolvePreviewSrc(template: Pick<CustomTemplateAsset, "previewImageUrl" | "fileUrl" | "fileName">): string {
  const preview = template.previewImageUrl?.trim() ?? "";
  if (preview) return preview;
  const url = template.fileUrl?.trim() ?? "";
  if (url && url !== "#" && /\.(jpe?g|png|webp|gif)$/i.test(template.fileName || url)) return url;
  return "";
}

function storageLabel(template: Pick<CustomTemplateAsset, "storageKind" | "fileUrl">): string {
  if (template.storageKind === "storage") return "Cloud";
  if (template.storageKind === "idb") return "Browser";
  if (!template.fileUrl || template.fileUrl === "#") return "Missing file";
  return "Bundled OG";
}

function matchesQuery(template: CustomTemplateAsset, query: string): boolean {
  if (!query) return true;
  const hay = `${template.name} ${template.description} ${template.fileName} ${template.id} ${template.format}`.toLowerCase();
  return hay.includes(query);
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 cursor-pointer rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 sm:min-h-0 sm:py-1.5",
        active
          ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
          : "border-offgrid-green/15 bg-white text-offgrid-green/70 hover:border-offgrid-lime/60 hover:text-offgrid-green",
      )}
    >
      {children}
    </button>
  );
}

function PublishBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]",
        published
          ? "border-offgrid-lime/40 bg-offgrid-lime/15 text-offgrid-green"
          : "border-amber-200 bg-amber-50 text-amber-800",
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function StatusToggle({
  published,
  disabled,
  onChange,
}: {
  published: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="inline-flex w-full max-w-sm rounded-xl border border-offgrid-green/15 bg-offgrid-cream/40 p-1" role="group" aria-label="Status">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={cn(
          "min-h-11 flex-1 cursor-pointer rounded-lg px-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
          !published ? "bg-white text-offgrid-green shadow-sm" : "text-offgrid-green/55",
        )}
      >
        Draft
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={cn(
          "min-h-11 flex-1 cursor-pointer rounded-lg px-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
          published ? "bg-offgrid-green text-offgrid-cream shadow-sm" : "text-offgrid-green/55",
        )}
      >
        Published
      </button>
    </div>
  );
}

function TemplatePreview({
  src,
  format,
  name,
  fileName,
  size = "card",
  className,
}: {
  src: string;
  format: string;
  name: string;
  fileName?: string;
  size?: "thumb" | "card";
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center bg-[linear-gradient(135deg,rgba(45,90,61,0.06),transparent_55%)]",
          size === "thumb" ? "h-full w-full" : "aspect-[4/3] w-full",
        )}
      >
        {showImage ? (
          <img
            key={src}
            src={src}
            alt={`${name} preview`}
            className="max-h-full max-w-full object-contain p-1.5"
            onError={() => setBroken(true)}
            onLoad={() => setBroken(false)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-green/40 sm:text-sm">
              {format || "FILE"}
            </span>
            {size === "card" ? <span className="text-xs text-offgrid-green/45">No preview image</span> : null}
          </div>
        )}
        {size === "card" ? (
          <span className="absolute right-2 top-2 rounded-full bg-offgrid-green/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-offgrid-cream">
            {format || "FILE"}
          </span>
        ) : null}
      </div>
      {fileName && size === "card" ? (
        <div className="border-t border-offgrid-green/10 px-3 py-2">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-offgrid-green/50">{fileName}</p>
        </div>
      ) : null}
    </div>
  );
}

function QuickActions({
  template,
  busy,
  onEdit,
  onTogglePublish,
  onDownload,
  onDelete,
}: {
  template: CustomTemplateAsset;
  busy: boolean;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const canDownload = Boolean(template.fileUrl && template.fileUrl !== "#");
  const canonical = isCanonicalTemplateId(template.id);

  return (
    <div className="flex flex-wrap gap-1.5 sm:justify-end">
      <Button type="button" variant="outline" size="sm" className="min-h-11 cursor-pointer sm:min-h-9" onClick={onEdit}>
        Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 cursor-pointer sm:min-h-9"
        disabled={busy}
        onClick={onTogglePublish}
      >
        {template.isPublished ? "Unpublish" : "Publish"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 cursor-pointer sm:min-h-9"
        disabled={busy || !canDownload}
        onClick={onDownload}
      >
        Download
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "min-h-11 cursor-pointer sm:min-h-9",
          !canonical && "border-red-200 text-red-700 hover:bg-red-50",
        )}
        disabled={busy}
        onClick={onDelete}
      >
        {canonical ? "Hide" : "Delete"}
      </Button>
    </div>
  );
}

export function TemplateSlotsEditor() {
  const raw = useSiteContentStore((s) => s.customTemplates);
  const templates = resolveCanonicalTemplates(raw);
  const resetCanonicalTemplates = useSiteContentStore((s) => s.resetCanonicalTemplates);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<DraftForm | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (publishFilter === "published" && !t.isPublished) return false;
      if (publishFilter === "draft" && t.isPublished) return false;
      return matchesQuery(t, q);
    });
  }, [templates, query, category, publishFilter]);

  const selected = editId ? (templates.find((t) => t.id === editId) ?? null) : null;
  const drawerOpen = Boolean(createDraft || selected);
  const publishedCount = templates.filter((t) => t.isPublished).length;
  const missingFileCount = templates.filter((t) => !t.fileUrl || t.fileUrl === "#").length;
  const draftCount = templates.length - publishedCount;

  const closeDrawer = () => {
    setEditId(null);
    setCreateDraft(null);
    setPendingFile(null);
    setFormError(null);
    setFileError(null);
  };

  const openCreate = () => {
    setEditId(null);
    setPendingFile(null);
    setFormError(null);
    setFileError(null);
    setCreateDraft(emptyDraft(category === "all" ? "jerseys" : category));
  };

  const openEdit = (id: string) => {
    setCreateDraft(null);
    setPendingFile(null);
    setFormError(null);
    setFileError(null);
    setEditId(id);
  };

  const patchSelected = async (patch: Partial<CustomTemplateAsset>) => {
    if (!selected) return;
    setFormError(null);
    setBusy(true);
    const err = await localContentService.updateTemplate(selected.id, patch);
    setBusy(false);
    if (err) setFormError(err);
  };

  const togglePublish = async (template: CustomTemplateAsset) => {
    setBusy(true);
    const err = await localContentService.updateTemplate(template.id, { isPublished: !template.isPublished });
    setBusy(false);
    if (err) window.alert(err);
  };

  const handleAddTemplate = async () => {
    if (!createDraft) return;
    const name = createDraft.name.trim();
    if (!name) {
      setFormError("Enter a display name.");
      return;
    }

    setFormError(null);
    setFileError(null);
    setBusy(true);

    let fileName = createDraft.fileName;
    let fileUrl = createDraft.fileUrl;
    let format = createDraft.format;
    let storageKind = createDraft.storageKind;

    if (pendingFile) {
      const check = validateUploadedFile(pendingFile, "templateAsset");
      if (check.ok === false) {
        setBusy(false);
        setFileError(check.error);
        return;
      }
      const uploaded = await uploadTemplateFile(pendingFile, createDraft.id);
      if (uploaded.ok === false) {
        setBusy(false);
        setFileError(uploaded.error);
        return;
      }
      fileName = pendingFile.name;
      fileUrl = uploaded.publicUrl;
      format = formatFromFileName(pendingFile.name);
      storageKind = "storage";
    }

    const asset: CustomTemplateAsset = {
      id: createDraft.id,
      category: createDraft.category,
      name,
      description: createDraft.description.trim() || "Custom artwork template.",
      fileName,
      fileUrl,
      format,
      previewImageUrl: createDraft.previewImageUrl.trim(),
      isPublished: createDraft.isPublished,
      updatedAt: new Date().toISOString(),
      storageKind,
    };

    const err = await localContentService.addTemplate(asset);
    setBusy(false);
    if (err) {
      setFormError(err);
      return;
    }
    closeDrawer();
  };

  const handleDelete = async (template: CustomTemplateAsset) => {
    const canonical = isCanonicalTemplateId(template.id);
    const message = canonical
      ? `Unpublish "${template.name}" from the template library? The OG slot stays available in admin.`
      : `Delete "${template.name}" permanently?`;
    if (!window.confirm(message)) return;

    setFormError(null);
    setBusy(true);
    const err = await localContentService.removeTemplate(template.id);
    setBusy(false);
    if (err) {
      setFormError(err);
      return;
    }
    if (editId === template.id) closeDrawer();
  };

  const onPickFileForEdit = async (e: ChangeEvent<HTMLInputElement>) => {
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

  const onPickFileForCreate = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file || !createDraft) return;

    const check = validateUploadedFile(file, "templateAsset");
    if (check.ok === false) {
      setFileError(check.error);
      return;
    }

    setFileError(null);
    setPendingFile(file);
    setCreateDraft({
      ...createDraft,
      fileName: file.name,
      format: formatFromFileName(file.name),
    });
  };

  const downloadTemplate = async (template: CustomTemplateAsset) => {
    if (!template.fileUrl || template.fileUrl === "#") {
      window.alert("Upload a file before downloading.");
      return;
    }
    try {
      await triggerTemplateDownload(template);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Download failed.");
    }
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset all template slots to OG factory defaults in this browser? Supabase rows are not wiped.")) {
      return;
    }
    resetCanonicalTemplates();
    closeDrawer();
  };

  const drawerTitle = createDraft ? "Add template" : (selected?.name ?? "Edit template");
  const drawerDescription = createDraft
    ? "New slots start as Draft until you publish them."
    : selected
      ? `${CATEGORY_LABELS[selected.category]} · ${selected.id}`
      : undefined;

  const previewSrc = createDraft
    ? resolvePreviewSrc(createDraft)
    : selected
      ? resolvePreviewSrc(selected)
      : "";

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 sm:space-y-6">
      <section className="rounded-2xl border border-offgrid-green/10 bg-white p-3 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
          <div className="min-w-0 flex-1 lg:max-w-xl">
            <label
              htmlFor="template-search"
              className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45"
            >
              Search
            </label>
            <input
              id="template-search"
              type="search"
              autoComplete="off"
              placeholder="Name, file, or id…"
              className={cn(inputClass, "mt-2")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="min-h-11 cursor-pointer sm:min-h-9" disabled={busy} onClick={openCreate}>
              Add template
            </Button>
            <Button type="button" variant="outline" size="sm" className="min-h-11 cursor-pointer sm:min-h-9" asChild>
              <Link to="/custom/templates" target="_blank" rel="noreferrer">
                View library
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 cursor-pointer sm:min-h-9"
              disabled={busy}
              onClick={resetDefaults}
            >
              Reset defaults
            </Button>
          </div>
        </div>

        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All categories
          </FilterChip>
          {CATEGORIES.map((key) => (
            <Fragment key={key}>
              <FilterChip active={category === key} onClick={() => setCategory(key)}>
                {CATEGORY_LABELS[key]}
              </FilterChip>
            </Fragment>
          ))}
        </div>

        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {(
            [
              { id: "all", label: "Any status" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Draft" },
            ] as const
          ).map((item) => (
            <Fragment key={item.id}>
              <FilterChip active={publishFilter === item.id} onClick={() => setPublishFilter(item.id)}>
                {item.label}
              </FilterChip>
            </Fragment>
          ))}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4 sm:gap-3">
          <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 px-3 py-2.5 sm:px-4 sm:py-3">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Slots</dt>
            <dd className="mt-1 font-display text-xl font-black tabular-nums text-offgrid-green sm:text-2xl">{templates.length}</dd>
          </div>
          <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 px-3 py-2.5 sm:px-4 sm:py-3">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Published</dt>
            <dd className="mt-1 font-display text-xl font-black tabular-nums text-offgrid-lime sm:text-2xl">{publishedCount}</dd>
          </div>
          <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 px-3 py-2.5 sm:px-4 sm:py-3">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Draft</dt>
            <dd className="mt-1 font-display text-xl font-black tabular-nums text-offgrid-green sm:text-2xl">{draftCount}</dd>
          </div>
          <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 px-3 py-2.5 sm:px-4 sm:py-3">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Needs file</dt>
            <dd className="mt-1 font-display text-xl font-black tabular-nums text-offgrid-green sm:text-2xl">{missingFileCount}</dd>
          </div>
        </dl>
      </section>

      {formError && !drawerOpen ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {formError}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-lg font-bold text-offgrid-green">No templates match</p>
            <p className="mt-2 text-sm text-offgrid-green/55">Clear search or filters, or add a new draft.</p>
            <Button type="button" size="sm" className="mt-4 cursor-pointer" onClick={openCreate}>
              Add template
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop / landscape table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-offgrid-green/10 bg-offgrid-green/[0.03]">
                    <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45 xl:px-5">
                      Template
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      Category
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      File
                    </th>
                    <th className="hidden px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45 xl:table-cell">
                      Source
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45 xl:px-5">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((template) => (
                    <tr
                      key={template.id}
                      className="border-b border-offgrid-green/[0.06] transition-colors duration-150 last:border-0 hover:bg-offgrid-green/[0.02]"
                    >
                      <td className="px-4 py-3.5 xl:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <TemplatePreview
                            src={resolvePreviewSrc(template)}
                            format={template.format}
                            name={template.name}
                            size="thumb"
                            className="h-14 w-14 shrink-0 rounded-lg"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-display font-bold text-offgrid-green">{template.name}</p>
                            <p className="truncate text-xs text-offgrid-green/55">{template.description}</p>
                            <p className="mt-0.5 truncate font-mono text-[10px] text-offgrid-green/40">{template.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="rounded-full border border-offgrid-green/15 bg-offgrid-green/5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/70">
                          {CATEGORY_LABELS[template.category]}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="max-w-[160px] truncate font-mono text-[11px] text-offgrid-green/70 xl:max-w-[220px]">
                          {template.fileName}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-offgrid-green/40">{template.format}</p>
                      </td>
                      <td className="hidden px-3 py-3.5 font-mono text-xs text-offgrid-green/65 xl:table-cell">
                        {storageLabel(template)}
                      </td>
                      <td className="px-3 py-3.5">
                        <PublishBadge published={template.isPublished} />
                      </td>
                      <td className="px-4 py-3.5 xl:px-5">
                        <QuickActions
                          template={template}
                          busy={busy}
                          onEdit={() => openEdit(template.id)}
                          onTogglePublish={() => void togglePublish(template)}
                          onDownload={() => void downloadTemplate(template)}
                          onDelete={() => void handleDelete(template)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phone / tablet / portrait cards */}
            <ul className="divide-y divide-offgrid-green/[0.07] lg:hidden">
              {filtered.map((template) => (
                <li key={template.id} className="p-3 sm:p-4">
                  <div className="flex gap-3">
                    <TemplatePreview
                      src={resolvePreviewSrc(template)}
                      format={template.format}
                      name={template.name}
                      size="thumb"
                      className="h-20 w-20 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-display font-bold text-offgrid-green">{template.name}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-offgrid-green/55">{template.description}</p>
                        </div>
                        <PublishBadge published={template.isPublished} />
                      </div>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-offgrid-green/45">
                        {CATEGORY_LABELS[template.category]} · {template.format} · {storageLabel(template)}
                      </p>
                      <p className="mt-1 truncate font-mono text-[11px] text-offgrid-green/55">{template.fileName}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <QuickActions
                      template={template}
                      busy={busy}
                      onEdit={() => openEdit(template.id)}
                      onTogglePublish={() => void togglePublish(template)}
                      onDownload={() => void downloadTemplate(template)}
                      onDelete={() => void handleDelete(template)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <PortalDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={drawerTitle}
        description={drawerDescription}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="min-h-11 flex-1 cursor-pointer" onClick={closeDrawer}>
              Cancel
            </Button>
            {createDraft ? (
              <Button className="min-h-11 flex-1 cursor-pointer" disabled={busy} onClick={() => void handleAddTemplate()}>
                {busy ? "Saving…" : "Add template"}
              </Button>
            ) : (
              <Button className="min-h-11 flex-1 cursor-pointer" disabled={busy} onClick={closeDrawer}>
                Done
              </Button>
            )}
          </div>
        }
      >
        {createDraft || selected ? (
          <div className="space-y-5">
            {formError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {formError}
              </p>
            ) : null}

            <TemplatePreview
              src={previewSrc}
              format={createDraft?.format ?? selected?.format ?? "FILE"}
              name={createDraft?.name || selected?.name || "Template"}
              fileName={pendingFile?.name ?? createDraft?.fileName ?? selected?.fileName}
            />

            <div>
              <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">Status</p>
              <StatusToggle
                published={createDraft ? createDraft.isPublished : Boolean(selected?.isPublished)}
                disabled={busy}
                onChange={(next) => {
                  if (createDraft) {
                    // New templates default Draft; allow publish only when admin chooses it.
                    setCreateDraft({ ...createDraft, isPublished: next });
                    return;
                  }
                  void patchSelected({ isPublished: next });
                }}
              />
              {createDraft && !createDraft.isPublished ? (
                <p className="mt-1.5 text-xs text-offgrid-green/50">Saved as Draft — not visible on /custom/templates until Published.</p>
              ) : null}
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                Category
              </label>
              <select
                value={createDraft?.category ?? selected?.category}
                disabled={busy}
                onChange={(e) => {
                  const value = e.target.value as TemplateCategory;
                  if (createDraft) setCreateDraft({ ...createDraft, category: value });
                  else void patchSelected({ category: value });
                }}
                className={cn(inputClass, "mt-2")}
              >
                {CATEGORIES.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                Display name
              </label>
              <input
                className={cn(inputClass, "mt-2")}
                value={createDraft?.name ?? selected?.name ?? ""}
                disabled={busy}
                placeholder="e.g. Team jersey pack"
                onChange={(e) => {
                  if (createDraft) setCreateDraft({ ...createDraft, name: e.target.value });
                  else void patchSelected({ name: e.target.value });
                }}
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                Description
              </label>
              <textarea
                rows={3}
                className={cn(inputClass, "mt-2 resize-y")}
                value={createDraft?.description ?? selected?.description ?? ""}
                disabled={busy}
                placeholder="Short note for customers"
                onChange={(e) => {
                  if (createDraft) setCreateDraft({ ...createDraft, description: e.target.value });
                  else void patchSelected({ description: e.target.value });
                }}
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                Card preview image
              </label>
              <div className="mt-2">
                <CmsImageInput
                  value={createDraft?.previewImageUrl ?? selected?.previewImageUrl ?? ""}
                  onChange={(v) => {
                    if (createDraft) setCreateDraft({ ...createDraft, previewImageUrl: v });
                    else void patchSelected({ previewImageUrl: v });
                  }}
                  alt={createDraft?.name || selected?.name || "Template"}
                  uploadSection={`templates-${createDraft?.id ?? selected?.id ?? "new"}`}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                Downloadable file
              </label>
              <label className="mt-2 flex min-h-11 cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-offgrid-green/25 px-4 py-4 text-sm text-offgrid-green/70 hover:bg-offgrid-green/[0.03]">
                <span className="font-semibold text-offgrid-green">Choose .ai, .pdf, .jpg…</span>
                <span className="break-all font-mono text-xs">
                  {pendingFile?.name ?? createDraft?.fileName ?? selected?.fileName}
                </span>
                <input
                  type="file"
                  accept={fileAcceptAttribute("templateAsset")}
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => (createDraft ? onPickFileForCreate(e) : void onPickFileForEdit(e))}
                />
              </label>
              {fileError ? (
                <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                  {fileError}
                </p>
              ) : null}
              <p className="mt-1.5 text-xs text-offgrid-green/50">{fileRuleHint("templateAsset")}</p>
              {selected?.storageKind === "static" && selected.fileUrl && selected.fileUrl !== "#" ? (
                <p className="mt-2 break-all font-mono text-[10px] text-offgrid-green/45">Bundled: {selected.fileUrl}</p>
              ) : null}
              {selected && selected.fileUrl && selected.fileUrl !== "#" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 min-h-11 cursor-pointer sm:min-h-9"
                  disabled={busy}
                  onClick={() => void downloadTemplate(selected)}
                >
                  Download file
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </PortalDrawer>
    </div>
  );
}
