import { useMemo, useState } from "react";
import type { Product } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { formatPrice } from "@/src/data/products";
import { cn } from "@/src/lib/utils";

const defaultDraft: Product = {
  id: "",
  name: "",
  category: "Pickleball",
  price: 1100,
  image: "",
  colors: [
    { name: "Cream", value: "bg-offgrid-cream" },
    { name: "Forest Green", value: "bg-offgrid-green" },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  sizeRange: "XS - 2XL",
  cut: "Short Sleeve",
  description: "",
  material: "",
  fit: "",
  sold: 0,
  stock: 0,
};

export function AdminProductsPage() {
  const products = useSiteContentStore((state) => state.products);
  const addProduct = useSiteContentStore((state) => state.addProduct);
  const updateProduct = useSiteContentStore((state) => state.updateProduct);
  const removeProduct = useSiteContentStore((state) => state.removeProduct);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product>(defaultDraft);
  const [query, setQuery] = useState("");
  const sorted = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);
  const filtered = sorted.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const resetForm = () => {
    setEditingId(null);
    setDraft(defaultDraft);
  };

  const submit = () => {
    const normalized: Product = {
      ...draft,
      id: draft.id.trim() || `p-${crypto.randomUUID().slice(0, 8)}`,
      image: draft.image.trim() || "/images/product_polo.png",
      description: draft.description.trim() || "Premium OffGrid product.",
      material: draft.material.trim() || "Dri-fit blend",
      fit: draft.fit.trim() || "Regular fit",
      sizes: draft.sizes.length ? draft.sizes : ["M"],
      colors: draft.colors.length ? draft.colors : [{ name: "Green", value: "bg-offgrid-green" }],
    };

    if (editingId) {
      updateProduct(editingId, normalized);
    } else {
      addProduct(normalized);
    }
    resetForm();
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        Admin Catalog Control
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">Products CRUD</h1>
      <p className="mt-2 text-sm text-offgrid-green/60">
        Changes publish immediately to Shop and landing best-sellers.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <h2 className="text-lg font-display font-bold text-offgrid-green">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>
          <div className="mt-4 space-y-3">
            <input
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Product name"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <input
              value={draft.category}
              onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Category"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <input
              value={draft.image}
              onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="Image URL /images/..."
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft((prev) => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="Price"
                className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={draft.stock}
                onChange={(e) => setDraft((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                placeholder="Stock"
                className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              />
            </div>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <input
              value={draft.material}
              onChange={(e) => setDraft((prev) => ({ ...prev, material: e.target.value }))}
              placeholder="Material"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <input
              value={draft.fit}
              onChange={(e) => setDraft((prev) => ({ ...prev, fit: e.target.value }))}
              placeholder="Fit notes"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={submit}
              className="rounded-xl bg-offgrid-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream hover:bg-offgrid-dark"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-offgrid-green/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green hover:bg-offgrid-green/5"
            >
              Reset
            </button>
          </div>
        </aside>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-display font-bold text-offgrid-green">Live Catalog</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product..."
              className="w-full max-w-xs rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 space-y-3">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-offgrid-green/20 bg-offgrid-green/5 p-5 text-sm text-offgrid-green/60">
                No product matches your search.
              </div>
            )}
            {filtered.map((product) => (
              <article
                key={product.id}
                className={cn(
                  "rounded-xl border p-4",
                  editingId === product.id ? "border-offgrid-green" : "border-offgrid-green/10",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-offgrid-green/45">{product.category}</p>
                    <h3 className="text-xl font-display font-bold text-offgrid-green">{product.name}</h3>
                    <p className="text-sm text-offgrid-green/65">{formatPrice(product.price)} · Stock {product.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(product.id);
                        setDraft(product);
                      }}
                      className="rounded-lg border border-offgrid-green/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (editingId === product.id) resetForm();
                        if (window.confirm(`Delete ${product.name}? This updates live storefront data.`)) {
                          removeProduct(product.id);
                        }
                      }}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
