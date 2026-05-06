import { useMemo, useState } from "react";
import type { SiteEvent } from "@/src/data/events";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

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

export function AdminEventsPage() {
  const events = useSiteContentStore((state) => state.events);
  const addEvent = useSiteContentStore((state) => state.addEvent);
  const updateEvent = useSiteContentStore((state) => state.updateEvent);
  const removeEvent = useSiteContentStore((state) => state.removeEvent);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SiteEvent>(defaultDraft);
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.title.localeCompare(b.title)),
    [events],
  );
  const filtered = sorted.filter((event) =>
    `${event.title} ${event.location} ${event.category}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );

  const reset = () => {
    setEditingId(null);
    setDraft(defaultDraft);
  };

  const submit = () => {
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
          updateEvent(event.id, { featured: false });
        }
      });
    }

    if (editingId) updateEvent(editingId, payload);
    else addEvent(payload);
    reset();
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        Admin Events Control
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">Events CRUD</h1>

      <div className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <h2 className="text-lg font-display font-bold text-offgrid-green">
            {editingId ? "Edit Event" : "Create Event"}
          </h2>
          <div className="mt-4 space-y-3">
            <input
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <input
              value={draft.subtitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Subtitle"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={draft.date}
                onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
                placeholder="Date (15 Jun)"
                className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
              <input
                value={draft.time}
                onChange={(e) => setDraft((prev) => ({ ...prev, time: e.target.value }))}
                placeholder="Time"
                className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
            </div>
            <input
              value={draft.location}
              onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Location"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <input
              value={draft.address}
              onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Address"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <input
              value={draft.image}
              onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="Hero image URL"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={draft.category}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, category: e.target.value as SiteEvent["category"] }))
                }
                className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              >
                <option value="tournament">Tournament</option>
                <option value="community">Community</option>
                <option value="launch">Launch</option>
                <option value="workshop">Workshop</option>
              </select>
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, status: e.target.value as SiteEvent["status"] }))
                }
                className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(draft.featured)}
                onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))}
              />
              Featured Event
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={submit}
              className="rounded-xl bg-offgrid-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={reset}
              className="rounded-xl border border-offgrid-green/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
            >
              Reset
            </button>
          </div>
        </aside>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-display font-bold text-offgrid-green">Published Events</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search event..."
              className="w-full max-w-xs rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 space-y-3">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-offgrid-green/20 bg-offgrid-green/5 p-5 text-sm text-offgrid-green/60">
                No events match your search.
              </div>
            )}
            {filtered.map((event) => (
              <article key={event.id} className={cn("rounded-xl border p-4", editingId === event.id ? "border-offgrid-green" : "border-offgrid-green/10")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-offgrid-green/45">
                      {event.status} · {event.category}
                    </p>
                    <h3 className="text-xl font-display font-bold text-offgrid-green">{event.title}</h3>
                    <p className="text-sm text-offgrid-green/65">{event.date} · {event.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(event.id);
                        setDraft(event);
                      }}
                      className="rounded-lg border border-offgrid-green/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete event "${event.title}"?`)) {
                          removeEvent(event.id);
                        }
                      }}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
