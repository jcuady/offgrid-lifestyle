import { useRef, useState, type ChangeEvent } from "react";
import { GripVertical, Star, Upload, X } from "lucide-react";
import { uploadProductImage } from "@/src/lib/cmsImageUpload";
import { fileAcceptAttribute, fileRuleHint } from "@/src/lib/fileValidation";
import {
  imagesFromProduct,
  moveGalleryIndex,
  PRODUCT_GALLERY_MAX,
  productMediaFromImages,
} from "@/src/lib/productGallery";
import { cn } from "@/src/lib/utils";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime/50 focus:ring-2 focus:ring-offgrid-lime/20";

export function ProductImageField({
  image,
  gallery,
  onChange,
  error,
}: {
  image: string;
  gallery?: string[];
  onChange: (next: { image: string; gallery: string[] }) => void;
  error?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const urls = imagesFromProduct(image, gallery);

  const emit = (nextUrls: string[]) => onChange(productMediaFromImages(nextUrls));

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const room = PRODUCT_GALLERY_MAX - urls.length;
    if (room <= 0) {
      setUploadError(`Maximum ${PRODUCT_GALLERY_MAX} images.`);
      return;
    }

    setUploadError(null);
    setUploading(true);
    const next = [...urls];
    try {
      for (const file of files.slice(0, room)) {
        const result = await uploadProductImage(file);
        if (result.ok === false) {
          setUploadError(result.error);
          break;
        }
        next.push(result.publicUrl);
      }
      emit(next);
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
          multiple
          className="sr-only"
          onChange={(e) => void onUpload(e)}
        />
        <button
          type="button"
          disabled={uploading || urls.length >= PRODUCT_GALLERY_MAX}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-offgrid-green/20 bg-offgrid-cream/60 px-3 py-1.5 text-xs font-semibold text-offgrid-green transition-colors hover:border-offgrid-green/40 disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Uploading…" : "Upload images"}
        </button>
        <span className="text-[11px] text-offgrid-green/45">
          {urls.length}/{PRODUCT_GALLERY_MAX} · {fileRuleHint("productImage")} · first = cover
        </span>
      </div>

      {urls.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {urls.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50"
            >
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-offgrid-dark/70 px-1.5 py-1">
                <button
                  type="button"
                  title="Move earlier"
                  disabled={index === 0}
                  onClick={() => emit(moveGalleryIndex(urls, index, index - 1))}
                  className="rounded p-0.5 text-offgrid-cream/80 hover:text-white disabled:opacity-30"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Set as cover"
                  onClick={() => emit(moveGalleryIndex(urls, index, 0))}
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded px-1 text-[10px] font-semibold",
                    index === 0 ? "text-offgrid-lime" : "text-offgrid-cream/80 hover:text-white",
                  )}
                >
                  <Star className="h-3 w-3" />
                  {index === 0 ? "Cover" : "Cover"}
                </button>
                <button
                  type="button"
                  title="Remove"
                  onClick={() => emit(urls.filter((_, i) => i !== index))}
                  className="rounded p-0.5 text-offgrid-cream/80 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        value={image}
        onChange={(e) => onChange(productMediaFromImages([e.target.value, ...(gallery ?? [])]))}
        placeholder="Cover URL (or upload above)"
        className={cn(inputClass, error && "border-red-300 focus:border-red-400 focus:ring-red-100")}
      />
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
