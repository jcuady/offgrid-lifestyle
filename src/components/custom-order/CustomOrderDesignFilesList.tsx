import { CustomOrderFileButton } from "@/src/components/custom-order/CustomOrderFileButton";
import { resolveDesignFilesFromDraft } from "@/src/lib/customOrderFiles";
import type { CustomOrderDesignFile } from "@/src/types/commerce";

interface CustomOrderDesignFilesListProps {
  designFiles?: CustomOrderDesignFile[];
  designFileName?: string | null;
  designFileKey?: string | null;
  designFileUrl?: string | null;
  emptyLabel?: string;
}

export function CustomOrderDesignFilesList({
  designFiles,
  designFileName,
  designFileKey,
  designFileUrl,
  emptyLabel = "No file uploaded",
}: CustomOrderDesignFilesListProps) {
  const files = resolveDesignFilesFromDraft({
    designFiles,
    designFileName: designFileName ?? null,
    designFileKey: designFileKey ?? null,
    designFileUrl: designFileUrl ?? null,
  });

  if (files.length === 0) {
    return <span className="text-sm text-offgrid-green/50">{emptyLabel}</span>;
  }

  if (files.length === 1) {
    return (
      <CustomOrderFileButton
        fileKey={files[0].key}
        fileUrl={files[0].url}
        fileName={files[0].name}
      />
    );
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.key}>
          <CustomOrderFileButton fileKey={file.key} fileUrl={file.url} fileName={file.name} />
        </li>
      ))}
    </ul>
  );
}
