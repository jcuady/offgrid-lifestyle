import { useId } from "react";
import type { CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import { LOGO_SHORT_WHITE } from "@/src/lib/brandAssets";
import { cn } from "@/src/lib/utils";

export type TemplateArtKind =
  | "tee"
  | "longsleeve"
  | "hoodie"
  | "singlet"
  | "shorts"
  | "banner"
  | "cap"
  | "bucket"
  | "towel"
  | "sheet";

/** Picks the garment drawing from the slot id/name so admin-added templates get a sensible flat too. */
export function templateArtKind(template: Pick<CustomTemplateAsset, "id" | "name" | "category">): TemplateArtKind {
  const text = `${template.id} ${template.name}`.toLowerCase();
  if (/hood/.test(text)) return "hoodie";
  if (/long[\s-]?sleeve/.test(text)) return "longsleeve";
  if (/singlet|tank|sleeveless/.test(text)) return "singlet";
  if (/banner|tarp/.test(text)) return "banner";
  if (/\bshorts\b/.test(text)) return "shorts";
  if (/bucket/.test(text)) return "bucket";
  if (/\b(cap|visor|hat)\b/.test(text)) return "cap";
  if (/towel/.test(text)) return "towel";
  if (/shirt|jersey|tee|polo|neck/.test(text)) return "tee";
  switch (template.category) {
    case "jerseys":
      return "tee";
    case "shorts":
      return "shorts";
    case "headwear":
      return "cap";
    case "towels":
      return "towel";
    default:
      return "sheet";
  }
}

const TEE = "M160 60 Q200 88 240 60 L285 72 L330 112 L305 138 L285 122 L285 250 L115 250 L115 122 L95 138 L70 112 L115 72 Z";
const LONG = "M160 60 Q200 88 240 60 L285 72 L345 210 L320 218 L285 130 L285 250 L115 250 L115 130 L80 218 L55 210 L115 72 Z";

/** Front flats on a 400×300 artboard. `details` are seams/trims drawn inside the garment. */
const ART: Record<TemplateArtKind, { outline: string; details: string }> = {
  tee: {
    outline: TEE,
    details: "M166 63 Q200 100 234 63 M115 240 L285 240",
  },
  longsleeve: {
    outline: LONG,
    details: "M166 63 Q200 100 234 63 M341 200 L317 208 M59 200 L83 208 M115 240 L285 240",
  },
  hoodie: {
    outline: `${LONG} M160 60 C150 14 250 14 240 60 Q200 88 160 60 Z`,
    details: "M145 190 L255 190 L265 236 L135 236 Z M190 76 L187 112 M210 76 L213 112 M341 200 L317 208 M59 200 L83 208",
  },
  singlet: {
    outline: "M145 55 L165 55 Q200 95 235 55 L255 55 Q262 115 290 125 L290 250 L110 250 L110 125 Q138 115 145 55 Z",
    details: "M171 57 Q200 104 229 57 M110 240 L290 240",
  },
  shorts: {
    outline: "M120 60 L280 60 L300 235 L215 245 L200 140 L185 245 L100 235 Z",
    details: "M122 80 L282 80 M195 68 L190 96 M205 68 L210 96",
  },
  banner: {
    outline: "M50 95 H350 V205 H50 Z",
    details:
      "M56 107 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M336 107 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M56 193 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M336 193 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0",
  },
  cap: {
    outline:
      "M110 195 C105 110 265 95 285 195 Z M280 195 C320 193 355 203 368 216 C335 214 300 211 280 209 Z",
    details:
      "M184 124 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M188 128 C196 155 200 175 200 195 M150 138 C150 160 148 180 146 195 M284 200 C318 199 345 206 358 213",
  },
  bucket: {
    outline:
      "M140 168 C138 100 262 100 260 168 Z M85 188 C105 158 295 158 315 188 C292 208 108 208 85 188 Z",
    details: "M141 160 C170 166 230 166 259 160 M102 188 C125 172 275 172 298 188",
  },
  towel: {
    outline: "M95 55 H305 V245 H95 Z",
    details: "M107 67 H293 V233 H107 Z M192 55 Q200 38 208 55",
  },
  sheet: {
    outline: "M125 45 H255 L285 75 V255 H125 Z",
    details: "M255 45 V75 H285",
  },
};

export function TemplateThumbnail({
  template,
  className,
}: {
  template: Pick<CustomTemplateAsset, "id" | "name" | "category">;
  className?: string;
}) {
  const clipId = `tpl-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const art = ART[templateArtKind(template)];

  return (
    <div
      role="img"
      aria-label={`${template.name} layout preview`}
      className={cn("relative h-full w-full overflow-hidden bg-offgrid-dark", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 85% 0%, rgba(0,10,255,0.28), transparent 55%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 24px 24px, 24px 24px",
        }}
        aria-hidden
      />

      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 h-full w-full p-[9%] pb-[13%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        aria-hidden
        focusable="false"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={art.outline} />
          </clipPath>
        </defs>
        <path d={art.outline} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={12} strokeLinejoin="round" />
        <path d={art.outline} fill="#fff" />
        <path d={art.details} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth={1.5} strokeLinecap="round" />
        <path
          d={art.outline}
          clipPath={`url(#${clipId})`}
          fill="none"
          stroke="#000AFF"
          strokeWidth={6}
          strokeDasharray="7 5"
          strokeLinejoin="round"
          className="motion-safe:group-hover:animate-seam-march"
        />
      </svg>

      <img
        src={LOGO_SHORT_WHITE}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute left-4 top-4 h-5 w-auto opacity-90"
      />

      <div
        className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-3 rounded-full bg-white px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-offgrid-green"
        aria-hidden
      >
        <span className="flex items-center gap-1.5">
          <span className="block h-px w-4 bg-offgrid-green" />
          Edge
        </span>
        <span className="flex items-center gap-1.5">
          <span className="block w-4 border-t-2 border-dashed border-offgrid-lime" />
          Seam
        </span>
      </div>
    </div>
  );
}
