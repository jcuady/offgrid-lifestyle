import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import type { SiteEvent } from "@/src/data/events";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { hydrateSiteContentFromSupabase, localContentService } from "@/src/services";
import { cn } from "@/src/lib/utils";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";

const defaultDraft: SiteEvent = {
  id: "",
  title: "",
  subtitle: "",
  date: "01 Aug",
  time: "9:00 AM - 5:00 PM",
  location: "",
  address: "",
  description: "",
  image: "/images/event_barako.png",
  category: "community",
  status: "upcoming",
  featured: false,
  price: "₱0",
  highlights: ["Event highlights here"],
};

const inputClass = "w-full px-3 py-2 text-sm";

export function AdminEventsPage() {
  const events = useSiteContentStore((state) => state.events);

  useEffect(() => {
    void hydrateSiteContentFromSupabase();
  }, []);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SiteEvent>(defaultDraft);
  const [query, setQuery] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sorted = useMemo(() => [...events].sort((a, b) => a.title.localeCompare(b.title)), [events]);
  const filtered = sorted.filter((event) =>
    `${event.title} ${event.location} ${event.category}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setDraft(defaultDraft);
    setFormError(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(defaultDraft);
    setFormError(null);
    setDrawerOpen(true);
  };

  const openEdit = (event: SiteEvent) => {
    setEditingId(event.id);
    setDraft(event);
    setFormError(null);
    setDrawerOpen(true);
  };

  const submit = () => {
    setFormError(null);
    if (!draft.title.trim()) {
      setFormError("Event title is required.");
      return;
    }
    if (!draft.location.trim()) {
      setFormError("Event location is required.");
      return;
    }
    const payload: SiteEvent = {
      ...draft,
      id: draft.id.trim() || `ev-${crypto.randomUUID().slice(0, 8)}`,
      location: draft.location || "Metro Manila",
      address: draft.address || "TBA",
      description: draft.description || "Community event details to follow.",
      highlights: draft.highlights.length ? draft.highlights : ["Community activations"],
    };

    if (payload.featured) {
      events.forEach((event) => {
        if (event.id !== payload.id && event.featured) {
          localContentService.updateEvent(event.id, { featured: false });
        }
      });
    }

    if (editingId) localContentService.updateEvent(editingId, payload);
    else localContentService.addEvent(payload);
    closeDrawer();
  };

  const removeEvent = (event: SiteEvent) => {
    if (window.confirm(`Delete event "${event.title}"?`)) {
      localContentService.removeEvent(event.id);
      if (editingId === event.id) closeDrawer();
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <PortalPageHeader
        eyebrow="Admin Events Control"
        title="Events"
        description="Create and manage community events shown on the storefront."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
          >
            <Plus className="h-4 w-4" />
            Create event
          </button>
        }
      />

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            className="w-full !pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <p className="hidden shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-offgrid-green/45 sm:block">
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white/60 p-12 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-offgrid-green/30" />
          <p className="mt-3 text-sm text-offgrid-green/60">
            {events.length === 0 ? "No events yet. Create your first one." : "No events match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((event) => (
            <article
              key={event.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-offgrid-lime/40"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-offgrid-cream">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-offgrid-green/25">
                    <CalendarDays className="h-8 w-8" />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] backdrop-blur",
                    event.status === "upcoming"
                      ? "bg-offgrid-lime/25 text-offgrid-green"
                      : "bg-offgrid-dark/10 text-offgrid-green/50",
                  )}
                >
                  {event.status}
                </span>
                {event.featured ? (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-offgrid-green/90 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-offgrid-cream">
                    <Star className="h-3 w-3 fill-offgrid-lime text-offgrid-lime" />Featured
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-offgrid-green/45">
                  {event.category}
                </p>
                <h3 className="mt-1 line-clamp-1 font-display text-base font-bold text-offgrid-green">{event.title}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-offgrid-green/65">
                  <CalendarDays className="h-3.5 w-3.5 text-offgrid-green/40" />
                  {event.date} · {event.time}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-offgrid-green/65">
                  <MapPin className="h-3.5 w-3.5 text-offgrid-green/40" />
                  <span className="line-clamp-1">{event.location}</span>
                </p>
                <div className="mt-4 flex gap-2 border-t border-offgrid-green/10 pt-3">
                  <button
                    onClick={() => openEdit(event)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-offgrid-green/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-green transition-colors hover:bg-offgrid-green/5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => removeEvent(event)}
                    aria-label={`Delete ${event.title}`}
                    className="inline-flex items-center justify-center rounded-lg border border-red-300 px-3 py-2 text-red-600 transition-colors hover:bg-red-50"
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
        title={editingId ? "Edit event" : "Create event"}
        description="Publishes to the storefront events page."
        footer={
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={submit}
              className="rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
            >
              {editingId ? "Update event" : "Create event"}
            </button>
            <button
              onClick={closeDrawer}
              className="rounded-xl border border-offgrid-green/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green transition-colors hover:bg-offgrid-green/5"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>
          )}
          <input
            value={draft.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Event title"
            className={inputClass}
          />
          <input
            value={draft.subtitle}
            onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
            placeholder="Subtitle"
            className={inputClass}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={draft.date}
              onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
              placeholder="Date (15 Jun)"
              className={inputClass}
            />
            <input
              value={draft.time}
              onChange={(e) => setDraft((prev) => ({ ...prev, time: e.target.value }))}
              placeholder="Time"
              className={inputClass}
            />
          </div>
          <input
            value={draft.location}
            onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="Location"
            className={inputClass}
          />
          <input
            value={draft.address}
            onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Address"
            className={inputClass}
          />
          <input
            value={draft.image}
            onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
            placeholder="Hero image URL"
            className={inputClass}
          />
          <textarea
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Event description"
            className={inputClass}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              value={draft.price}
              onChange={(e) => setDraft((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="Price"
              className={inputClass}
            />
            <input
              type="number"
              value={draft.capacity ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, capacity: e.target.value ? Number(e.target.value) : undefined }))
              }
              placeholder="Capacity"
              className={inputClass}
            />
            <input
              type="number"
              value={draft.registered ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, registered: e.target.value ? Number(e.target.value) : undefined }))
              }
              placeholder="Registered"
              className={inputClass}
            />
          </div>
          <textarea
            rows={2}
            value={draft.highlights.join(", ")}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                highlights: e.target.value
                  .split(",")
                  .map((entry) => entry.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="Highlights (comma separated)"
            className={inputClass}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              value={draft.category}
              onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value as SiteEvent["category"] }))}
              className={inputClass}
            >
              <option value="tournament">Tournament</option>
              <option value="community">Community</option>
              <option value="launch">Launch</option>
              <option value="workshop">Workshop</option>
            </select>
            <select
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as SiteEvent["status"] }))}
              className={inputClass}
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-offgrid-green/20 bg-white px-3 py-2.5 text-sm text-offgrid-green">
            <input
              type="checkbox"
              checked={Boolean(draft.featured)}
              onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4 accent-offgrid-lime"
            />
            Featured event
          </label>
        </div>
      </PortalDrawer>
    </div>
  );
}
