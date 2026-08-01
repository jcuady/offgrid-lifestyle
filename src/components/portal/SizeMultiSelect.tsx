import { useState } from "react";
import { Plus } from "lucide-react";
import { SIZE_PRESETS, addCustomSize, isSizePreset, toggleSize } from "@/src/lib/productSizes";
import { cn } from "@/src/lib/utils";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime/50 focus:ring-2 focus:ring-offgrid-lime/20";

export function SizeMultiSelect({
  value,
  onChange,
  error,
}: {
  value: readonly string[];
  onChange: (sizes: string[]) => void;
  error?: string;
}) {
  const [custom, setCustom] = useState("");
  const customSelected = value.filter((s) => !isSizePreset(s));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Sizes">
        {SIZE_PRESETS.map((size) => {
          const active = value.includes(size);
          return (
            <button
              key={size}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(toggleSize(value, size))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-offgrid-lime bg-offgrid-lime text-white"
                  : "border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-lime/40",
              )}
            >
              {size}
            </button>
          );
        })}
        {customSelected.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed
            onClick={() => onChange(toggleSize(value, size))}
            className="rounded-full border border-offgrid-lime bg-offgrid-lime px-3 py-1.5 text-xs font-semibold text-white"
            title="Click to remove"
          >
            {size} ×
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Custom size (e.g. Youth-10)"
          className={cn(inputClass, "flex-1", error && "border-red-300")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!custom.trim()) return;
              onChange(addCustomSize(value, custom));
              setCustom("");
            }
          }}
        />
        <button
          type="button"
          disabled={!custom.trim()}
          onClick={() => {
            onChange(addCustomSize(value, custom));
            setCustom("");
          }}
          className="inline-flex items-center gap-1 rounded-xl border border-offgrid-green/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-green disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
