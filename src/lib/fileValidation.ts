/** Shared upload rules for custom orders, templates, and admin image assets. */

export type FileUploadKind = "customDesign" | "customOrderSheet" | "templateAsset" | "imageAsset";

interface FileRule {
  label: string;
  maxBytes: number;
  extensions: readonly string[];
  /** Used when MIME is present; extension match is the primary gate for design/sheet files. */
  mimePrefixes: readonly string[];
}

const RULES: Record<FileUploadKind, FileRule> = {
  customDesign: {
    label: "design file",
    maxBytes: 25 * 1024 * 1024,
    extensions: [".ai", ".pdf", ".svg", ".png", ".jpg", ".jpeg", ".eps", ".zip"],
    mimePrefixes: ["image/", "application/pdf", "application/postscript", "application/zip", "application/x-zip"],
  },
  customOrderSheet: {
    label: "order sheet",
    maxBytes: 10 * 1024 * 1024,
    extensions: [".xlsx", ".xls", ".csv"],
    mimePrefixes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
    ],
  },
  templateAsset: {
    label: "template file",
    maxBytes: 25 * 1024 * 1024,
    extensions: [".ai", ".pdf", ".svg", ".jpg", ".jpeg", ".png", ".eps", ".zip"],
    mimePrefixes: ["image/", "application/pdf", "application/postscript", "application/zip", "application/x-zip"],
  },
  imageAsset: {
    label: "image",
    maxBytes: 5 * 1024 * 1024,
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    mimePrefixes: ["image/"],
  },
};

export function fileAcceptAttribute(kind: FileUploadKind): string {
  return RULES[kind].extensions.join(",");
}

export function fileRuleHint(kind: FileUploadKind): string {
  const rule = RULES[kind];
  const exts = rule.extensions.map((e) => e.replace(/^\./, "").toUpperCase()).join(", ");
  return `${exts} · max ${formatBytes(rule.maxBytes)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

function mimeAllowed(mime: string, rule: FileRule): boolean {
  if (!mime) return true;
  return rule.mimePrefixes.some((prefix) => mime.startsWith(prefix));
}

export type FileValidationResult = { ok: true } | { ok: false; error: string };

export function validateUploadedFile(file: File, kind: FileUploadKind): FileValidationResult {
  const rule = RULES[kind];
  const ext = extensionOf(file.name);

  if (!ext || !rule.extensions.includes(ext)) {
    return {
      ok: false,
      error: `Invalid ${rule.label}. Accepted: ${rule.extensions.join(", ")}.`,
    };
  }

  if (file.size > rule.maxBytes) {
    return {
      ok: false,
      error: `File is too large (max ${formatBytes(rule.maxBytes)}). Your file is ${formatBytes(file.size)}.`,
    };
  }

  if (file.size === 0) {
    return { ok: false, error: "File is empty. Choose a different file." };
  }

  // Image assets need a real image MIME; design/sheet files are gated by extension (browsers mislabel .ai, .xlsx, etc.).
  if (kind === "imageAsset" && !mimeAllowed(file.type, rule)) {
    return {
      ok: false,
      error: `File type does not match ${ext}. Please upload a valid ${rule.label}.`,
    };
  }

  return { ok: true };
}
