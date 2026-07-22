import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import type { TestimonialWallEntry } from "@/src/data/testimonialsPage";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { hydrateSiteContentFromSupabase, localContentService } from "@/src/services";
import { CmsField, CmsImageInput, CmsSectionPanel, CmsTextInput } from "@/src/components/admin/landing/CmsField";
import { CmsRouteSelect } from "@/src/components/admin/CmsRouteSelect";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { useDebouncedLandingPersist } from "@/src/hooks/useDebouncedSitePersist";
import { cn } from "@/src/lib/utils";

const inputClass = "w-full px-3 py-2 text-sm";

const defaultDraft = (): TestimonialWallEntry => ({
  id: "",
  quote: "",
  author: "",
  handle: "",
  location: "",
  tag: "Lifestyle",
  outcome: "",
  image: "/images/community/community-ultimate-catch.jpg",
  featured: false,
  rating: 5,
  published: true,
  sortOrder: 0,
});

export function AdminTestimonialsPage() {
  const [persistReady, setPersistReady] = useState(false);
  useDebouncedLandingPersist(persistReady);

  const page = useSiteContentStore((s) => s.landingContent.testimonialsPage);
  const wall = useSiteContentStore((s) => s.testimonialWall);
  const updateHero = useSiteContentStore((s) => s.updateLandingTestimonialsHero);
  const updateShowcase = useSiteContentStore((s) => s.updateLandingTestimonialsShowcase);
  const updateShowcaseTile = useSiteContentStore((s) => s.updateLandingTestimonialsShowcaseTile);
  const updateWallCopy = useSiteContentStore((s) => s.updateLandingTestimonialsWall);
  const updateCta = useSiteContentStore((s) => s.updateLandingTestimonialsCta);

  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TestimonialWallEntry>(defaultDraft());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void hydrateSiteContentFromSupabase().finally(() => setPersistReady(true));
  }, []);

  const sorted = useMemo(
    () => [...wall].sort((a, b) => a.sortOrder - b.sortOrder || a.author.localeCompare(b.author)),
    [wall],
  );

  const filtered = sorted.filter((entry) =>
    `${entry.author} ${entry.tag} ${entry.quote}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setDraft(defaultDraft());
    setFormError(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(defaultDraft());
    setFormError(null);
    setDrawerOpen(true);
  };

  const openEdit = (entry: TestimonialWallEntry) => {
    setEditingId(entry.id);
    setDraft(entry);
    setFormError(null);
    setDrawerOpen(true);
  };

  const submit = async () => {
    setFormError(null);
    if (!draft.quote.trim()) {
      setFormError("Quote is required.");
      return;
    }
    if (!draft.author.trim()) {
      setFormError("Author name is required.");
      return;
    }

    const payload: TestimonialWallEntry = {
      ...draft,
      id: editingId ?? `tm-${Date.now()}`,
      sortOrder: editingId ? draft.sortOrder : wall.length,
    };

    setSaving(true);
    const error = editingId
      ? await localContentService.updateTestimonial(editingId, payload)
      : await localContentService.addTestimonial(payload);
    setSaving(false);

    if (error) {
      setFormError(error);
      return;
    }
    closeDrawer();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this testimonial from the wall?")) return;
    const error = await localContentService.removeTestimonial(id);
    if (error) window.alert(error);
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Content"
        title="Testimonials page"
        description="Edit page copy, showcase images, and manage the full testimonial wall. Changes sync to Supabase for the live /testimonials page."
        actions={
          <a
            href="/testimonials"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-green/70 hover:text-offgrid-green"
          >
            Preview
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        }
      />

      <div className="space-y-6">
        <CmsSectionPanel title="Hero" description="Top band on /testimonials">
          <CmsField label="Eyebrow">
            <CmsTextInput value={page.hero.eyebrow} onChange={(v) => updateHero({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={page.hero.titleLine1} onChange={(v) => updateHero({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput value={page.hero.titleLine2Italic} onChange={(v) => updateHero({ titleLine2Italic: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={page.hero.description} onChange={(v) => updateHero({ description: v })} multiline rows={3} />
          </CmsField>
          <CmsField label="Back link label">
            <CmsTextInput value={page.hero.backLabel} onChange={(v) => updateHero({ backLabel: v })} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Showcase strip" description="Community photo grid below the hero">
          <CmsField label="Eyebrow">
            <CmsTextInput value={page.showcase.eyebrow} onChange={(v) => updateShowcase({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title">
            <CmsTextInput value={page.showcase.title} onChange={(v) => updateShowcase({ title: v })} />
          </CmsField>
          <CmsField label="CTA label">
            <CmsTextInput value={page.showcase.ctaLabel} onChange={(v) => updateShowcase({ ctaLabel: v })} />
          </CmsField>
          <CmsField label="CTA link">
            <CmsRouteSelect value={page.showcase.ctaHref} onChange={(v) => updateShowcase({ ctaHref: v })} />
          </CmsField>
        </CmsSectionPanel>

        {page.showcase.tiles.map((tile, index) => (
          <div key={index}>
            <CmsSectionPanel title={`Showcase tile ${index + 1}`}>
              <CmsField label="Image" className="sm:col-span-2">
                <CmsImageInput
                  value={tile.image}
                  onChange={(v) => updateShowcaseTile(index, { image: v })}
                  alt={`Showcase tile ${index + 1}`}
                  uploadSection="testimonials-showcase"
                />
              </CmsField>
              <CmsField label="Label">
                <CmsTextInput value={tile.label} onChange={(v) => updateShowcaseTile(index, { label: v })} />
              </CmsField>
            </CmsSectionPanel>
          </div>
        ))}

        <CmsSectionPanel title="Wall section copy">
          <CmsField label="Featured eyebrow">
            <CmsTextInput value={page.wall.featuredEyebrow} onChange={(v) => updateWallCopy({ featuredEyebrow: v })} />
          </CmsField>
          <CmsField label="Filter eyebrow">
            <CmsTextInput value={page.wall.filterEyebrow} onChange={(v) => updateWallCopy({ filterEyebrow: v })} />
          </CmsField>
          <CmsField label="Filter title">
            <CmsTextInput value={page.wall.filterTitle} onChange={(v) => updateWallCopy({ filterTitle: v })} />
          </CmsField>
          <CmsField label="Empty state" className="sm:col-span-2">
            <CmsTextInput value={page.wall.emptyMessage} onChange={(v) => updateWallCopy({ emptyMessage: v })} multiline />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Closing CTA">
          <CmsField label="Eyebrow">
            <CmsTextInput value={page.cta.eyebrow} onChange={(v) => updateCta({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title">
            <CmsTextInput value={page.cta.title} onChange={(v) => updateCta({ title: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={page.cta.description} onChange={(v) => updateCta({ description: v })} multiline rows={3} />
          </CmsField>
          <CmsField label="Primary label">
            <CmsTextInput value={page.cta.primaryLabel} onChange={(v) => updateCta({ primaryLabel: v })} />
          </CmsField>
          <CmsField label="Primary link">
            <CmsRouteSelect value={page.cta.primaryHref} onChange={(v) => updateCta({ primaryHref: v })} />
          </CmsField>
          <CmsField label="Secondary label">
            <CmsTextInput value={page.cta.secondaryLabel} onChange={(v) => updateCta({ secondaryLabel: v })} />
          </CmsField>
          <CmsField label="Secondary link">
            <CmsRouteSelect value={page.cta.secondaryHref} onChange={(v) => updateCta({ secondaryHref: v })} />
          </CmsField>
        </CmsSectionPanel>

        <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-black text-offgrid-green">Testimonial wall</h2>
              <p className="mt-1 text-sm text-offgrid-green/60">
                Add, edit, or remove stories. Mark one as featured for the hero card.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-offgrid-green px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-offgrid-cream"
            >
              <Plus className="h-4 w-4" />
              Add story
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search author, tag, or quote…"
              className={cn(inputClass, "rounded-xl border border-offgrid-green/15 pl-9")}
            />
          </div>

          <div className="space-y-3">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-xl border border-offgrid-green/10 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-offgrid-green">{entry.author}</p>
                    <span className="rounded-full bg-offgrid-cream px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-green">
                      {entry.tag}
                    </span>
                    {entry.featured ? (
                      <span className="rounded-full bg-offgrid-lime/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-offgrid-green">
                        Featured
                      </span>
                    ) : null}
                    {!entry.published ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-700">
                        Draft
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-offgrid-green/70">&ldquo;{entry.quote}&rdquo;</p>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < entry.rating ? "fill-offgrid-lime text-offgrid-lime" : "text-offgrid-green/20",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(entry)}
                    className="inline-flex items-center gap-1 rounded-lg border border-offgrid-green/15 px-3 py-1.5 text-xs font-semibold text-offgrid-green hover:bg-offgrid-cream"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-offgrid-green/15 p-1.5 text-offgrid-green/50 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PortalDrawer open={drawerOpen} onClose={closeDrawer} title={editingId ? "Edit testimonial" : "New testimonial"}>
        <div className="space-y-4">
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
            Quote
            <textarea
              value={draft.quote}
              onChange={(e) => setDraft((d) => ({ ...d, quote: e.target.value }))}
              rows={4}
              className={cn(inputClass, "mt-1 rounded-lg border border-offgrid-green/15")}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
            Author
            <input
              value={draft.author}
              onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
              className={cn(inputClass, "mt-1 rounded-lg border border-offgrid-green/15")}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
            Handle
            <input
              value={draft.handle}
              onChange={(e) => setDraft((d) => ({ ...d, handle: e.target.value }))}
              className={cn(inputClass, "mt-1 rounded-lg border border-offgrid-green/15")}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
            Location
            <input
              value={draft.location}
              onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
              className={cn(inputClass, "mt-1 rounded-lg border border-offgrid-green/15")}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
            Category tag
            <input
              value={draft.tag}
              onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))}
              className={cn(inputClass, "mt-1 rounded-lg border border-offgrid-green/15")}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
            Outcome highlight
            <input
              value={draft.outcome}
              onChange={(e) => setDraft((d) => ({ ...d, outcome: e.target.value }))}
              className={cn(inputClass, "mt-1 rounded-lg border border-offgrid-green/15")}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
            Card image URL
            <input
              value={draft.image}
              onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
              className={cn(inputClass, "mt-1 rounded-lg border border-offgrid-green/15")}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
            Rating
            <select
              value={draft.rating}
              onChange={(e) => setDraft((d) => ({ ...d, rating: Number(e.target.value) }))}
              className={cn(inputClass, "mt-1 rounded-lg border border-offgrid-green/15")}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-offgrid-green">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
            />
            Featured story (hero card)
          </label>
          <label className="flex items-center gap-2 text-sm text-offgrid-green">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
            />
            Published on storefront
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="w-full rounded-full bg-offgrid-green py-3 text-sm font-bold uppercase tracking-[0.1em] text-offgrid-cream disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Create testimonial"}
          </button>
        </div>
      </PortalDrawer>
    </div>
  );
}
