import type { ReactNode } from "react";
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
}: {
  value: string;
  onChange: (value: string) => void;
  alt?: string;
}) {
  return (
    <div className="space-y-2">
      <CmsTextInput value={value} onChange={onChange} placeholder="/images/example.png or https://..." />
      {value.trim() ? (
        <div className="overflow-hidden rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50">
          <img src={value} alt={alt} className="max-h-40 w-full object-cover object-center" />
        </div>
      ) : null}
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
          Layout is fixed on the live homepage — replace copy and image URLs only.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
