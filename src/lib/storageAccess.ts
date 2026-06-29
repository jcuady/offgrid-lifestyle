import { supabase } from "@/src/lib/supabase";

/** Extract object path from a Supabase public/signed storage URL, or return path if already relative. */
export function storagePathFromReference(reference: string, bucket: string): string | null {
  if (!reference) return null;
  if (!reference.includes("://")) {
    return reference.replace(/^\/+/, "");
  }

  const marker = `/storage/v1/object/`;
  const idx = reference.indexOf(marker);
  if (idx === -1) return null;

  const after = reference.slice(idx + marker.length);
  const parts = after.split("/");
  // public | sign | authenticated / bucket / path...
  if (parts.length < 3) return null;
  if (parts[0] === "public" || parts[0] === "sign" || parts[0] === "authenticated") {
    if (parts[1] !== bucket) return null;
    const rawPath = parts.slice(2).join("/");
    return rawPath.split("?")[0] || null;
  }
  return null;
}

/** Resolve a storage reference to a URL clients can load (signed when bucket is private). */
export async function resolveStorageUrl(
  bucket: string,
  reference: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!reference) return null;

  const path = storagePathFromReference(reference, bucket);
  if (!path) return reference;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return pub.publicUrl;
  }
  return data.signedUrl;
}

/** Upload path reference stored in DB: `bucket:relative/path` */
export function toStorageReference(bucket: string, path: string): string {
  return `${bucket}:${path}`;
}

export function parseStorageReference(reference: string): { bucket: string; path: string } | null {
  const colon = reference.indexOf(":");
  if (colon <= 0) return null;
  return {
    bucket: reference.slice(0, colon),
    path: reference.slice(colon + 1),
  };
}

export async function resolveStorageReference(
  reference: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!reference) return null;
  const parsed = parseStorageReference(reference);
  if (parsed) {
    return resolveStorageUrl(parsed.bucket, parsed.path, expiresIn);
  }
  return reference;
}
