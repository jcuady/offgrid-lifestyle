import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Layers3, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import {
  deleteCatalogTerm,
  listCatalogTerms,
  upsertCatalogTerm,
  type CatalogTerm,
} from "@/src/services/catalogTermsService";
import type { CatalogLabelKind } from "@/src/lib/catalogTaxonomy";
import { uploadCmsImage } from "@/src/lib/cmsImageUpload";
import { cn } from "@/src/lib/utils";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime/50 focus:ring-2 focus:ring-offgrid-lime/20";

type TabKind = Extract<CatalogLabelKind, "sport" | "collection">;

type Draft = {
  id?: string;
  label: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  published: boolean;
};

const emptyDraft = (): Draft => ({
  label: "",
  description: "",
  imageUrl: "",
  sortOrder: 100,
  published: true,
});

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-[11px] text-offgrid-green/45">{hint}</span> : null}
    </label>
  );
}

export function AdminCatalogPage() {
  const [tab, setTab] = useState<TabKind>("collection");
  const [terms, setTerms] = useState<CatalogTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogTerm | null>(null);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listCatalogTerms();
      setTerms(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return terms
      .filter((t) => t.kind === tab)
      .filter((t) => !needle || `${t.label} ${t.slug}`.toLowerCase().includes(needle));
  }, [terms, tab, query]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    setDraft(emptyDraft());
    setFormError(null);
    setUploadError(null);
  };

  const openCreate = () => {
    setEditing(null);
    setDraft(emptyDraft());
    setFormError(null);
    setDrawerOpen(true);
  };

  const openEdit = (term: CatalogTerm) => {
    setEditing(term);
    setDraft({
      id: term.id,
      label: term.label,
      description: term.description ?? "",
      imageUrl: term.imageUrl ?? "",
      sortOrder: term.sortOrder,
      published: term.published,
    });
    setFormError(null);
    setDrawerOpen(true);
  };

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploadBusy(true);
    try {
      const section = tab === "collection" ? "catalog-collections" : "catalog-sports";
      const result = await uploadCmsImage(file, section);
      if (result.ok === false) {
        setUploadError(result.error);
        return;
      }
      setDraft((prev) => ({ ...prev, imageUrl: result.publicUrl }));
    } finally {
      setUploadBusy(false);
    }
  };

  const submit = async () => {
    setFormError(null);
    if (!draft.label.trim()) {
      setFormError("Label is required.");
      return;
    }
    setSaving(true);
    try {
      await upsertCatalogTerm({
        id: draft.id,
        kind: tab,
        label: draft.label,
        description: draft.description || null,
        imageUrl: draft.imageUrl || null,
        sortOrder: draft.sortOrder,
        published: draft.published,
        slug: editing?.slug,
      });
      await refresh();
      closeDrawer();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (term: CatalogTerm) => {
    if (!window.confirm(`Delete "${term.label}"? Products may still reference its slug.`)) return;
    try {
      await deleteCatalogTerm(term.kind, term.label);
      await refresh();
      if (editing?.id === term.id) closeDrawer();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not delete.");
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <PortalPageHeader
        eyebrow="Catalog taxonomy"
        title="Sports & collections"
        description="Manage storefront sport chips and collection rails. Only published entries appear on the shop."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
          >
            <Plus className="h-4 w-4" />
            Add {tab === "collection" ? "collection" : "sport"}
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-offgrid-green/15 bg-white p-1">
          {(["collection", "sport"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => {
                setTab(kind);
                setQuery("");
              }}
              className={cn(
                "rounded-lg px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
                tab === kind ? "bg-offgrid-green text-offgrid-cream" : "text-offgrid-green/60 hover:text-offgrid-green",
              )}
            >
              {kind === "collection" ? "Collections" : "Sports"}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab === "collection" ? "collections" : "sports"}…`}
            className={cn(inputClass, "!pl-9")}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-offgrid-green/60">Loading catalog…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white/60 p-12 text-center">
          <Layers3 className="mx-auto h-8 w-8 text-offgrid-green/30" />
          <p className="mt-3 text-sm text-offgrid-green/60">No {tab === "collection" ? "collections" : "sports"} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((term) => (
            <article
              key={term.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/10 transition-all hover:ring-offgrid-lime/40"
            >
              <div className="relative aspect-[16/10] bg-offgrid-cream">
                {term.imageUrl ? (
                  <img src={term.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid h-full place-items-center text-offgrid-green/25">
                    <Layers3 className="h-8 w-8" />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em]",
                    term.published ? "bg-offgrid-lime/25 text-offgrid-green" : "bg-offgrid-dark/10 text-offgrid-green/50",
                  )}
                >
                  {term.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-offgrid-green/45">{term.slug}</p>
                <h3 className="mt-1 font-display text-base font-bold text-offgrid-green">{term.label}</h3>
                {term.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-offgrid-green/65">{term.description}</p>
                ) : null}
                <p className="mt-2 font-mono text-[10px] text-offgrid-green/45">Sort {term.sortOrder}</p>
                <div className="mt-4 flex gap-2 border-t border-offgrid-green/10 pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(term)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-offgrid-green/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-green hover:bg-offgrid-green/5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(term)}
                    aria-label={`Delete ${term.label}`}
                    className="inline-flex items-center justify-center rounded-lg border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <PortalDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? `Edit ${tab}` : `New ${tab}`}
        description="Saved terms sync to the storefront shop and collections pages."
        footer={
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={saving}
              className="rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream hover:bg-offgrid-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-xl border border-offgrid-green/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green hover:bg-offgrid-green/5"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>
          ) : null}
          <Field label="Label">
            <input
              value={draft.label}
              onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
              className={cn(inputClass, "resize-y")}
            />
          </Field>
          <Field label="Cover image" hint="Optional — used on collection tiles and hub.">
            {draft.imageUrl ? (
              <img src={draft.imageUrl} alt="" className="mb-2 max-h-40 w-full rounded-xl object-cover ring-1 ring-offgrid-green/10" />
            ) : null}
            <input
              value={draft.imageUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="Image URL"
              className={inputClass}
            />
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={onUpload} />
            <button
              type="button"
              disabled={uploadBusy}
              onClick={() => fileRef.current?.click()}
              className="mt-2 inline-flex rounded-lg border border-offgrid-green/20 px-3 py-1.5 text-xs font-semibold text-offgrid-green hover:bg-offgrid-green/5 disabled:opacity-50"
            >
              {uploadBusy ? "Uploading…" : "Upload image"}
            </button>
            {uploadError ? <span className="block text-xs text-red-600">{uploadError}</span> : null}
          </Field>
          <Field label="Sort order" hint="Lower numbers appear first in rails.">
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => setDraft((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))}
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-2 rounded-xl border border-offgrid-green/20 bg-white px-3 py-2.5 text-sm text-offgrid-green">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft((prev) => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4 accent-offgrid-lime"
            />
            Published on storefront
          </label>
        </div>
      </PortalDrawer>
    </div>
  );
}
