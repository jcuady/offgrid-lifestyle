import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Upload } from "lucide-react";
import type { CmsSectionTypography, CmsTextSize } from "@/src/data/landingContent";
import { uploadCmsImage } from "@/src/lib/cmsImageUpload";
import {
  CMS_TEXT_SIZE_OPTIONS,
  cmsTypographyStyle,
  sanitizeCmsColor,
} from "@/src/lib/cmsTypography";
import { cn } from "@/src/lib/utils";

interface CmsFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function CmsField({ label, hint, children, className }: CmsFieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/55">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-offgrid-green/45">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-green";

export function CmsTextInput({
  value,
  onChange,
  multiline,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={cn(inputClass, "resize-y min-h-[4.5rem]")}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

export function CmsImageInput({
  value,
  onChange,
  alt = "Preview",
  uploadSection = "landing",
}: {
  value: string;
  onChange: (value: string) => void;
  alt?: string;
  /** Storage folder segment for uploads (e.g. hero, collections-pickleball). */
  uploadSection?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const result = await uploadCmsImage(file, uploadSection);
      if (result.ok === false) {
        setUploadError(result.error);
        return;
      }
      onChange(result.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <CmsTextInput value={value} onChange={onChange} placeholder="/images/example.png or https://..." />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={onUpload}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-offgrid-green/20 bg-offgrid-cream/60 px-3 py-1.5 text-xs font-semibold text-offgrid-green transition-colors hover:border-offgrid-green/40 disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        {uploadError ? <span className="text-xs text-red-600">{uploadError}</span> : null}
      </div>
      {value.trim() ? (
        <div className="overflow-hidden rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50">
          <img src={value} alt={alt} className="max-h-40 w-full object-cover object-center" />
        </div>
      ) : null}
    </div>
  );
}

export function CmsTypographyControls({
  value,
  onChange,
}: {
  value: CmsSectionTypography;
  onChange: (patch: Partial<CmsSectionTypography>) => void;
}) {
  const headingPreview = cmsTypographyStyle(value, "heading");
  const bodyPreview = cmsTypographyStyle(value, "body");

  return (
    <div className="sm:col-span-2 space-y-3 rounded-xl border border-dashed border-offgrid-green/15 bg-offgrid-cream/30 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
        Typography (optional overrides)
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium text-offgrid-green/55">Heading color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={sanitizeCmsColor(value.headingColor) ?? "#1a3d2e"}
              onChange={(e) => onChange({ headingColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-offgrid-green/15 bg-white"
            />
            <input
              type="text"
              value={value.headingColor ?? ""}
              onChange={(e) => onChange({ headingColor: e.target.value })}
              placeholder="#1a3d2e"
              className={cn(inputClass, "flex-1")}
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium text-offgrid-green/55">Heading size</span>
          <select
            value={value.headingSize ?? ""}
            onChange={(e) => onChange({ headingSize: e.target.value as CmsTextSize })}
            className={inputClass}
          >
            {CMS_TEXT_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value || "default"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium text-offgrid-green/55">Body color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={sanitizeCmsColor(value.bodyColor) ?? "#1a3d2e"}
              onChange={(e) => onChange({ bodyColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-offgrid-green/15 bg-white"
            />
            <input
              type="text"
              value={value.bodyColor ?? ""}
              onChange={(e) => onChange({ bodyColor: e.target.value })}
              placeholder="#4a5568"
              className={cn(inputClass, "flex-1")}
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium text-offgrid-green/55">Body size</span>
          <select
            value={value.bodySize ?? ""}
            onChange={(e) => onChange({ bodySize: e.target.value as CmsTextSize })}
            className={inputClass}
          >
            {CMS_TEXT_SIZE_OPTIONS.map((opt) => (
              <option key={`body-${opt.value || "default"}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="rounded-lg border border-offgrid-green/10 bg-white px-3 py-2 text-sm">
        <p className="font-display font-bold" style={headingPreview}>
          Heading preview
        </p>
        <p className="mt-1" style={bodyPreview}>
          Body text preview for this section.
        </p>
      </div>
    </div>
  );
}

export function CmsSectionPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 border-b border-offgrid-green/8 pb-4">
        <h2 className="font-display text-xl font-bold text-offgrid-green">{title}</h2>
        {description ? <p className="mt-1 text-sm text-offgrid-green/55">{description}</p> : null}
        <p className="mt-2 text-[11px] text-offgrid-green/40">
          Layout is fixed on the live homepage — replace copy and images only.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
