/** GCash QR storage path + public URL helpers (cache-bust so checkout sees fresh image). */

export function buildGcashQrStoragePath(fileName: string, now = Date.now()): string {
  const ext = (fileName.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  return `gcash-qr/${now}.${ext}`;
}

export function withCacheBust(publicUrl: string, now = Date.now()): string {
  const base = publicUrl.trim();
  if (!base) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${now}`;
}
