/** Custom order file blobs — IndexedDB locally, Supabase Storage for admin access. */

import { logger } from "@/src/lib/logger";
import { supabase } from "@/src/lib/supabase";
import { resolveStorageReference, toStorageReference } from "@/src/lib/storageAccess";
import type { CustomOrderDesignFile, CustomOrderDraft } from "@/src/types/commerce";

const DB_NAME = "og-custom-order-files";
const STORE = "files";
const DB_VERSION = 1;
const STORAGE_BUCKET = "custom-order-files";

export const MAX_CUSTOM_DESIGN_FILES = 8;
export const PENDING_DESIGN_KEY = "pending:design";
export const PENDING_SHEET_KEY = "pending:sheet";

/** Unique pending IndexedDB key — never derive from list length (remove+re-add collision). */
export function pendingDesignKey(uniqueId?: string): string {
  const id =
    uniqueId?.trim() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `pending:design:${id}`;
}

export function orderFileKey(orderId: string, kind: "design" | "sheet"): string {
  return `order:${orderId}:${kind}`;
}

export function orderDesignFileKey(orderId: string, index: number): string {
  return index === 0 ? orderFileKey(orderId, "design") : `order:${orderId}:design:${index}`;
}

export function syncLegacyDesignFields(
  designFiles: CustomOrderDesignFile[],
): Pick<CustomOrderDraft, "designFileName" | "designFileKey" | "designFileUrl"> {
  const first = designFiles[0];
  return {
    designFileName: first?.name ?? null,
    designFileKey: first?.key ?? null,
    designFileUrl: first?.url ?? null,
  };
}

export function resolveDesignFilesFromDraft(
  draft: Pick<
    CustomOrderDraft,
    "designFiles" | "designFileName" | "designFileKey" | "designFileUrl"
  >,
): CustomOrderDesignFile[] {
  if (draft.designFiles?.length) {
    return draft.designFiles;
  }
  if (draft.designFileName && draft.designFileKey) {
    return [
      {
        name: draft.designFileName,
        key: draft.designFileKey,
        url: draft.designFileUrl ?? null,
      },
    ];
  }
  return [];
}

export function collectPendingDesignKeys(draft: CustomOrderDraft): string[] {
  return resolveDesignFilesFromDraft(draft)
    .map((f) => f.key)
    .filter(Boolean);
}

function normalizeDesignKeys(designKeys: string[] | string | null | undefined): string[] {
  if (designKeys == null) return [];
  if (typeof designKeys === "string") return designKeys ? [designKeys] : [];
  return designKeys.filter(Boolean);
}

interface StoredFile {
  name: string;
  type: string;
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("Failed to open file store"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function saveCustomOrderFile(key: string, file: File): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const payload: StoredFile = { name: file.name, type: file.type, blob: file };
    tx.objectStore(STORE).put(payload, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save file"));
  });
  db.close();
}

export async function getCustomOrderFile(key: string): Promise<File | null> {
  const db = await openDb();
  const stored = await new Promise<StoredFile | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as StoredFile | undefined);
    req.onerror = () => reject(req.error ?? new Error("Failed to read file"));
  });
  db.close();
  if (!stored) return null;
  return new File([stored.blob], stored.name, { type: stored.type });
}

export async function deleteCustomOrderFile(key: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to delete file"));
  });
  db.close();
}

async function uploadToStorage(orderId: string, kind: "design" | "sheet", file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${orderId}/${kind}-${Date.now()}-${safeName}`;
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return toStorageReference(STORAGE_BUCKET, data.path);
}

/** Copy pending draft uploads to permanent keys and mirror to Supabase Storage. */
export async function finalizeCustomOrderFiles(
  orderId: string,
  designKeys: string[] | string | null,
  sheetKey: string | null,
): Promise<{
  designFiles: CustomOrderDesignFile[];
  designFileKey: string | null;
  orderSheetFileKey: string | null;
  designFileUrl: string | null;
  orderSheetFileUrl: string | null;
  designFileName: string | null;
  warnings: string[];
}> {
  const pendingDesignKeys = normalizeDesignKeys(designKeys);
  const orderSheetFileKey = sheetKey ? orderFileKey(orderId, "sheet") : null;
  let orderSheetFileUrl: string | null = null;
  const warnings: string[] = [];
  const designFiles: CustomOrderDesignFile[] = [];

  for (let i = 0; i < pendingDesignKeys.length; i++) {
    const pendingKey = pendingDesignKeys[i];
    const permanentKey = orderDesignFileKey(orderId, i);
    const file = await getCustomOrderFile(pendingKey);
    if (!file) {
      warnings.push(`Design file ${i + 1} was not found in this browser.`);
      continue;
    }

    await saveCustomOrderFile(permanentKey, file);
    let url: string | null = null;
    try {
      url = await uploadToStorage(orderId, "design", file);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      warnings.push(`Design file "${file.name}" upload failed: ${message}`);
      logger.warn("Design file storage upload failed", {
        service: "customOrderFiles",
        operation: "uploadDesignFile",
        orderId,
        index: i,
        error: message,
      });
    }

    designFiles.push({ name: file.name, key: permanentKey, url });
    if (pendingKey.startsWith("pending:")) await deleteCustomOrderFile(pendingKey);
  }

  const legacy = syncLegacyDesignFields(designFiles);

  if (sheetKey && orderSheetFileKey) {
    const file = await getCustomOrderFile(sheetKey);
    if (file) {
      await saveCustomOrderFile(orderSheetFileKey, file);
      try {
        orderSheetFileUrl = await uploadToStorage(orderId, "sheet", file);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        warnings.push(`Order sheet upload failed: ${message}`);
        logger.warn("Order sheet storage upload failed", {
          service: "customOrderFiles",
          operation: "uploadOrderSheet",
          orderId,
          error: message,
        });
      }
    }
    if (sheetKey.startsWith("pending:")) await deleteCustomOrderFile(sheetKey);
  }

  return {
    designFiles,
    designFileKey: legacy.designFileKey,
    designFileName: legacy.designFileName,
    designFileUrl: legacy.designFileUrl,
    orderSheetFileKey,
    orderSheetFileUrl,
    warnings,
  };
}

export async function downloadCustomOrderFile(
  fileKey: string | null | undefined,
  fileUrl: string | null | undefined,
  fallbackName: string,
): Promise<void> {
  if (fileUrl) {
    const resolved = await resolveStorageReference(fileUrl);
    if (resolved) {
      const a = document.createElement("a");
      a.href = resolved;
      a.download = fallbackName;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.click();
      return;
    }
  }

  if (!fileKey) {
    window.alert("File not found.");
    return;
  }

  const file = await getCustomOrderFile(fileKey);
  if (!file) {
    window.alert("File not found. It may have been cleared from this browser.");
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name || fallbackName;
  a.click();
  URL.revokeObjectURL(url);
}

export function hasCustomOrderFile(fileKey: string | null | undefined, fileUrl?: string | null): boolean {
  return Boolean(fileUrl || fileKey);
}
