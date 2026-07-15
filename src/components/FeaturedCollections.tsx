import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { LandingCollectionId } from "@/src/data/landingContent";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { cn } from "@/src/lib/utils";

/**
 * Shop by sport — frisbee featured (top seller).
 *  ┌───────────┬───────────┐
 *  │           │ pickleball│
 *  │  frisbee  ├─────┬─────┤
 *  │           │ golf│ run │
 *  └───────────┴─────┴─────┘
 */
const layoutById: Record<LandingCollectionId, { className: string; index: string }> = {
  frisbee: { className: "md:col-span-2 md:row-span-2", index: "01" },
  pickleball: { className: "md:col-span-2 md:row-span-1", index: "02" },
  golf: { className: "md:col-span-1 md:row-span-1", index: "03" },
  running: { className: "md:col-span-1 md:row-span-1", index: "04" },
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
              <p className="max-w-xs text-base leading-relaxed text-offgrid-green/75 md:text-right" style={bodyStyle}>
                {header.caption}
              </p>
            ) : null}
            <Link
              to="/shop"
              className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-green/70 transition-colors hover:text-offgrid-lime"
            >
              {viewAllLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[236px] md:gap-5">
          {collections.map((collection, index) => {
            const layout = layoutById[collection.id] ?? { className: "", index: String(index + 1).padStart(2, "0") };
            const isFeature = collection.id === "frisbee";
            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10 transition-shadow duration-300 hover:ring-offgrid-lime/40 hover:shadow-xl",
                  layout.className,
                  "aspect-[4/3] md:aspect-auto",
                )}
              >
                <img
                  src={collection.image}
                  alt={`${collection.title} — OFFGRID`}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/90 via-offgrid-dark/30 to-offgrid-dark/5" />

                <Link
                  to={`/shop?category=${encodeURIComponent(collection.shopCategory)}`}
                  className="absolute inset-0 z-10 flex flex-col justify-between p-5 md:p-6"
                  aria-label={`Shop ${collection.title}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-3xl font-black tabular-nums leading-none text-offgrid-cream/25 md:text-4xl">
                      {layout.index}
                    </span>
                    <span className="shrink-0 rounded-full bg-offgrid-cream/90 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-offgrid-green backdrop-blur-sm">
                      {collection.tag}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream/75">
                      {collection.subtitle}
                    </p>
                    <h3
                      className={cn(
                        "font-display font-black leading-none text-offgrid-cream",
                        isFeature ? "text-3xl md:text-4xl" : "text-2xl",
                      )}
                    >
                      {collection.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-lime">
                      {isFeature ? "Shop the drop" : "Shop sport"}
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
