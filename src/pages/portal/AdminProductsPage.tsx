import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Package, Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import {
  compareSports,
  getProductSports,
  getProductTags,
  type FabricType,
  type GarmentCut,
  type Product,
} from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { formatPrice } from "@/src/data/products";
import { localCatalogService } from "@/src/services";
import {
  addCatalogTerm,
  deleteCatalogTerm,
  listCatalogTerms,
  renameCatalogTerm,
} from "@/src/services/catalogTermsService";
import {
  normalizeProductDraft,
  PRODUCT_TAG_PRESETS,
  slugifyProductName,
  validateProductDraft,
  type ProductFieldErrors,
} from "@/src/lib/productValidation";
import {
  filterAdminProducts,
  type AdminProductFilters,
  type AdminStockFilter,
  type AdminStatusFilter,
} from "@/src/lib/adminProductFilters";
import {
  mergeCatalogLabels,
  normalizeCatalogLabel,
  removeLabelFromList,
  renameLabelInList,
} from "@/src/lib/catalogTaxonomy";
import { normalizeSizes } from "@/src/lib/productSizes";
import { clampPage } from "@/src/lib/portalPagination";
import { cn } from "@/src/lib/utils";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";
import { PortalPagination } from "@/src/components/portal/PortalPagination";
import { CatalogChipEditor } from "@/src/components/portal/CatalogChipEditor";
import { ProductImageField } from "@/src/components/portal/ProductImageField";
import { SizeMultiSelect } from "@/src/components/portal/SizeMultiSelect";

const PAGE_SIZE = 24;

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
    sports: ["Pickleball"],
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
    tags: [],
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

function toggleLabel(list: readonly string[], value: string): string[] {
  const normalized = normalizeCatalogLabel(value);
  if (!normalized) return [...list];
  const exists = list.some((item) => item.toLowerCase() === normalized.toLowerCase());
  return exists
    ? list.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
    : mergeCatalogLabels(list, [normalized]);
}

export function AdminProductsPage() {
  const products = useSiteContentStore((state) => state.products);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product>(() => defaultDraft());
  const [filters, setFilters] = useState<AdminProductFilters>({
    query: "",
    status: "all",
    sport: "all",
    tag: "all",
    stock: "all",
  });
  const [page, setPage] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sportCatalog, setSportCatalog] = useState<string[]>([]);
  const [tagCatalog, setTagCatalog] = useState<string[]>([]);
  const slugTouched = useRef(false);

  const refreshTerms = useCallback(async () => {
    try {
      const [sports, tags] = await Promise.all([listCatalogTerms("sport"), listCatalogTerms("tag")]);
      const fromProductsSports = products.flatMap((p) => getProductSports(p));
      const fromProductsTags = products.flatMap((p) => getProductTags(p));
      setSportCatalog(
        mergeCatalogLabels(
          sports.map((t) => t.label),
          fromProductsSports,
          ["Ultimate Frisbee", "Pickleball", "Golf", "Running", "Lifestyle"],
        ).sort(compareSports),
      );
      setTagCatalog(
        mergeCatalogLabels(
          tags.map((t) => t.label),
          fromProductsTags,
          PRODUCT_TAG_PRESETS,
        ),
      );
    } catch {
      setSportCatalog(
        mergeCatalogLabels(
          products.flatMap((p) => getProductSports(p)),
          ["Ultimate Frisbee", "Pickleball", "Golf", "Running", "Lifestyle"],
        ).sort(compareSports),
      );
      setTagCatalog(mergeCatalogLabels(products.flatMap((p) => getProductTags(p)), PRODUCT_TAG_PRESETS));
    }
  }, [products]);

  useEffect(() => {
    localCatalogService.listProducts().then((fetched) => {
      useSiteContentStore.setState({ products: fetched });
    });
  }, []);

  useEffect(() => {
    void refreshTerms();
  }, [refreshTerms]);

  const categoryOptions = useMemo(() => {
    const fromCatalog = products.map((p) => p.category.trim()).filter(Boolean);
    return mergeCatalogLabels(fromCatalog, sportCatalog, [
      "Ultimate Frisbee",
      "Pickleball",
      "Golf",
      "Running",
      "Lifestyle / OG Vibe",
      "Solar Collection",
      "Primal Collection",
    ]).sort();
  }, [products, sportCatalog]);

  const filtered = useMemo(() => filterAdminProducts(products, filters), [products, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = clampPage(page, pageCount);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const resetForm = () => {
    setDraft(defaultDraft());
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
    setDraft({
      ...product,
      sizes: normalizeSizes(product.sizes ?? []),
      tags: getProductTags(product),
      sports: getProductSports(product),
    });
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

  const submit = async () => {
    const withSizes = {
      ...draft,
      sizes: normalizeSizes(draft.sizes),
      sports: mergeCatalogLabels(draft.sports),
      tags: mergeCatalogLabels(draft.tags ?? (draft.tag ? [draft.tag] : [])),
      tag: mergeCatalogLabels(draft.tags ?? (draft.tag ? [draft.tag] : []))[0],
      category: draft.category.trim() || (draft.sports?.[0] ?? ""),
    };
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
      // Ensure newly used labels exist in the registry.
      await Promise.all([
        ...normalized.sports.map((sport) => addCatalogTerm("sport", sport).catch(() => undefined)),
        ...(normalized.tags ?? []).map((tag) => addCatalogTerm("tag", tag).catch(() => undefined)),
      ]);
      await refreshTerms();
      closeDrawer();
    } catch (err) {
      setFieldErrors({
        form: err instanceof Error ? err.message : "Could not save product.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}? This updates live storefront data.`)) return;
    try {
      await localCatalogService.removeProduct(product.id);
      if (editingId === product.id) closeDrawer();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not delete product.");
    }
  };

  const patchFilter = <K extends keyof AdminProductFilters>(key: K, value: AdminProductFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

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

      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full min-w-0 max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" />
            <input
              value={filters.query}
              onChange={(e) => patchFilter("query", e.target.value)}
              placeholder="Smart search: name, slug, sport, tag, description…"
              className={cn(inputClass, "!pl-9")}
            />
          </div>
          <p className="shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-offgrid-green/45">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {filtered.length > PAGE_SIZE ? ` · page ${safePage}/${pageCount}` : null}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select
            value={filters.status}
            onChange={(e) => patchFilter("status", e.target.value as AdminStatusFilter)}
            className={inputClass}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filters.sport}
            onChange={(e) => patchFilter("sport", e.target.value)}
            className={inputClass}
            aria-label="Filter by sport"
          >
            <option value="all">All sports</option>
            {sportCatalog.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
          <select
            value={filters.tag}
            onChange={(e) => patchFilter("tag", e.target.value)}
            className={inputClass}
            aria-label="Filter by tag"
          >
            <option value="all">All tags</option>
            {tagCatalog.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <select
            value={filters.stock}
            onChange={(e) => patchFilter("stock", e.target.value as AdminStockFilter)}
            className={inputClass}
            aria-label="Filter by stock"
          >
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white/60 p-12 text-center">
          <Package className="mx-auto h-8 w-8 text-offgrid-green/30" />
          <p className="mt-3 text-sm text-offgrid-green/60">
            {products.length === 0 ? "No products yet. Add your first one." : "No product matches your filters."}
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl bg-white/40 shadow-sm ring-1 ring-offgrid-green/10">
          <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:gap-5 sm:p-4 xl:grid-cols-3 2xl:grid-cols-4">
            {pageItems.map((product) => (
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
                  {getProductTags(product)[0] ? (
                    <span className="absolute bottom-3 left-3 rounded-full bg-offgrid-lime px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                      {getProductTags(product)[0]}
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
                    {getProductSports(product).join(" · ") || product.category}
                  </p>
                  <h3 className="mt-1 line-clamp-1 font-display text-base font-bold text-offgrid-green">{product.name}</h3>
                  <p className="mt-1 text-sm text-offgrid-green/65">
                    <span className="font-semibold text-offgrid-green">{formatPrice(product.price)}</span>
                    {product.basePrice > product.price ? (
                      <span className="ml-2 text-offgrid-green/40 line-through">{formatPrice(product.basePrice)}</span>
                    ) : null}{" "}
                    <span className="text-offgrid-green/35">·</span> Stock {product.stock ?? 0}
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
          <PortalPagination
            page={safePage}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
            className="bg-white"
          />
        </section>
      )}

      <PortalDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingId ? "Edit product" : "Add product"}
        description="Publishes immediately to the live storefront."
        footer={
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void submit()}
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
        <div className="space-y-5">
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

          <CatalogChipEditor
            label="Sports"
            manageLabel="Manage sports"
            addPlaceholder="New sport (e.g. Disc Golf)"
            options={sportCatalog}
            selected={draft.sports ?? []}
            error={fieldErrors.sports}
            onToggle={(sport) =>
              setDraft((prev) => {
                const sports = toggleLabel(prev.sports ?? [], sport);
                return {
                  ...prev,
                  sports,
                  category: prev.category.trim() || sports[0] || prev.category,
                };
              })
            }
            onAdd={async (label) => {
              await addCatalogTerm("sport", label);
              setSportCatalog((prev) => mergeCatalogLabels(prev, [label]).sort(compareSports));
              setDraft((prev) => ({
                ...prev,
                sports: mergeCatalogLabels(prev.sports, [label]),
                category: prev.category.trim() || label,
              }));
            }}
            onRename={async (from, to) => {
              await renameCatalogTerm("sport", from, to);
              setSportCatalog((prev) => renameLabelInList(prev, from, to).sort(compareSports));
              setDraft((prev) => ({
                ...prev,
                sports: renameLabelInList(prev.sports ?? [], from, to),
                category: prev.category.toLowerCase() === from.toLowerCase() ? to : prev.category,
              }));
              useSiteContentStore.setState((state) => ({
                products: state.products.map((product) => ({
                  ...product,
                  sports: renameLabelInList(getProductSports(product), from, to),
                  category: product.category.toLowerCase() === from.toLowerCase() ? to : product.category,
                })),
              }));
              await localCatalogService.listProducts().then((fetched) => {
                useSiteContentStore.setState({ products: fetched });
              });
            }}
            onDelete={async (label) => {
              await deleteCatalogTerm("sport", label);
              setSportCatalog((prev) => removeLabelFromList(prev, label).sort(compareSports));
              setDraft((prev) => ({
                ...prev,
                sports: removeLabelFromList(prev.sports ?? [], label),
              }));
              await localCatalogService.listProducts().then((fetched) => {
                useSiteContentStore.setState({ products: fetched });
              });
            }}
          />

          <Field
            label="Merchandising category"
            hint="Storefront section label. Defaults to the first sport when empty."
            error={fieldErrors.category}
          >
            <input
              list="product-categories"
              value={draft.category}
              onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Pickleball, Golf, Solar Collection…"
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          <CatalogChipEditor
            label="Storefront tags"
            manageLabel="Manage tags"
            addPlaceholder="Custom tag (e.g. Team Bundle)"
            options={tagCatalog}
            selected={draft.tags ?? []}
            error={fieldErrors.tags}
            onToggle={(tag) =>
              setDraft((prev) => {
                const tags = toggleLabel(prev.tags ?? [], tag);
                return {
                  ...prev,
                  tags,
                  tag: tags[0],
                  homeBestSellerRank:
                    tag === "Best Seller" && tags.includes("Best Seller") && !prev.homeBestSellerRank
                      ? 1
                      : prev.homeBestSellerRank,
                };
              })
            }
            onAdd={async (label) => {
              await addCatalogTerm("tag", label);
              setTagCatalog((prev) => mergeCatalogLabels(prev, [label]));
              setDraft((prev) => {
                const tags = mergeCatalogLabels(prev.tags, [label]);
                return { ...prev, tags, tag: tags[0] };
              });
            }}
            onRename={async (from, to) => {
              await renameCatalogTerm("tag", from, to);
              setTagCatalog((prev) => renameLabelInList(prev, from, to));
              setDraft((prev) => {
                const tags = renameLabelInList(prev.tags ?? [], from, to);
                return { ...prev, tags, tag: tags[0] };
              });
              await localCatalogService.listProducts().then((fetched) => {
                useSiteContentStore.setState({ products: fetched });
              });
            }}
            onDelete={async (label) => {
              await deleteCatalogTerm("tag", label);
              setTagCatalog((prev) => removeLabelFromList(prev, label));
              setDraft((prev) => {
                const tags = removeLabelFromList(prev.tags ?? [], label);
                return { ...prev, tags, tag: tags[0] };
              });
              await localCatalogService.listProducts().then((fetched) => {
                useSiteContentStore.setState({ products: fetched });
              });
            }}
          />

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

          <div>
            <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
              Product image
            </span>
            <ProductImageField
              value={draft.image}
              onChange={(image) => setDraft((prev) => ({ ...prev, image }))}
              error={fieldErrors.image}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Regular price (PHP)" error={fieldErrors.basePrice}>
              <input
                type="number"
                min={1}
                value={draft.basePrice}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setDraft((prev) => ({
                    ...prev,
                    basePrice: n,
                    price: prev.price >= prev.basePrice ? n : Math.min(prev.price, n),
                  }));
                }}
                className={cn(inputClass, fieldErrors.basePrice && inputErrorClass)}
              />
            </Field>
            <Field label="Discount price (PHP)" hint="Optional. Leave blank for no discount." error={fieldErrors.price}>
              <input
                type="number"
                min={1}
                max={draft.basePrice || undefined}
                value={draft.price < draft.basePrice ? draft.price : ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    price: e.target.value === "" ? prev.basePrice : Number(e.target.value),
                  }))
                }
                placeholder="No discount"
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

          <div>
            <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
              Sizes
            </span>
            <SizeMultiSelect
              value={draft.sizes}
              onChange={(sizes) => setDraft((prev) => ({ ...prev, sizes, sizeRange: sizes.join(" – ") }))}
              error={fieldErrors.sizes}
            />
            <p className="mt-1 text-[11px] text-offgrid-green/45">Select presets or add a custom size.</p>
          </div>

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
