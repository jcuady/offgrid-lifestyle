import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { CmsField, CmsSectionPanel, CmsTextInput } from "@/src/components/admin/landing/CmsField";
import {
  type CustomHeadwearOption,
  type HeadwearOptionGroup,
  resolveHeadwearOptions,
} from "@/src/data/customHeadwearOptions";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";

const GROUP_LABELS: Record<HeadwearOptionGroup, string> = {
  headwear: "Headwear",
  towel: "Towel",
};

export function HeadwearOptionsEditor() {
  const raw = useSiteContentStore((s) => s.customHeadwearOptions);
  const options = resolveHeadwearOptions(raw);
  const addOption = useSiteContentStore((s) => s.addHeadwearOption);
  const updateOption = useSiteContentStore((s) => s.updateHeadwearOption);
  const removeOption = useSiteContentStore((s) => s.removeHeadwearOption);
  const resetOptions = useSiteContentStore((s) => s.resetHeadwearOptions);

  const [selectedId, setSelectedId] = useState(options[0]?.id ?? "");
  const selected = options.find((o) => o.id === selectedId) ?? options[0];

  const patchSelected = (patch: Partial<Omit<CustomHeadwearOption, "id">>) => {
    if (!selected) return;
    updateOption(selected.id, patch);
  };

  const handleAdd = () => {
    const label = "New option";
    const group: HeadwearOptionGroup = "headwear";
    addOption({
      id: "",
      label,
      description: "Describe this headwear or towel type for customers.",
      group,
      priceModifier: 1,
      orderSheetProductType: "headwear",
      sortOrder: (options[options.length - 1]?.sortOrder ?? 0) + 10,
      isPublished: false,
    });
    const updated = resolveHeadwearOptions(useSiteContentStore.getState().customHeadwearOptions);
    const added = updated[updated.length - 1];
    if (added) setSelectedId(added.id);
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`Delete "${selected.label}"? Existing orders keep the stored id.`)) return;
    const remaining = options.filter((o) => o.id !== selected.id);
    removeOption(selected.id);
    setSelectedId(remaining[0]?.id ?? "");
  };

  const handleReset = () => {
    if (!window.confirm("Reset all headwear and towel types to factory defaults?")) return;
    resetOptions();
    const first = resolveHeadwearOptions(useSiteContentStore.getState().customHeadwearOptions)[0];
    setSelectedId(first?.id ?? "");
  };

  return (
    <CmsSectionPanel
      title="Headwear & towel types"
      description="Options shown in the custom order wizard (Step 1). Customers pick headwear or towels, then a specific type."
    >
      <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
        {(["headwear", "towel"] as const).map((group) => (
          <div key={group} className="flex flex-wrap gap-2">
            <span className="self-center font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
              {GROUP_LABELS[group]}
            </span>
            {options
              .filter((o) => o.group === group)
              .map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedId(opt.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    selected?.id === opt.id
                      ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                      : "border-offgrid-green/20 text-offgrid-green/70 hover:border-offgrid-green/40",
                    !opt.isPublished && "opacity-60",
                  )}
                >
                  {opt.label}
                  {!opt.isPublished ? " (draft)" : null}
                </button>
              ))}
          </div>
        ))}
      </div>

      <div className="sm:col-span-2 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add type
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset defaults
        </Button>
      </div>

      {selected ? (
        <>
          <CmsField label="ID (slug)" className="sm:col-span-2">
            <input
              readOnly
              value={selected.id}
              className="w-full rounded-lg border border-offgrid-green/15 bg-offgrid-cream/40 px-3 py-2 font-mono text-xs text-offgrid-green/70"
            />
          </CmsField>
          <CmsField label="Display label">
            <CmsTextInput value={selected.label} onChange={(v) => patchSelected({ label: v })} />
          </CmsField>
          <CmsField label="Group">
            <select
              value={selected.group}
              onChange={(e) => {
                const group = e.target.value as HeadwearOptionGroup;
                patchSelected({
                  group,
                  orderSheetProductType:
                    group === "towel" ? "face_towel" : selected.orderSheetProductType || "headwear",
                });
              }}
              className="w-full rounded-lg border border-offgrid-green/20 bg-white px-3 py-2 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/20"
            >
              <option value="headwear">Headwear</option>
              <option value="towel">Towel</option>
            </select>
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput
              value={selected.description}
              onChange={(v) => patchSelected({ description: v })}
              multiline
              rows={2}
            />
          </CmsField>
          <CmsField label="Price modifier">
            <CmsTextInput
              value={String(selected.priceModifier)}
              onChange={(v) => {
                const n = Number.parseFloat(v);
                if (!Number.isNaN(n) && n > 0) patchSelected({ priceModifier: n });
              }}
            />
          </CmsField>
          <CmsField label="Sort order">
            <CmsTextInput
              value={String(selected.sortOrder)}
              onChange={(v) => {
                const n = Number.parseInt(v, 10);
                if (!Number.isNaN(n)) patchSelected({ sortOrder: n });
              }}
            />
          </CmsField>
          <CmsField label="Order kit default product_type" className="sm:col-span-2">
            <CmsTextInput
              value={selected.orderSheetProductType}
              onChange={(v) => patchSelected({ orderSheetProductType: v })}
            />
          </CmsField>
          <CmsField label="Published in wizard">
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-offgrid-green">
              <input
                type="checkbox"
                checked={selected.isPublished}
                onChange={(e) => patchSelected({ isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-offgrid-green/30"
              />
              Show this type when customers place a custom order
            </label>
          </CmsField>
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" size="sm" className="gap-2 text-red-700" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete type
            </Button>
          </div>
        </>
      ) : null}
    </CmsSectionPanel>
  );
}
