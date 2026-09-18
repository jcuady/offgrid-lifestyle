/** Cover + gallery mapping for product media (index 0 = cover / `image`). */

export const PRODUCT_GALLERY_MAX = 8;

export function imagesFromProduct(image: string, gallery?: string[] | null): string[] {
  const cover = (image ?? "").trim();
  const rest = (gallery ?? []).map((u) => u.trim()).filter(Boolean);
  const out: string[] = [];
  if (cover) out.push(cover);
  for (const url of rest) {
    if (!out.some((existing) => existing === url)) out.push(url);
  }
  return out.slice(0, PRODUCT_GALLERY_MAX);
}

export function productMediaFromImages(urls: string[]): { image: string; gallery: string[] } {
  const cleaned = urls.map((u) => u.trim()).filter(Boolean).slice(0, PRODUCT_GALLERY_MAX);
  return {
    image: cleaned[0] ?? "",
    gallery: cleaned.slice(1),
  };
}

export function moveGalleryIndex(urls: string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= urls.length || to >= urls.length) return urls;
  const next = [...urls];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
