import { useRef, useState, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { uploadProductImage } from "@/src/lib/cmsImageUpload";
import { fileAcceptAttribute, fileRuleHint } from "@/src/lib/fileValidation";
import { cn } from "@/src/lib/utils";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime/50 focus:ring-2 focus:ring-offgrid-lime/20";

export function ProductImageField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (url: string) => void;
  error?: string;
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
      const result = await uploadProductImage(file);
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
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={fileAcceptAttribute("productImage")}
          className="sr-only"
          onChange={(e) => void onUpload(e)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-offgrid-green/20 bg-offgrid-cream/60 px-3 py-1.5 text-xs font-semibold text-offgrid-green transition-colors hover:border-offgrid-green/40 disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Uploading…" : "Upload JPG / PNG"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 rounded-lg border border-offgrid-green/15 px-2.5 py-1.5 text-xs text-offgrid-green/60 hover:text-offgrid-green"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
        <span className="text-[11px] text-offgrid-green/45">{fileRuleHint("productImage")}</span>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/product.png or uploaded URL"
        className={cn(inputClass, error && "border-red-300 focus:border-red-400 focus:ring-red-100")}
      />
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
      {value.trim() ? (
        <div className="overflow-hidden rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50">
          <img src={value} alt="Product preview" className="max-h-40 w-full object-cover object-center" />
        </div>
      ) : null}
    </div>
  );
}
