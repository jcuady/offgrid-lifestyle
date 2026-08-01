import { useEffect, useMemo, useState } from "react";
import { KanbanSquare, Plus, Trash2 } from "lucide-react";
import {
  PLAN_COLUMNS,
  PLAN_LABEL_SUGGESTIONS,
  cardsInColumn,
  formatPlanDueDate,
  labelToneClass,
  type PlanCard,
  type PlanStatus,
} from "@/src/lib/planBoard";
import {
  createPlanCard,
  deletePlanCard,
  listPlanCards,
  persistCardMove,
  updatePlanCard,
} from "@/src/services/planBoardService";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { cn } from "@/src/lib/utils";
import type { UserRole } from "@/src/store/usePortalStore";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2 text-sm text-offgrid-green outline-none focus:border-offgrid-lime/50 focus:ring-2 focus:ring-offgrid-lime/20";

export function AdminPlanBoardPage({ role }: { role: Exclude<UserRole, "customer"> }) {
  const canWrite = role === "admin";
  const [cards, setCards] = useState<PlanCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDue, setDraftDue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setBusy(true);
    setError(null);
    const result = await listPlanCards();
    setBusy(false);
    if (result.ok === false) {
      setError(result.message);
      return;
    }
    setCards(result.cards);
  };

  useEffect(() => {
    void load();
  }, []);

  const columns = useMemo(
    () => PLAN_COLUMNS.map((col) => ({ ...col, cards: cardsInColumn(cards, col.status) })),
    [cards],
  );

  const onCreate = async () => {
    if (!canWrite) return;
    setBusy(true);
    setError(null);
    const result = await createPlanCard({
      title: draftTitle,
      label: draftLabel,
      dueDate: draftDue || null,
    });
    setBusy(false);
    if (result.ok === false) {
      setError(result.message);
      return;
    }
    setDraftTitle("");
    setDraftLabel("");
    setDraftDue("");
    setCards((prev) => [...prev, result.card]);
  };

  const onMove = async (cardId: string, toStatus: PlanStatus) => {
    if (!canWrite) return;
    const result = await persistCardMove(cards, cardId, toStatus, cardsInColumn(cards, toStatus).length);
    if (result.ok === false) {
      setError(result.message);
      return;
    }
    setCards(result.cards);
  };

  const onSaveEdit = async (card: PlanCard, title: string, label: string, dueDate: string, notes: string) => {
    if (!canWrite) return;
    const result = await updatePlanCard(card.id, { title, label, dueDate: dueDate || null, notes, status: card.status });
    if (result.ok === false) {
      setError(result.message);
      return;
    }
    setCards((prev) => prev.map((c) => (c.id === card.id ? result.card : c)));
    setEditingId(null);
  };

  const onDelete = async (id: string) => {
    if (!canWrite) return;
    if (!window.confirm("Delete this card?")) return;
    const result = await deletePlanCard(id);
    if (result.ok === false) {
      setError(result.message);
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <PortalPageHeader
        eyebrow={role === "admin" ? "Admin Ops" : "Staff Ops"}
        title="Plan board"
        description={
          canWrite
            ? "Track upcoming work across Upcoming → In Progress → Done."
            : "Read-only view of the ops plan board."
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {canWrite ? (
        <div className="mb-6 grid gap-2 rounded-2xl border border-offgrid-green/10 bg-white p-4 sm:grid-cols-[1fr_160px_140px_auto]">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="New card title"
            className={inputClass}
          />
          <input
            list="plan-labels"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Label"
            className={inputClass}
          />
          <datalist id="plan-labels">
            {PLAN_LABEL_SUGGESTIONS.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
          <input type="date" value={draftDue} onChange={(e) => setDraftDue(e.target.value)} className={inputClass} />
          <button
            type="button"
            disabled={busy || !draftTitle.trim()}
            onClick={() => void onCreate()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-offgrid-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-cream disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      ) : null}

      {busy && cards.length === 0 ? (
        <p className="text-sm text-offgrid-green/55">Loading board…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((col) => (
            <section key={col.status} className="rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
              <div className="mb-3 flex items-center gap-2 px-1">
                <KanbanSquare className="h-4 w-4 text-offgrid-green/50" />
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/55">
                  {col.title}
                </h2>
                <span className="ml-auto font-mono text-[10px] text-offgrid-green/40">{col.cards.length}</span>
              </div>
              <ul className="space-y-2">
                {col.cards.map((card) => (
                  <li key={card.id} className="rounded-xl border border-offgrid-green/10 bg-white p-3 shadow-sm">
                    {editingId === card.id && canWrite ? (
                      <EditCardForm
                        card={card}
                        onCancel={() => setEditingId(null)}
                        onSave={(title, label, dueDate, notes) =>
                          void onSaveEdit(card, title, label, dueDate, notes)
                        }
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => canWrite && setEditingId(card.id)}
                        >
                          <p className="text-sm font-semibold text-offgrid-green">{card.title}</p>
                          {card.label ? (
                            <span
                              className={cn(
                                "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                                labelToneClass(card.label),
                              )}
                            >
                              {card.label}
                            </span>
                          ) : null}
                          {formatPlanDueDate(card.dueDate) ? (
                            <p className="mt-1 text-[11px] text-offgrid-green/50">Due {formatPlanDueDate(card.dueDate)}</p>
                          ) : null}
                          {card.notes ? (
                            <p className="mt-1 line-clamp-2 text-xs text-offgrid-green/60">{card.notes}</p>
                          ) : null}
                        </button>
                        {canWrite ? (
                          <div className="mt-2 flex items-center gap-2 border-t border-offgrid-green/10 pt-2">
                            <select
                              value={card.status}
                              onChange={(e) => void onMove(card.id, e.target.value as PlanStatus)}
                              className="flex-1 rounded-lg border border-offgrid-green/15 bg-white px-2 py-1.5 text-[11px]"
                              aria-label={`Move ${card.title}`}
                            >
                              {PLAN_COLUMNS.map((c) => (
                                <option key={c.status} value={c.status}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              aria-label={`Delete ${card.title}`}
                              onClick={() => void onDelete(card.id)}
                              className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </li>
                ))}
                {col.cards.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-offgrid-green/15 px-3 py-6 text-center text-xs text-offgrid-green/40">
                    Empty
                  </li>
                ) : null}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EditCardForm({
  card,
  onCancel,
  onSave,
}: {
  card: PlanCard;
  onCancel: () => void;
  onSave: (title: string, label: string, dueDate: string, notes: string) => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [label, setLabel] = useState(card.label);
  const [dueDate, setDueDate] = useState(card.dueDate ?? "");
  const [notes, setNotes] = useState(card.notes);

  return (
    <div className="space-y-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} placeholder="Label" />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} placeholder="Notes" />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(title, label, dueDate, notes)}
          className="rounded-lg bg-offgrid-green px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-offgrid-cream"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-offgrid-green/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-offgrid-green"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
