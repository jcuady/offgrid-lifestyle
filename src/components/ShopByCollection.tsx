import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  electricBluePill,
  sectionEyebrow,
  sectionPaddingCream,
  sectionTitle,
  siteContainer,
} from "@/src/lib/brandLayout";
import { COMMUNITY_PHOTO_PATHS } from "@/src/lib/communityPhotos";
import { catalogCollectionsToShopLinks, collectionTermImage } from "@/src/lib/shopTaxonomyFromCms";
import { listCatalogTerms, type CatalogTerm } from "@/src/services/catalogTermsService";
import { cn } from "@/src/lib/utils";

/** Named OFFGRID retail collections — sourced from CMS when available. */
export function ShopByCollection() {
  const [loaded, setLoaded] = useState(false);
  const [terms, setTerms] = useState<CatalogTerm[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listCatalogTerms("collection")
      .then((rows) => {
        if (!cancelled) setTerms(rows);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tiles = useMemo(() => {
    const links = catalogCollectionsToShopLinks(terms);
    return links.map((item, index) => {
      const term = terms.find((t) => t.slug === item.category);
      return {
        ...item,
        image: term
          ? collectionTermImage(term, COMMUNITY_PHOTO_PATHS.ultimateField)
          : COMMUNITY_PHOTO_PATHS.ultimateField,
        index,
      };
    });
  }, [terms]);

  if (loaded && tiles.length === 0) return null;

  return (
    <section id="shop-collections" className={cn(sectionPaddingCream, "bg-white")}>
      <div className={siteContainer}>
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-offgrid-green/10 pb-8 md:flex-row md:items-end">
          <div>
            <span className={sectionEyebrow}>Shop By Collection</span>
            <h2 className={cn(sectionTitle, "mt-2")}>
              Distinct collections. <span className="font-normal italic">Different energy.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-offgrid-green/65">
              Explore OFFGRID signatures built around a specific mood, game, and way of moving.
            </p>
          </div>
          <Link to="/collections" className={cn(electricBluePill, "group self-start md:self-auto")}>
            View all collections
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {tiles.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="group relative aspect-[3/4] w-[min(78vw,280px)] shrink-0 snap-start overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10 transition-shadow hover:shadow-lg hover:ring-offgrid-lime/40 sm:w-[240px]"
            >
              <img
                src={item.image}
                alt={`${item.label} collection`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/90 via-offgrid-dark/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white">Collection</p>
                  <span className="font-mono text-[11px] font-bold tabular-nums text-white/70">
                    {String(item.index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-2xl font-black text-offgrid-cream">{item.label}</h3>
                <p className="mt-1.5 text-sm leading-snug text-offgrid-cream/75">{item.description}</p>
                <span className={cn(electricBluePill, "mt-3 group-hover:bg-offgrid-gold")}>
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
