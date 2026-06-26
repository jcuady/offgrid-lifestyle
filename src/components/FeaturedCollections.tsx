import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { LandingCollectionId } from "@/src/data/landingContent";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

const colSpanById: Record<LandingCollectionId, string> = {
  pickleball: "md:col-span-2",
  golf: "md:col-span-2",
  "og-pilipinas": "md:col-span-1",
  everyday: "md:col-span-3",
};

export function FeaturedCollections() {
  const header = useSiteContentStore((s) => s.landingContent.collectionsHeader);
  const collections = useSiteContentStore((s) => s.landingContent.collections);

  return (
    <section id="collections" className={cn(sectionPaddingCream, "bg-offgrid-cream")}>
      <div className={siteContainer}>
        <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-12 md:flex-row md:items-end">
          <div className="min-w-0">
            <span className={sectionEyebrow}>{header.eyebrow}</span>
            <h2 className={sectionTitle}>
              {header.titleLine1} <br />
              <span className="italic font-normal">{header.titleLine2Italic}</span>
            </h2>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            {header.caption ? (
              <p className="max-w-xs text-sm leading-relaxed text-offgrid-green/70 md:text-right">{header.caption}</p>
            ) : null}
            <Link
              to="/collections"
              className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/60 transition-colors hover:text-offgrid-green"
            >
              View all collections
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative rounded-2xl overflow-hidden block ${colSpanById[collection.id]} aspect-[4/3] md:aspect-auto md:min-h-[380px]`}
            >
              <div className="absolute inset-0 bg-offgrid-green/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/80 via-offgrid-dark/10 to-transparent z-10" />

              <img
                src={collection.image}
                alt={collection.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <Link
                to={`/shop?category=${encodeURIComponent(collection.shopCategory)}`}
                className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-between"
                aria-label={`Shop ${collection.title} collection`}
              >
                <div className="flex justify-between items-start">
                  <span className="inline-block px-3 py-1 bg-offgrid-cream/90 backdrop-blur-sm text-offgrid-green text-[10px] font-bold tracking-[0.15em] uppercase rounded-full">
                    {collection.tag}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-offgrid-cream/15 backdrop-blur-md flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-offgrid-cream" />
                  </div>
                </div>

                <div>
                  <p className="text-offgrid-cream/70 text-xs font-medium tracking-[0.2em] uppercase mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {collection.subtitle}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-offgrid-cream">{collection.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
