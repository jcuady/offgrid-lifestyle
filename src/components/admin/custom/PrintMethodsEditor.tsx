import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { CmsField, CmsSectionPanel, CmsTextInput } from "@/src/components/admin/landing/CmsField";
import {
  MATERIAL_OPTIONS,
  slugifyPrintMethodId,
  type PrintMethodOption,
} from "@/src/data/customOptions";
import { deletePrintMethod, upsertPrintMethod } from "@/src/services/printMethodService";
import { usePrintMethodStore } from "@/src/store/usePrintMethodStore";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import type { FabricType } from "@/src/types/commerce";

const LOCKED_ID = "sublimation";

function sortMethods(list: PrintMethodOption[]): PrintMethodOption[] {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function PrintMethodsEditor() {
  const methods = usePrintMethodStore((s) => s.methods);
  const status = usePrintMethodStore((s) => s.status);
  const load = usePrintMethodStore((s) => s.load);
  const setMethods = usePrintMethodStore((s) => s.setMethods);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PrintMethodOption | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Admin RLS returns drafts too, so always refetch here.
  useEffect(() => {
    void load(true);
  }, [load]);

  useEffect(() => {
    if (isNew || draft || status === "idle" || status === "loading") return;
    const first = methods[0];
    if (first) {
      setSelectedId(first.id);
      setDraft({ ...first });
    }
  }, [methods, draft, isNew, status]);

  const saved = methods.find((m) => m.id === selectedId);
  const dirty = isNew || (draft && saved ? JSON.stringify(draft) !== JSON.stringify(saved) : false);

  const select = (method: PrintMethodOption) => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setIsNew(false);
    setSelectedId(method.id);
    setDraft({ ...method, fabricIds: [...method.fabricIds] });
    setError(null);
    setNotice(null);
  };

  const patch = (next: Partial<PrintMethodOption>) => {
    setDraft((d) => (d ? { ...d, ...next } : d));
    setNotice(null);
  };

  const toggleFabric = (id: FabricType) => {
    if (!draft) return;
    const fabricIds = draft.fabricIds.includes(id)
      ? draft.fabricIds.filter((f) => f !== id)
      : [...draft.fabricIds, id];
    patch({ fabricIds });
  };

  const handleAdd = () => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setIsNew(true);
    setSelectedId(null);
    setDraft({
      id: "",
      label: "",
      description: "",
      priceModifier: 1,
      fabricIds: [],
      sortOrder: (methods[methods.length - 1]?.sortOrder ?? 0) + 10,
      isPublished: false,
    });
    setError(null);
    setNotice(null);
  };

  const handleSave = async () => {
    if (!draft) return;
    const id = isNew ? slugifyPrintMethodId(draft.label) : draft.id;
    if (!id) {
      setError("Add a display label first — the ID is created from it.");
      return;
    }
    if (isNew && methods.some((m) => m.id === id)) {
      setError(`A print method with the ID "${id}" already exists. Use a different label.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await upsertPrintMethod({ ...draft, id });
      setMethods(sortMethods([...methods.filter((m) => m.id !== result.id), result]));
      setIsNew(false);
      setSelectedId(result.id);
      setDraft({ ...result });
      setNotice(`Saved "${result.label}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save print method.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!draft || isNew || draft.id === LOCKED_ID) return;
    if (!window.confirm(`Delete "${draft.label}"? Existing orders keep their stored print method.`)) return;
    setBusy(true);
    setError(null);
    try {
      await deletePrintMethod(draft.id);
      const remaining = methods.filter((m) => m.id !== draft.id);
      setMethods(remaining);
      const first = remaining[0];
      setSelectedId(first?.id ?? null);
      setDraft(first ? { ...first } : null);
      setNotice(`Deleted "${draft.label}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete print method.");
    } finally {
      setBusy(false);
    }
  };

  const previewId = draft ? (isNew ? slugifyPrintMethodId(draft.label) : draft.id) : "";

  return (
    <CmsSectionPanel
      title="Print methods & fabrics"
      description="Step 2 of the custom order wizard. Customers pick a print method first, then only the fabrics you tick here. Changes save to the live database."
    >
      <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
        {status === "loading" && methods.length === 0 ? (
          <Loader2 className="h-4 w-4 animate-spin text-offgrid-green/50" aria-label="Loading print methods" />
        ) : null}
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => select(m)}
            aria-pressed={!isNew && selectedId === m.id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              !isNew && selectedId === m.id
                ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                : "border-offgrid-green/20 text-offgrid-green/70 hover:border-offgrid-green/40",
              !m.isPublished && "opacity-60",
            )}
          >
            {m.label}
            {!m.isPublished ? " (draft)" : null}
          </button>
        ))}
        {isNew ? (
          <span className="rounded-full border border-dashed border-offgrid-green bg-offgrid-green/5 px-3 py-1.5 text-xs font-semibold text-offgrid-green">
            {draft?.label.trim() || "New method"} (unsaved)
          </span>
        ) : null}
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleAdd} disabled={busy}>
          <Plus className="h-3.5 w-3.5" />
          Add print method
        </Button>
      </div>

      {status === "error" ? (
        <p className="sm:col-span-2 text-xs text-red-700" role="alert">
          Could not load print methods from the database. Showing built-in defaults; saving may fail until the
          connection is back.
        </p>
      ) : null}

      {draft ? (
        <>
          <CmsField label="Display label">
            <CmsTextInput value={draft.label} onChange={(v) => patch({ label: v })} placeholder="e.g. Puff Print" />
          </CmsField>
          <CmsField label="ID (slug)" hint={isNew ? "Created from the label when you save." : "Stored on orders; cannot change."}>
            <input
              readOnly
              value={previewId}
              className="w-full rounded-xl border border-offgrid-green/15 bg-offgrid-cream/40 px-3 py-2.5 font-mono text-xs text-offgrid-green/70"
            />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={draft.description} onChange={(v) => patch({ description: v })} multiline rows={2} />
          </CmsField>

          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/55">
              Available fabrics
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {MATERIAL_OPTIONS.map((fabric) => {
                const checked = draft.fabricIds.includes(fabric.id);
                return (
                  <label
                    key={fabric.id}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors",
                      checked
                        ? "border-offgrid-green bg-offgrid-green/5 text-offgrid-green"
                        : "border-offgrid-green/15 text-offgrid-green/70 hover:border-offgrid-green/35",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFabric(fabric.id)}
                      className="h-4 w-4 rounded border-offgrid-green/30 accent-offgrid-green"
                    />
                    <span className="font-semibold">{fabric.label}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-1 text-[11px] text-offgrid-green/45">
              Apparel customers only see this method once at least one fabric is ticked.
            </p>
          </fieldset>

          <CmsField label="Price modifier" hint="1 = base price, 1.15 = +15%.">
            <input
              type="number"
              step="0.05"
              min="0.05"
              max="10"
              value={draft.priceModifier}
              onChange={(e) => {
                const n = Number.parseFloat(e.target.value);
                if (!Number.isNaN(n)) patch({ priceModifier: n });
              }}
              className="w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-green"
            />
          </CmsField>
          <CmsField label="Sort order" hint="Lower numbers show first.">
            <input
              type="number"
              step="10"
              value={draft.sortOrder}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                if (!Number.isNaN(n)) patch({ sortOrder: n });
              }}
              className="w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-green"
            />
          </CmsField>
          <label className="sm:col-span-2 flex cursor-pointer items-center gap-2 text-sm text-offgrid-green">
            <input
              type="checkbox"
              checked={draft.isPublished}
              onChange={(e) => patch({ isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-offgrid-green/30 accent-offgrid-green"
            />
            Show this print method in the custom order wizard
          </label>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-2 border-t border-offgrid-green/8 pt-4">
            <Button type="button" size="sm" className="gap-2" onClick={() => void handleSave()} disabled={busy || !dirty}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isNew ? "Create print method" : "Save changes"}
            </Button>
            {!isNew ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-red-700"
                onClick={() => void handleDelete()}
                disabled={busy || draft.id === LOCKED_ID}
                title={draft.id === LOCKED_ID ? "Towel orders need sublimation, so it can't be deleted." : undefined}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            ) : null}
            {draft.id === LOCKED_ID ? (
              <span className="text-[11px] text-offgrid-green/50">Required for towel orders — edit only.</span>
            ) : null}
            {error ? (
              <p className="w-full text-xs font-medium text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="w-full text-xs font-medium text-offgrid-green" role="status">
                {notice}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </CmsSectionPanel>
  );
}
