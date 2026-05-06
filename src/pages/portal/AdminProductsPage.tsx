import { useMemo, useState } from "react";
import type { FabricType, GarmentCut, Product } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { formatPrice } from "@/src/data/products";
import { localCatalogService } from "@/src/services";
import { cn } from "@/src/lib/utils";

function slugify(name: string, fallback: string) {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || fallback;
}

const defaultDraft = (): Product => {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: "",
    name: "",
    category: "Pickleball",
    basePrice: 1100,
    price: 1100,
    image: "",
    colors: [
      { name: "Cream", value: "bg-offgrid-cream" },
      { name: "Forest Green", value: "bg-offgrid-green" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    sizeRange: "XS – 2XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    description: "",
    material: "",
    fit: "",
    sold: 0,
    stock: 0,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
};

export function AdminProductsPage() {
  const products = useSiteContentStore((state) => state.products);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product>(() => defaultDraft());
  const [query, setQuery] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const sorted = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);
  const filtered = sorted.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const resetForm = () => {
    setEditingId(null);
    setDraft(defaultDraft());
    setFormError(null);
  };

  const submit = () => {
    setFormError(null);
    if (!draft.name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    const newId = draft.id.trim() || `p-${crypto.randomUUID().slice(0, 8)}`;
    const slug = draft.slug.trim() || slugify(draft.name, newId);
    const price = Number(draft.price) || Number(draft.basePrice) || 0;
    const basePrice = Number(draft.basePrice) || price;
    const now = new Date().toISOString();

    if (price <= 0) {
      setFormError("Price must be greater than zero.");
      return;
    }
    const duplicateSlug = products.find(
      (entry) => entry.slug === slug && (!editingId || entry.id !== editingId),
    );
    if (duplicateSlug) {
      setFormError("Slug must be unique. Please choose another.");
      return;
    }

    const normalized: Product = {
      ...draft,
      id: newId,
      slug,
      basePrice,
      price,
      image: draft.image.trim() || "/images/product_polo.png",
      description: draft.description.trim() || "Premium OffGrid product.",
      material: draft.material.trim() || "Dri-fit blend",
      fit: draft.fit?.trim() || "Regular fit",
      sizes: draft.sizes.length ? draft.sizes : ["M"],
      colors: draft.colors.length ? draft.colors : [{ name: "Green", value: "bg-offgrid-green" }],
      cut: draft.cut || "short_sleeve",
      fabricType: draft.fabricType || "dri_fit",
      status: draft.status ?? "draft",
      createdAt: editingId ? draft.createdAt : now,
      updatedAt: now,
    };

    if (editingId) {
      localCatalogService.updateProduct(editingId, normalized);
    } else {
      localCatalogService.addProduct(normalized);
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
              value={draft.slug}
              onChange={(e) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="URL slug (e.g. og-golf)"
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={draft.cut}
                onChange={(e) => setDraft((prev) => ({ ...prev, cut: e.target.value as GarmentCut }))}
                className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              >
                <option value="short_sleeve">Short sleeve</option>
                <option value="long_sleeve">Long sleeve</option>
                <option value="sleeveless">Sleeveless</option>
                <option value="polo">Polo</option>
                <option value="tank">Tank</option>
                <option value="shorts">Shorts</option>
                <option value="cap">Cap</option>
              </select>
              <select
                value={draft.fabricType}
                onChange={(e) => setDraft((prev) => ({ ...prev, fabricType: e.target.value as FabricType }))}
                className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              >
                <option value="dri_fit">Dri-fit</option>
                <option value="cotton">Cotton</option>
                <option value="running_mesh">Running mesh</option>
                <option value="poly_blend">Poly blend</option>
                <option value="nylon_spandex">Nylon / spandex</option>
              </select>
            </div>
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as Product["status"],
                }))
              }
              className="w-full rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
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
                onChange={(e) =>
                  setDraft((prev) => {
                    const n = Number(e.target.value);
                    return { ...prev, price: n, basePrice: n };
                  })
                }
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
          {formError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {formError}
            </p>
          )}
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
                          localCatalogService.removeProduct(product.id);
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
