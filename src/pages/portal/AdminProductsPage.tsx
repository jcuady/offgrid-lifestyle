import { useMemo, useState } from "react";
import { Package, Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import type { FabricType, GarmentCut, Product } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { formatPrice } from "@/src/data/products";
import { localCatalogService } from "@/src/services";
import { cn } from "@/src/lib/utils";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";

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

const STATUS_BADGE: Record<NonNullable<Product["status"]>, string> = {
  active: "bg-offgrid-lime/20 text-offgrid-green",
  draft: "bg-offgrid-green/10 text-offgrid-green/70",
  archived: "bg-offgrid-dark/10 text-offgrid-green/50",
};

const inputClass = "w-full px-3 py-2 text-sm";

export function AdminProductsPage() {
  const products = useSiteContentStore((state) => state.products);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product>(() => defaultDraft());
  const [query, setQuery] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sorted = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);
  const filtered = sorted.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setDraft(defaultDraft());
    setFormError(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(defaultDraft());
    setFormError(null);
    setDrawerOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft(product);
    setFormError(null);
    setDrawerOpen(true);
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
      homeBestSellerRank:
        typeof draft.homeBestSellerRank === "number" && draft.homeBestSellerRank > 0
          ? Math.min(20, Math.floor(draft.homeBestSellerRank))
          : undefined,
      createdAt: editingId ? draft.createdAt : now,
      updatedAt: now,
    };

    if (editingId) {
      localCatalogService.updateProduct(editingId, normalized);
    } else {
      localCatalogService.addProduct(normalized);
    }
    closeDrawer();
  };

  const removeProduct = (product: Product) => {
    if (window.confirm(`Delete ${product.name}? This updates live storefront data.`)) {
      localCatalogService.removeProduct(product.id);
      if (editingId === product.id) closeDrawer();
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <PortalPageHeader
        eyebrow="Admin Catalog Control"
        title="Products"
        description="Changes publish immediately to Shop and landing best-sellers."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        }
      />

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full !pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <p className="hidden shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-offgrid-green/45 sm:block">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white/60 p-12 text-center">
          <Package className="mx-auto h-8 w-8 text-offgrid-green/30" />
          <p className="mt-3 text-sm text-offgrid-green/60">
            {products.length === 0 ? "No products yet. Add your first one." : "No product matches your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-offgrid-lime/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-offgrid-cream">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-offgrid-green/25">
                    <Package className="h-8 w-8" />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] backdrop-blur",
                    STATUS_BADGE[product.status ?? "draft"],
                  )}
                >
                  {product.status ?? "draft"}
                </span>
                {product.homeBestSellerRank ? (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-offgrid-green/90 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-offgrid-cream">
                    <Star className="h-3 w-3 fill-offgrid-lime text-offgrid-lime" />#{product.homeBestSellerRank}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-offgrid-green/45">
                  {product.category}
                </p>
                <h3 className="mt-1 line-clamp-1 font-display text-base font-bold text-offgrid-green">{product.name}</h3>
                <p className="mt-1 text-sm text-offgrid-green/65">
                  {formatPrice(product.price)} <span className="text-offgrid-green/35">·</span> Stock {product.stock}
                </p>
                <div className="mt-4 flex gap-2 border-t border-offgrid-green/10 pt-3">
                  <button
                    onClick={() => openEdit(product)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-offgrid-green/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-green transition-colors hover:bg-offgrid-green/5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => removeProduct(product)}
                    aria-label={`Delete ${product.name}`}
                    className="inline-flex items-center justify-center rounded-lg border border-red-300 px-3 py-2 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <PortalDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingId ? "Edit product" : "Add product"}
        description="Publishes immediately to the live storefront."
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={submit}
              className="rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
            >
              {editingId ? "Update product" : "Create product"}
            </button>
            <button
              onClick={closeDrawer}
              className="rounded-xl border border-offgrid-green/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green transition-colors hover:bg-offgrid-green/5"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>
          )}
          <input
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Product name"
            className={inputClass}
          />
          <input
            value={draft.category}
            onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="Category"
            className={inputClass}
          />
          <input
            value={draft.slug}
            onChange={(e) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="URL slug (e.g. og-golf)"
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={draft.cut}
              onChange={(e) => setDraft((prev) => ({ ...prev, cut: e.target.value as GarmentCut }))}
              className={inputClass}
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
              className={inputClass}
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
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <div>
            <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/50">
              Crowd Favorites rank (0 = off)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={draft.homeBestSellerRank ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                setDraft((prev) => ({
                  ...prev,
                  homeBestSellerRank:
                    raw === "" ? undefined : Math.max(0, Math.min(20, Math.floor(Number(raw)) || 0)),
                }));
              }}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <input
            value={draft.image}
            onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
            placeholder="Image URL /images/..."
            className={inputClass}
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
              className={inputClass}
            />
            <input
              type="number"
              value={draft.stock}
              onChange={(e) => setDraft((prev) => ({ ...prev, stock: Number(e.target.value) }))}
              placeholder="Stock"
              className={inputClass}
            />
          </div>
          <textarea
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className={inputClass}
          />
          <input
            value={draft.material}
            onChange={(e) => setDraft((prev) => ({ ...prev, material: e.target.value }))}
            placeholder="Material"
            className={inputClass}
          />
          <input
            value={draft.fit}
            onChange={(e) => setDraft((prev) => ({ ...prev, fit: e.target.value }))}
            placeholder="Fit notes"
            className={inputClass}
          />
        </div>
      </PortalDrawer>
    </div>
  );
}
