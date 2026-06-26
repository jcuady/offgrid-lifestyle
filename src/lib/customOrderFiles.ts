/** Local file blobs for custom orders (IndexedDB). Production: Supabase Storage. */

const DB_NAME = "og-custom-order-files";
const STORE = "files";
const DB_VERSION = 1;

export const PENDING_DESIGN_KEY = "pending:design";
export const PENDING_SHEET_KEY = "pending:sheet";

export function orderFileKey(orderId: string, kind: "design" | "sheet"): string {
  return `order:${orderId}:${kind}`;
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

/** Copy pending draft uploads to permanent order keys. */
export async function finalizeCustomOrderFiles(
  orderId: string,
  designKey: string | null,
  sheetKey: string | null,
): Promise<{ designFileKey: string | null; orderSheetFileKey: string | null }> {
  const designFileKey = designKey ? orderFileKey(orderId, "design") : null;
  const orderSheetFileKey = sheetKey ? orderFileKey(orderId, "sheet") : null;

  if (designKey && designFileKey) {
    const file = await getCustomOrderFile(designKey);
    if (file) await saveCustomOrderFile(designFileKey, file);
    if (designKey.startsWith("pending:")) await deleteCustomOrderFile(designKey);
  }

  if (sheetKey && orderSheetFileKey) {
    const file = await getCustomOrderFile(sheetKey);
    if (file) await saveCustomOrderFile(orderSheetFileKey, file);
    if (sheetKey.startsWith("pending:")) await deleteCustomOrderFile(sheetKey);
  }

  return { designFileKey, orderSheetFileKey };
}

export async function downloadCustomOrderFile(key: string, fallbackName: string): Promise<void> {
  const file = await getCustomOrderFile(key);
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

export function hasCustomOrderFile(key: string | null | undefined): boolean {
  return Boolean(key);
}
