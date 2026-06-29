import type { Product } from "@/src/data/products";
import type { Database } from "@/src/types/database";
import { logger } from "@/src/lib/logger";
import { supabase } from "@/src/lib/supabase";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { usePortalStore } from "@/src/store/usePortalStore";

type ProductRow = Database["public"]["Tables"]["og_products"]["Row"];

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    category: row.category as string,
    collectionIds: (row.collection_ids as string[]) ?? [],
    basePrice: Number(row.base_price),
    price: Number(row.price),
    image: row.image as string,
    gallery: (row.gallery as string[]) ?? [],
    colors: (row.colors as unknown as Product["colors"]) ?? [],
    sizes: (row.sizes as Product["sizes"]) ?? [],
    sizeRange: (row.size_range as string) ?? undefined,
    description: row.description as string,
    shortDescription: (row.short_description as string) ?? undefined,
    material: row.material as string,
    fabricType: row.fabric_type as Product["fabricType"],
    cut: row.cut as Product["cut"],
    fit: (row.fit as string) ?? undefined,
    variants: (row.variants as unknown as Product["variants"]) ?? [],
    sold: row.sold as number,
    stock: (row.stock as number) ?? undefined,
    tag: (row.tag as string) ?? undefined,
    homeBestSellerRank: (row.home_best_seller_rank as number) ?? undefined,
    status: row.status as Product["status"],
    metaTitle: (row.meta_title as string) ?? undefined,
    metaDescription: (row.meta_description as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

type ProductInsert = Database["public"]["Tables"]["og_products"]["Insert"];

function auditProduct(action: "product.created" | "product.updated" | "product.deleted", product: Product | { id: string }, fields: string[] = []) {
  const actor = usePortalStore.getState().currentUser;
  if (!actor) return;

  usePortalStore.getState().recordAudit({
    action,
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    targetType: "product",
    targetId: product.id,
    summary:
      action === "product.created"
        ? `Created product ${"name" in product ? product.name : product.id}`
        : action === "product.updated"
          ? `Updated product ${"name" in product ? product.name : product.id}`
          : `Deleted product ${"name" in product ? product.name : product.id}`,
    metadata: { productId: product.id, fields },
  });
}

function productToRow(p: Product): ProductInsert {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    collection_ids: p.collectionIds ?? [],
    base_price: p.basePrice,
    price: p.price,
    image: p.image,
    gallery: p.gallery ?? [],
    colors: (p.colors ?? []) as unknown as ProductInsert["colors"],
    sizes: p.sizes,
    size_range: p.sizeRange ?? null,
    description: p.description,
    short_description: p.shortDescription ?? null,
    material: p.material,
    fabric_type: p.fabricType,
    cut: p.cut,
    fit: p.fit ?? null,
    variants: (p.variants ?? []) as unknown as ProductInsert["variants"],
    sold: p.sold,
    stock: p.stock ?? null,
    tag: p.tag ?? null,
    home_best_seller_rank: p.homeBestSellerRank ?? 0,
    status: p.status,
    meta_title: p.metaTitle ?? null,
    meta_description: p.metaDescription ?? null,
  };
}

export interface CatalogService {
  listProducts: () => Promise<Product[]>;
  addProduct: (input: Product) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

export const supabaseCatalogService: CatalogService = {
  listProducts: async () => {
    const { data, error } = await supabase
      .from("og_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Could not load products: ${error.message}`);
    }
    const products = (data ?? []).map(rowToProduct);
    if (products.length > 0) {
      useSiteContentStore.setState({ products });
    }
    return products.length > 0 ? products : useSiteContentStore.getState().products;
  },

  addProduct: async (input) => {
    const { error } = await supabase.from("og_products").insert(productToRow(input));
    if (error) {
      throw new Error(`Could not add product: ${error.message}`);
    }
    useSiteContentStore.getState().addProduct(input);
    auditProduct("product.created", input, Object.keys(productToRow(input)));
  },

  updateProduct: async (id, patch) => {
    type ProductUpdate = Database["public"]["Tables"]["og_products"]["Update"];
    const partial: ProductUpdate = {};
    if (patch.name !== undefined) partial.name = patch.name;
    if (patch.slug !== undefined) partial.slug = patch.slug;
    if (patch.category !== undefined) partial.category = patch.category;
    if (patch.basePrice !== undefined) partial.base_price = patch.basePrice;
    if (patch.price !== undefined) partial.price = patch.price;
    if (patch.image !== undefined) partial.image = patch.image;
    if (patch.description !== undefined) partial.description = patch.description;
    if (patch.material !== undefined) partial.material = patch.material;
    if (patch.fabricType !== undefined) partial.fabric_type = patch.fabricType;
    if (patch.cut !== undefined) partial.cut = patch.cut;
    if (patch.sizes !== undefined) partial.sizes = patch.sizes;
    if (patch.colors !== undefined) partial.colors = patch.colors as unknown as ProductUpdate["colors"];
    if (patch.sold !== undefined) partial.sold = patch.sold;
    if (patch.stock !== undefined) partial.stock = patch.stock;
    if (patch.tag !== undefined) partial.tag = patch.tag;
    if (patch.status !== undefined) partial.status = patch.status;
    if (patch.homeBestSellerRank !== undefined) partial.home_best_seller_rank = patch.homeBestSellerRank;

    if (Object.keys(partial).length > 0) {
      const { error } = await supabase.from("og_products").update(partial).eq("id", id);
      if (error) {
        throw new Error(`Could not update product: ${error.message}`);
      }
    }
    useSiteContentStore.getState().updateProduct(id, patch);
    const updated = useSiteContentStore.getState().products.find((product) => product.id === id);
    auditProduct("product.updated", updated ?? { id }, Object.keys(patch));
  },

  removeProduct: async (id) => {
    const existing = useSiteContentStore.getState().products.find((product) => product.id === id);
    const { error } = await supabase.from("og_products").delete().eq("id", id);
    if (error) {
      throw new Error(`Could not delete product: ${error.message}`);
    }
    useSiteContentStore.getState().removeProduct(id);
    auditProduct("product.deleted", existing ?? { id });
  },
};

export async function hydrateProductsFromSupabase(): Promise<void> {
  try {
    await supabaseCatalogService.listProducts();
  } catch (err) {
    logger.warn("Product hydration failed", {
      operation: "catalog.hydrateProducts",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
