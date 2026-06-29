import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Package, Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import type { FabricType, GarmentCut, Product, SizeCode } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { formatPrice } from "@/src/data/products";
import { localCatalogService } from "@/src/services";
import {
  formatSizesInput,
  normalizeProductDraft,
  parseSizesInput,
  PRODUCT_TAG_PRESETS,
  slugifyProductName,
  validateProductDraft,
  type ProductFieldErrors,
} from "@/src/lib/productValidation";
import { cn } from "@/src/lib/utils";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";

const STATUS_BADGE: Record<NonNullable<Product["status"]>, string> = {
  active: "bg-offgrid-lime/20 text-offgrid-green",
  draft: "bg-offgrid-green/10 text-offgrid-green/70",
  archived: "bg-offgrid-dark/10 text-offgrid-green/50",
};

const inputClass =
  "w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime/50 focus:ring-2 focus:ring-offgrid-lime/20";

const inputErrorClass = "border-red-300 focus:border-red-400 focus:ring-red-100";

function defaultDraft(): Product {
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
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
        {label}
      </span>
      {children}
      {hint && !error ? <span className="block text-[11px] text-offgrid-green/45">{hint}</span> : null}
      {error ? <span className="block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function AdminProductsPage() {
  const products = useSiteContentStore((state) => state.products);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product>(() => defaultDraft());
  const [sizesInput, setSizesInput] = useState(() => formatSizesInput(defaultDraft().sizes));
  const [customTagMode, setCustomTagMode] = useState(false);
  const [query, setQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const slugTouched = useRef(false);

  useEffect(() => {
    localCatalogService.listProducts().then((fetched) => {
      useSiteContentStore.setState({ products: fetched });
    });
  }, []);

  const categoryOptions = useMemo(() => {
    const fromCatalog = products.map((p) => p.category.trim()).filter(Boolean);
    return [...new Set([...fromCatalog, "Pickleball", "Golf", "Running", "Lifestyle / OG Vibe"])].sort();
  }, [products]);

  const sorted = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);
  const filtered = sorted.filter((product) =>
    `${product.name} ${product.category} ${product.tag ?? ""}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const resetForm = () => {
    const next = defaultDraft();
    setDraft(next);
    setSizesInput(formatSizesInput(next.sizes));
    setCustomTagMode(false);
    setFieldErrors({});
    slugTouched.current = false;
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    resetForm();
  };

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setDrawerOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft(product);
    setSizesInput(formatSizesInput(product.sizes));
    setCustomTagMode(
      Boolean(product.tag && !PRODUCT_TAG_PRESETS.includes(product.tag as (typeof PRODUCT_TAG_PRESETS)[number])),
    );
    setFieldErrors({});
    slugTouched.current = true;
    setDrawerOpen(true);
  };

  const setName = (name: string) => {
    setDraft((prev) => {
      const next = { ...prev, name };
      if (!slugTouched.current) {
        next.slug = slugifyProductName(name, prev.id || "product");
      }
      return next;
    });
  };

  const applyTagPreset = (tag: string) => {
    setCustomTagMode(false);
    setDraft((prev) => {
      const next: Product = { ...prev, tag };
      if (tag === "Best Seller" && !prev.homeBestSellerRank) {
        next.homeBestSellerRank = 1;
      }
      return next;
    });
    setFieldErrors((prev) => ({ ...prev, tag: undefined, homeBestSellerRank: undefined }));
  };

  const clearTag = () => {
    setCustomTagMode(false);
    setDraft((prev) => ({ ...prev, tag: undefined }));
  };

  const submit = async () => {
    const sizes = parseSizesInput(sizesInput);
    const withSizes = { ...draft, sizes };
    const errors = validateProductDraft({ draft: withSizes, products, editingId });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const normalized = normalizeProductDraft(withSizes, editingId);
    setIsSaving(true);
    try {
      if (editingId) {
        await localCatalogService.updateProduct(editingId, normalized);
      } else {
        await localCatalogService.addProduct(normalized);
      }
    } finally {
      setIsSaving(false);
    }
    closeDrawer();
  };

  const removeProduct = (product: Product) => {
    if (window.confirm(`Delete ${product.name}? This updates live storefront data.`)) {
      localCatalogService.removeProduct(product.id);
      if (editingId === product.id) closeDrawer();
    }
  };

  const activeTag = draft.tag?.trim() ?? "";
  const tagIsPreset = PRODUCT_TAG_PRESETS.includes(activeTag as (typeof PRODUCT_TAG_PRESETS)[number]);

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <PortalPageHeader
        eyebrow="Admin Catalog Control"
        title="Products"
        description="Full catalog CRUD — changes publish immediately to Shop, tags, and Crowd Favorites."
        actions={
          <button
            type="button"
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
            className={cn(inputClass, "!pl-9")}
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
                {product.tag ? (
                  <span className="absolute bottom-3 left-3 rounded-full bg-offgrid-lime px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                    {product.tag}
                  </span>
                ) : null}
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
                  {formatPrice(product.price)} <span className="text-offgrid-green/35">·</span> Stock {product.stock ?? 0}
                </p>
                <div className="mt-4 flex gap-2 border-t border-offgrid-green/10 pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-offgrid-green/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-green transition-colors hover:bg-offgrid-green/5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
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
              type="button"
              onClick={submit}
              disabled={isSaving}
              className="rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-offgrid-dark disabled:opacity-60"
            >
              {isSaving ? "Saving…" : editingId ? "Update product" : "Create product"}
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-xl border border-offgrid-green/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green transition-colors hover:bg-offgrid-green/5"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {fieldErrors.form ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {fieldErrors.form}
            </p>
          ) : null}

          <Field label="Product name" error={fieldErrors.name}>
            <input
              value={draft.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OG Pickle Club Tee"
              className={cn(inputClass, fieldErrors.name && inputErrorClass)}
            />
          </Field>

          <Field label="Category" error={fieldErrors.category}>
            <input
              list="product-categories"
              value={draft.category}
              onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Pickleball, Golf, Running…"
              className={cn(inputClass, fieldErrors.category && inputErrorClass)}
            />
            <datalist id="product-categories">
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </Field>

          <Field
            label="URL slug"
            hint="Used in /shop/product/your-slug. Auto-generated from name until you edit it."
            error={fieldErrors.slug}
          >
            <input
              value={draft.slug}
              onChange={(e) => {
                slugTouched.current = true;
                setDraft((prev) => ({ ...prev, slug: e.target.value }));
              }}
              placeholder="og-pickle-club"
              className={cn(inputClass, fieldErrors.slug && inputErrorClass)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cut">
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
            </Field>
            <Field label="Fabric">
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
            </Field>
          </div>

          <Field label="Status">
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
              <option value="draft">Draft — hidden from shop</option>
              <option value="active">Active — live on storefront</option>
              <option value="archived">Archived — hidden, kept for records</option>
            </select>
          </Field>

          <Field
            label="Storefront tag"
            hint="Shows on product cards and powers shop tag filters."
            error={fieldErrors.tag}
          >
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TAG_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyTagPreset(preset)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    activeTag === preset && !customTagMode
                      ? "border-offgrid-lime bg-offgrid-lime text-white"
                      : "border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-lime/40",
                  )}
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustomTagMode(true);
                  if (tagIsPreset) setDraft((prev) => ({ ...prev, tag: "" }));
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  customTagMode
                    ? "border-offgrid-lime bg-offgrid-lime text-white"
                    : "border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-lime/40",
                )}
              >
                Custom
              </button>
              {activeTag ? (
                <button
                  type="button"
                  onClick={clearTag}
                  className="rounded-full border border-offgrid-green/15 px-3 py-1.5 text-xs text-offgrid-green/55 hover:text-offgrid-green"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {customTagMode ? (
              <input
                value={draft.tag ?? ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, tag: e.target.value }))}
                placeholder="e.g. Team Bundle, Pre-order"
                className={cn("mt-2", inputClass, fieldErrors.tag && inputErrorClass)}
              />
            ) : activeTag && !tagIsPreset ? (
              <p className="mt-2 text-xs text-offgrid-green/60">Current: {activeTag}</p>
            ) : null}
          </Field>

          <Field
            label="Crowd favorites rank"
            hint="1 = first on homepage Crowd Favorites. 0 = off."
            error={fieldErrors.homeBestSellerRank}
          >
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
              className={cn(inputClass, fieldErrors.homeBestSellerRank && inputErrorClass)}
            />
          </Field>

          <Field label="Image" error={fieldErrors.image}>
            <input
              value={draft.image}
              onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="/images/product-og-golf.png"
              className={cn(inputClass, fieldErrors.image && inputErrorClass)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (PHP)" error={fieldErrors.price}>
              <input
                type="number"
                min={1}
                value={draft.price}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setDraft((prev) => ({ ...prev, price: n, basePrice: n }));
                }}
                className={cn(inputClass, fieldErrors.price && inputErrorClass)}
              />
            </Field>
            <Field label="Stock" error={fieldErrors.stock}>
              <input
                type="number"
                min={0}
                value={draft.stock ?? 0}
                onChange={(e) => setDraft((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                className={cn(inputClass, fieldErrors.stock && inputErrorClass)}
              />
            </Field>
          </div>

          <Field label="Units sold" hint="Displayed on product cards." error={fieldErrors.sold}>
            <input
              type="number"
              min={0}
              value={draft.sold}
              onChange={(e) => setDraft((prev) => ({ ...prev, sold: Number(e.target.value) }))}
              className={cn(inputClass, fieldErrors.sold && inputErrorClass)}
            />
          </Field>

          <Field
            label="Sizes"
            hint="Comma-separated: XS, S, M, L, XL"
            error={fieldErrors.sizes}
          >
            <input
              value={sizesInput}
              onChange={(e) => setSizesInput(e.target.value)}
              placeholder="XS, S, M, L, XL, 2XL"
              className={cn(inputClass, fieldErrors.sizes && inputErrorClass)}
            />
          </Field>

          <Field label="Description" error={fieldErrors.description}>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Product story and details for the storefront."
              className={cn(inputClass, "resize-y", fieldErrors.description && inputErrorClass)}
            />
          </Field>

          <Field label="Short description" hint="Optional — used in compact views.">
            <input
              value={draft.shortDescription ?? ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="One-line summary"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Material">
              <input
                value={draft.material}
                onChange={(e) => setDraft((prev) => ({ ...prev, material: e.target.value }))}
                placeholder="Dri-fit blend"
                className={inputClass}
              />
            </Field>
            <Field label="Fit notes">
              <input
                value={draft.fit ?? ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, fit: e.target.value }))}
                placeholder="Regular fit"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </PortalDrawer>
    </div>
  );
}
