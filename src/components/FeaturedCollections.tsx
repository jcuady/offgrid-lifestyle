import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { LandingCollectionId } from "@/src/data/landingContent";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { cn } from "@/src/lib/utils";

/** Asymmetric editorial grid — dominant first card, offset supporting cards. */
const layoutById: Record<
  LandingCollectionId,
  { className: string; index: string }
> = {
  pickleball: { className: "md:col-span-2 md:row-span-2 md:min-h-[480px]", index: "01" },
  golf: { className: "md:col-span-2 md:min-h-[220px]", index: "02" },
  "og-pilipinas": { className: "md:col-span-1 md:min-h-[220px]", index: "03" },
  everyday: { className: "md:col-span-3 md:min-h-[200px]", index: "04" },
};

export function FeaturedCollections() {
  const header = useSiteContentStore((s) => s.landingContent.collectionsHeader);
  const collections = useSiteContentStore((s) => s.landingContent.collections);
  const viewAllLabel = useSiteContentStore((s) => s.landingContent.collectionsViewAllLabel);
  const typography = useSiteContentStore((s) => s.landingContent.typography.collections);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  return (
    <section id="collections" className={cn(sectionPaddingCream, "bg-offgrid-cream")}>
      <div className={siteContainer}>
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-offgrid-green/10 pb-8 sm:mb-12 md:flex-row md:items-end">
          <div className="min-w-0">
            <span className={sectionEyebrow} style={bodyStyle}>
              {header.eyebrow}
            </span>
            <h2 className={sectionTitle} style={headingStyle}>
              {header.titleLine1}{" "}
              <span className="font-normal italic">{header.titleLine2Italic}</span>
            </h2>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            {header.caption ? (
              <p className="max-w-xs text-sm leading-relaxed text-offgrid-green/70 md:text-right" style={bodyStyle}>
                {header.caption}
              </p>
            ) : null}
            <Link
              to="/og-signatures"
              className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/60 transition-colors hover:text-offgrid-lime"
            >
              {viewAllLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 md:gap-5">
          {collections.map((collection, index) => {
            const layout = layoutById[collection.id];
            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10 transition-all duration-300 hover:-translate-y-0.5 hover:ring-offgrid-lime/40 hover:shadow-xl",
                  layout.className,
                  "aspect-[4/3] md:aspect-auto",
                )}
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/85 via-offgrid-dark/20 to-transparent" />

                <Link
                  to={`/shop?category=${encodeURIComponent(collection.shopCategory)}`}
                  className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-8"
                  aria-label={`Shop ${collection.title} OG Signature`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-5xl font-black tabular-nums leading-none text-offgrid-cream/15 transition-colors group-hover:text-offgrid-lime/25 md:text-6xl">
                      {layout.index}
                    </span>
                    <span className="rounded-full bg-offgrid-cream/90 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-offgrid-green backdrop-blur-sm">
                      {collection.tag}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/60">
                      {collection.subtitle}
                    </p>
                    <h3 className="font-display text-2xl font-black text-offgrid-cream md:text-3xl">{collection.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-lime opacity-0 transition-opacity group-hover:opacity-100">
                      Shop now
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
