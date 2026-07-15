import type { Product, SizeCode } from "@/src/data/products";

export const PRODUCT_TAG_PRESETS = ["Promo", "Sale", "Best Seller", "New", "Limited Edition"] as const;

export type ProductTagPreset = (typeof PRODUCT_TAG_PRESETS)[number];

export type ProductFieldErrors = Partial<
  Record<
    | "name"
    | "category"
    | "sports"
    | "slug"
    | "basePrice"
    | "price"
    | "stock"
    | "sold"
    | "image"
    | "description"
    | "tags"
    | "homeBestSellerRank"
    | "sizes"
    | "form",
    string
  >
>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALL_SIZES: SizeCode[] = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

export function slugifyProductName(name: string, fallback: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || fallback;
}

export function parseSizesInput(raw: string): SizeCode[] {
  if (!raw.trim()) return [];
  const tokens = raw
    .split(/[,/|]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return tokens.filter((t): t is SizeCode => ALL_SIZES.includes(t as SizeCode));
}

export function formatSizesInput(sizes: SizeCode[]): string {
  return sizes.join(", ");
}

export function parseLabelsInput(raw: string): string[] {
  return [...new Set(raw.split(",").map((value) => value.trim()).filter(Boolean))];
}

export function formatLabelsInput(values?: string[]): string {
  return values?.join(", ") ?? "";
}

function isValidImageRef(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("/")) return true;
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export interface ValidateProductOptions {
  draft: Product;
  products: Product[];
  editingId: string | null;
}

export function validateProductDraft({
  draft,
  products,
  editingId,
}: ValidateProductOptions): ProductFieldErrors {
  const errors: ProductFieldErrors = {};
  const name = draft.name.trim();
  const category = draft.category.trim();
  const sports = draft.sports ?? [];
  const slug = (draft.slug.trim() || slugifyProductName(name, "product")).toLowerCase();
  const basePrice = Number(draft.basePrice);
  const price = Number(draft.price);
  const stock = Number(draft.stock ?? 0);
  const sold = Number(draft.sold ?? 0);
  const status = draft.status ?? "draft";
  const image = draft.image.trim();
  const description = draft.description.trim();
  const tags = draft.tags ?? (draft.tag ? [draft.tag] : []);
  const rank = draft.homeBestSellerRank;

  if (!name) errors.name = "Product name is required.";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters.";

  if (!category) errors.category = "Category is required.";
  if (!sports.length) errors.sports = "Assign at least one sport.";
  else if (sports.some((sport) => sport.length > 40)) errors.sports = "Sport names must be 40 characters or fewer.";

  if (!slug) errors.slug = "URL slug is required.";
  else if (!SLUG_RE.test(slug)) errors.slug = "Use lowercase letters, numbers, and hyphens only.";

  const duplicateSlug = products.find((p) => p.slug === slug && p.id !== editingId);
  if (duplicateSlug) errors.slug = `Slug "${slug}" is already used by ${duplicateSlug.name}.`;

  if (!Number.isFinite(basePrice) || basePrice <= 0) errors.basePrice = "Regular price must be greater than zero.";
  if (!Number.isFinite(price) || price <= 0) errors.price = "Price must be greater than zero.";
  else if (Number.isFinite(basePrice) && price > basePrice) {
    errors.price = "Discount price cannot exceed the regular price.";
  }

  if (!Number.isFinite(stock) || stock < 0) errors.stock = "Stock cannot be negative.";
  if (!Number.isFinite(sold) || sold < 0) errors.sold = "Sold count cannot be negative.";

  if (status === "active") {
    if (!description || description.length < 12) {
      errors.description = "Active products need a description (at least 12 characters).";
    }
    if (!isValidImageRef(image)) {
      errors.image = "Active products need an image path (/images/...) or a valid URL.";
    }
  } else if (image && !isValidImageRef(image)) {
    errors.image = "Image must start with / or be a valid http(s) URL.";
  }

  if (tags.length > 8) errors.tags = "Use no more than 8 tags.";
  else if (tags.some((tag) => tag.length > 40)) errors.tags = "Tags must be 40 characters or fewer.";

  if (typeof rank === "number" && rank > 0) {
    if (!Number.isInteger(rank) || rank < 1 || rank > 20) {
      errors.homeBestSellerRank = "Rank must be an integer from 1 to 20, or leave at 0 to disable.";
    } else {
      const clash = products.find(
        (p) => p.id !== editingId && p.homeBestSellerRank === rank,
      );
      if (clash) {
        errors.homeBestSellerRank = `Rank #${rank} is already assigned to ${clash.name}.`;
      }
    }
  }

  if (!draft.sizes?.length) {
    errors.sizes = "Enter at least one valid size (e.g. XS, S, M, L, XL).";
  }

  const keys = Object.keys(errors);
  if (keys.length > 0 && !errors.form) {
    errors.form = "Fix the highlighted fields before saving.";
  }

  return errors;
}

export function normalizeProductDraft(draft: Product, editingId: string | null): Product {
  const now = new Date().toISOString();
  const newId = draft.id.trim() || `p-${crypto.randomUUID().slice(0, 8)}`;
  const slug = (draft.slug.trim() || slugifyProductName(draft.name, newId)).toLowerCase();
  const price = Number(draft.price) || 0;
  const basePrice = Number(draft.basePrice) || price;
  const sports = parseLabelsInput(formatLabelsInput(draft.sports));
  const tags = parseLabelsInput(formatLabelsInput(draft.tags ?? (draft.tag ? [draft.tag] : [])));

  return {
    ...draft,
    id: editingId ?? newId,
    slug,
    name: draft.name.trim(),
    category: draft.category.trim(),
    sports,
    basePrice,
    price,
    image: draft.image.trim() || "/images/product_polo.png",
    description: draft.description.trim() || "Premium OffGrid product.",
    shortDescription: draft.shortDescription?.trim() || undefined,
    material: draft.material.trim() || "Dri-fit blend",
    fit: draft.fit?.trim() || "Regular fit",
    sizes: draft.sizes.length ? draft.sizes : ["M"],
    sizeRange: draft.sizeRange || draft.sizes.join(" – "),
    colors: draft.colors.length ? draft.colors : [{ name: "Green", value: "bg-offgrid-green" }],
    cut: draft.cut || "short_sleeve",
    fabricType: draft.fabricType || "dri_fit",
    status: draft.status ?? "draft",
    tags,
    tag: tags[0] || undefined,
    sold: Math.max(0, Math.floor(Number(draft.sold) || 0)),
    stock: Math.max(0, Math.floor(Number(draft.stock) || 0)),
    homeBestSellerRank:
      typeof draft.homeBestSellerRank === "number" && draft.homeBestSellerRank > 0
        ? Math.min(20, Math.floor(draft.homeBestSellerRank))
        : undefined,
    createdAt: editingId ? draft.createdAt : now,
    updatedAt: now,
  };
}
