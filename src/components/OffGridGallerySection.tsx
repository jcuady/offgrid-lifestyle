import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  monoLabelOnDark,
  sectionPaddingDark,
  sectionTitleOnDark,
  siteContainer,
} from "@/src/lib/brandLayout";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { followCmsCta } from "@/src/lib/cmsNavigation";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

/** UiUX Element 6 — editorial media band (Materials photography). */
const GALLERY_TILE_LAYOUT = [
  "col-span-12 min-h-[280px] sm:col-span-7 sm:row-span-2 sm:min-h-[420px]",
  "col-span-6 min-h-[200px] sm:col-span-5 sm:min-h-[204px]",
  "col-span-6 min-h-[200px] sm:col-span-5 sm:min-h-[204px]",
  "col-span-6 min-h-[200px] sm:col-span-6 sm:min-h-[220px]",
  "col-span-6 min-h-[200px] sm:col-span-6 sm:min-h-[220px]",
] as const;

export function OffGridGallerySection() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const gallery = useSiteContentStore((s) => s.landingContent.gallery);
  const typography = useSiteContentStore((s) => s.landingContent.typography.gallery);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative overflow-hidden border-t border-offgrid-cream/10 bg-offgrid-dark text-offgrid-cream"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,102,255,0.12),transparent)]"
      />

      <div className={cn(siteContainer, sectionPaddingDark)}>
        <div className="mb-10 grid gap-8 lg:mb-14 lg:grid-cols-12 lg:items-end lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6"
          >
            <span className={monoLabelOnDark} style={bodyStyle}>
              {gallery.eyebrow}
            </span>
            <h2 id="gallery-heading" className={cn(sectionTitleOnDark, "mt-4")} style={headingStyle}>
              {gallery.titleLine1}{" "}
              <span className="font-normal italic text-white">{gallery.titleLine2Italic}</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="max-w-xl text-base leading-relaxed text-offgrid-cream/75 md:text-lg lg:col-span-6"
            style={bodyStyle}
          >
            {gallery.caption}
          </motion.p>
        </div>

        <div className="grid grid-cols-12 gap-3 sm:auto-rows-[minmax(200px,1fr)] sm:gap-4">
          {gallery.tiles.map((item, index) => {
            const isFeature = item.variant === "feature";
            const layoutClass = GALLERY_TILE_LAYOUT[index] ?? GALLERY_TILE_LAYOUT[1];

            return (
              <motion.figure
                key={`${item.label}-${index}`}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.04 + index * 0.05 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl ring-1 ring-offgrid-cream/10",
                  layoutClass,
                )}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent",
                    isFeature && "from-black/85 via-black/30",
                  )}
                />
                <div className="absolute left-0 top-0 h-full w-1 bg-offgrid-lime" aria-hidden />
                <figcaption
                  className={cn(
                    "absolute inset-x-0 bottom-0",
                    isFeature ? "p-5 sm:p-7" : "p-4 sm:p-5",
                  )}
                >
                  <span
                    className={cn(
                      "mb-1.5 inline-block font-mono font-bold uppercase tracking-[0.16em] text-offgrid-lime",
                      isFeature ? "text-xs" : "text-[11px] sm:text-xs",
                    )}
                  >
                    {item.tag}
                  </span>
                  <p
                    className={cn(
                      "font-display font-black leading-tight text-offgrid-cream",
                      isFeature ? "text-2xl sm:text-3xl" : "text-sm sm:text-base",
                    )}
                  >
                    {item.label}
                  </p>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-start gap-4 border-t border-offgrid-cream/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream/55">
            {gallery.footnote}
          </p>
          <button
            type="button"
            onClick={() => followCmsCta(navigate, gallery.ctaHref)}
            className="group inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-offgrid-lime transition-colors hover:text-white"
          >
            {gallery.ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
