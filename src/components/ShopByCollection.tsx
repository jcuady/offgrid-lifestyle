import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { SHOP_BY_COLLECTION } from "@/src/lib/shopTaxonomy";
import { cn } from "@/src/lib/utils";

const COLLECTION_IMAGES: Record<string, string> = {
  Discfest: "/images/community/community-ultimate-skyball.jpg",
  Solar: "/images/product-solar-shortsleeve.jpg",
  Primal: "/images/product-primal-shortsleeve.jpg",
  "OG Vibe": "/images/product-og-vibe.jpg",
};

/** Named drops — separate from shop-by-sport. */
export function ShopByCollection() {
  return (
    <section id="shop-collections" className={cn(sectionPaddingCream, "bg-white")}>
      <div className={siteContainer}>
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-offgrid-green/10 pb-8 md:flex-row md:items-end">
          <div>
            <span className={sectionEyebrow}>Shop By Collection</span>
            <h2 className={cn(sectionTitle, "mt-2")}>
              Named drops. <span className="font-normal italic">Clear focus.</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-green/70 transition-colors hover:text-offgrid-lime"
          >
            View full shop
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHOP_BY_COLLECTION.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10 transition-shadow hover:shadow-lg hover:ring-offgrid-lime/40"
            >
              <img
                src={COLLECTION_IMAGES[item.label] ?? "/images/collection-everyday.jpg"}
                alt={`${item.label} collection`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/90 via-offgrid-dark/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-offgrid-lime">
                  Collection
                </p>
                <h3 className="mt-1 font-display text-2xl font-black text-offgrid-cream">{item.label}</h3>
                <p className="mt-1.5 text-sm leading-snug text-offgrid-cream/75">{item.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-[0.12em] text-offgrid-cream">
                  Shop {item.label}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
