import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime/50 focus:ring-2 focus:ring-offgrid-lime/20";

/**
 * Multi-select chips with optional catalog CRUD (add / rename / delete).
 * Selection lives on the product; catalog is the manage-list of available labels.
 */
export function CatalogChipEditor({
  label,
  options,
  selected,
  onToggle,
  onAdd,
  onRename,
  onDelete,
  manageLabel = "Manage",
  addPlaceholder = "Add new…",
  error,
}: {
  label: string;
  options: readonly string[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  onAdd?: (value: string) => void | Promise<void>;
  onRename?: (from: string, to: string) => void | Promise<void>;
  onDelete?: (value: string) => void | Promise<void>;
  manageLabel?: string;
  addPlaceholder?: string;
  error?: string;
}) {
  const [managing, setManaging] = useState(false);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const run = async (fn: () => void | Promise<void>) => {
    setLocalError(null);
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
          {label}
        </span>
        {onAdd || onRename || onDelete ? (
          <button
            type="button"
            onClick={() => setManaging((v) => !v)}
            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-offgrid-green/55 hover:text-offgrid-green"
          >
            {managing ? "Done" : manageLabel}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((opt) => {
          const active = selected.some((s) => s.toLowerCase() === opt.toLowerCase());
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(opt)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-offgrid-lime bg-offgrid-lime text-white"
                  : "border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-lime/40",
              )}
            >
              {opt}
            </button>
          );
        })}
        {options.length === 0 ? (
          <span className="text-xs text-offgrid-green/45">No options yet — add one below.</span>
        ) : null}
      </div>

      {managing ? (
        <div className="space-y-3 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
          {onAdd ? (
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={addPlaceholder}
                maxLength={40}
                className={cn(inputClass, "flex-1")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = draft.trim();
                    if (!value) return;
                    void run(async () => {
                      await onAdd(value);
                      setDraft("");
                    });
                  }
                }}
              />
              <button
                type="button"
                disabled={busy || !draft.trim()}
                onClick={() =>
                  void run(async () => {
                    await onAdd(draft.trim());
                    setDraft("");
                  })
                }
                className="inline-flex items-center gap-1 rounded-xl bg-offgrid-green px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-cream disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          ) : null}

          <ul className="space-y-2">
            {options.map((opt) => (
              <li key={opt} className="flex items-center gap-2">
                {editing === opt ? (
                  <>
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      maxLength={40}
                      className={cn(inputClass, "flex-1")}
                      autoFocus
                    />
                    <button
                      type="button"
                      disabled={busy || !editValue.trim()}
                      onClick={() =>
                        void run(async () => {
                          if (onRename && editValue.trim() !== opt) {
                            await onRename(opt, editValue.trim());
                          }
                          setEditing(null);
                        })
                      }
                      className="rounded-lg bg-offgrid-green px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-offgrid-cream"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="rounded-lg border border-offgrid-green/20 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-offgrid-green"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-offgrid-green">{opt}</span>
                    {onRename ? (
                      <button
                        type="button"
                        aria-label={`Edit ${opt}`}
                        onClick={() => {
                          setEditing(opt);
                          setEditValue(opt);
                        }}
                        className="rounded-lg border border-offgrid-green/15 p-1.5 text-offgrid-green/60 hover:text-offgrid-green"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        aria-label={`Delete ${opt}`}
                        disabled={busy}
                        onClick={() => {
                          if (!window.confirm(`Delete "${opt}" from the catalog and all products?`)) return;
                          void run(async () => onDelete(opt));
                        }}
                        className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {localError || error ? (
        <p className="text-xs text-red-600" role="alert">
          {localError || error}
        </p>
      ) : null}
    </div>
  );
}
