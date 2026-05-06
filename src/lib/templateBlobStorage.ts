const DB_NAME = "offgrid-template-blobs";
const STORE_NAME = "blobs";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function putTemplateBlob(templateId: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
    tx.oncomplete = () => resolve();
    tx.objectStore(STORE_NAME).put(blob, templateId);
  });
  db.close();
}

export async function getTemplateBlob(templateId: string): Promise<Blob | undefined> {
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB read failed"));
    const r = tx.objectStore(STORE_NAME).get(templateId);
    r.onerror = () => reject(r.error ?? new Error("IndexedDB get failed"));
    r.onsuccess = () => resolve(r.result as Blob | undefined);
  });
  db.close();
  return blob;
}

export async function deleteTemplateBlob(templateId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB delete failed"));
    tx.oncomplete = () => resolve();
    tx.objectStore(STORE_NAME).delete(templateId);
  });
  db.close();
}
