import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { compareSports, getProductSports, type Product } from "@/src/data/products";
import { AccountLayout } from "@/src/components/account/AccountLayout";
import { ProductCard } from "@/src/components/ProductCard";
import { ProductQuickViewModal } from "@/src/components/ProductQuickViewModal";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { hydrateProductsFromSupabase } from "@/src/services";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export function CustomerShopPage() {
  const allProducts = useSiteContentStore((state) => state.products);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("all");
  const [hydrated, setHydrated] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    void hydrateProductsFromSupabase().finally(() => {
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const products = useMemo(
    () => allProducts.filter((product) => product.status === "active"),
    [allProducts],
  );

  const sports = useMemo(
    () => Array.from(new Set(products.flatMap(getProductSports))).sort(compareSports),
    [products],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const sportsOnProduct = getProductSports(product);
      if (sport !== "all" && !sportsOnProduct.includes(sport)) return false;
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        sportsOnProduct.some((label) => label.toLowerCase().includes(needle))
      );
    });
  }, [products, query, sport]);

  return (
    <AccountLayout
      active="shop"
      eyebrow="Online shop"
      title="Ready-to-wear"
      description="Browse OFFGRID kits and add to bag. Checkout stays signed in to your account."
    >
      <div className="mb-5">
        <label htmlFor="account-shop-search" className="sr-only">
          Search products
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" strokeWidth={1.75} />
          <input
            id="account-shop-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search kits, sports, names"
            className="min-h-12 w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-base text-offgrid-green shadow-sm ring-1 ring-offgrid-green/10 outline-none transition-[box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-offgrid-green/35 focus:ring-2 focus:ring-offgrid-lime/40"
          />
        </div>
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        <SportChip label="All" count={products.length} active={sport === "all"} onClick={() => setSport("all")} />
        {sports.map((label) => (
          <SportChip
            key={label}
            label={label}
            count={products.filter((product) => getProductSports(product).includes(label)).length}
            active={sport === label}
            onClick={() => setSport(label)}
          />
        ))}
      </div>

      {!hydrated && products.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-2xl bg-offgrid-green/[0.06]"
              style={{ animationDelay: `${index * 80}ms` }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[1.5rem] bg-white px-6 py-14 text-center shadow-sm ring-1 ring-offgrid-green/[0.07]">
          <h2 className="font-display text-xl font-bold text-offgrid-green">No matching products</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-offgrid-green/60">
            Try another sport or clear the search to see the full catalog.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setQuery("");
              setSport("all");
            }}
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={setQuickView} />
          ))}
        </div>
      )}

      <ProductQuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </AccountLayout>
  );
}

function SportChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]",
        active
          ? "bg-offgrid-green text-offgrid-cream"
          : "bg-white text-offgrid-green/65 ring-1 ring-offgrid-green/10 hover:text-offgrid-green",
      )}
    >
      {label}
      <span className={cn("tabular-nums", active ? "text-offgrid-cream/70" : "text-offgrid-green/40")}>{count}</span>
    </button>
  );
}
