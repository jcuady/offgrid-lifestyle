import { Download } from "lucide-react";
import { downloadCustomOrderFile, hasCustomOrderFile } from "@/src/lib/customOrderFiles";
import { cn } from "@/src/lib/utils";

interface CustomOrderFileButtonProps {
  fileKey: string | null | undefined;
  fileUrl?: string | null;
  fileName: string | null | undefined;
  label?: string;
  className?: string;
}

export function CustomOrderFileButton({
  fileKey,
  fileUrl,
  fileName,
  label,
  className,
}: CustomOrderFileButtonProps) {
  if (!fileName) {
    return <span className="text-sm text-offgrid-green/50">No file uploaded</span>;
  }

  if (!hasCustomOrderFile(fileKey, fileUrl)) {
    return (
      <span className="text-sm text-offgrid-green/70">
        {fileName}
        <span className="mt-0.5 block text-[10px] text-offgrid-green/45">Filename recorded — re-upload if download unavailable</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void downloadCustomOrderFile(fileKey, fileUrl, fileName)}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-offgrid-green/15 bg-white px-3 py-2 text-sm font-semibold text-offgrid-green transition-colors hover:border-offgrid-lime hover:text-offgrid-lime",
        className,
      )}
    >
      <Download className="h-4 w-4 shrink-0" />
      {label ?? fileName}
    </button>
  );
}
