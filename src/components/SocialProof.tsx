import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import {
  sectionEyebrow,
  sectionHeaderCenter,
  sectionPaddingCream,
  sectionTitle,
  siteContainer,
} from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { cn } from "@/src/lib/utils";

const testimonialOffsets = ["md:translate-y-0", "md:translate-y-8", "md:-translate-y-4"];

export function SocialProof() {
  const header = useSiteContentStore((s) => s.landingContent.socialHeader);
  const ugcTiles = useSiteContentStore((s) => s.landingContent.ugcTiles);
  const testimonials = useSiteContentStore((s) => s.landingContent.testimonials);
  const viewAllLabel = useSiteContentStore((s) => s.landingContent.testimonialsViewAll);
  const typography = useSiteContentStore((s) => s.landingContent.typography.social);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  const [hero, ...rest] = ugcTiles;

  return (
    <section className={cn(sectionPaddingCream, "overflow-hidden bg-offgrid-cream")}>
      <div className={siteContainer}>
        <div className={cn(sectionHeaderCenter, "mb-10 sm:mb-14")}>
          <span className={cn(sectionEyebrow, "mx-auto")} style={bodyStyle}>
            {header.eyebrow}
          </span>
          <h2 className={sectionTitle} style={headingStyle}>
            {header.titleLine1} <br />
            <span className="font-normal italic">{header.titleLine2Italic}</span>
          </h2>
          {header.caption ? (
            <p
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-offgrid-green/70 md:text-base"
              style={bodyStyle}
            >
              {header.caption}
            </p>
          ) : null}
        </div>

        {/* UGC bento — tightened asymmetric grid */}
        <div className="mb-14 grid grid-cols-2 gap-2 sm:gap-3 md:mb-16 md:grid-cols-4 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10 transition-all hover:-translate-y-0.5 hover:ring-offgrid-lime/35"
          >
            <img
              src={hero.image}
              alt="Community highlight"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {hero.label ? (
              <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-green backdrop-blur-sm">
                {hero.label}
              </div>
            ) : null}
          </motion.div>
          {rest.map((tile, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index + 1) * 0.1 }}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10 transition-all hover:-translate-y-0.5 hover:ring-offgrid-lime/35",
                index === 1 && "md:translate-y-4",
                index === 2 && "md:-translate-y-2",
              )}
            >
              <img
                src={tile.image}
                alt={tile.label || "Community"}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {tile.label ? (
                <div
                  className={cn(
                    "absolute rounded-full bg-white/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-green backdrop-blur-sm",
                    index === 1 ? "bottom-3 right-3" : "bottom-3 left-3",
                  )}
                >
                  {tile.label}
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>

        {/* Testimonial cards — oversized quotes, staggered offsets */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-offgrid-green/8 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-offgrid-lime/30 hover:shadow-lg",
                testimonialOffsets[index] ?? "",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -left-1 -top-2 font-display text-8xl font-black leading-none text-offgrid-lime/15 transition-colors group-hover:text-offgrid-lime/25"
              >
                &ldquo;
              </span>

              <div className="relative z-10">
                <div className="mb-5 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-offgrid-green text-offgrid-green" />
                  ))}
                </div>
                <p className="mb-7 text-sm font-medium leading-relaxed text-offgrid-green/85">
                  {testimonial.quote}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between border-t border-offgrid-green/8 pt-5">
                <div>
                  <p className="font-display text-sm font-bold text-offgrid-green">{testimonial.author}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-offgrid-green/50">
                    {testimonial.handle} · {testimonial.location}
                  </p>
                </div>
                <span className="rounded-full bg-offgrid-cream px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-offgrid-green">
                  {testimonial.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/testimonials">{viewAllLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
