import type { Product } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export interface CatalogService {
  listProducts: () => Product[];
  addProduct: (input: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

export const localCatalogService: CatalogService = {
  listProducts: () => useSiteContentStore.getState().products,
  addProduct: (input) => useSiteContentStore.getState().addProduct(input),
  updateProduct: (id, patch) => useSiteContentStore.getState().updateProduct(id, patch),
  removeProduct: (id) => useSiteContentStore.getState().removeProduct(id),
};
