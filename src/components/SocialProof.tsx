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
          <span className={cn(sectionEyebrow, "mx-auto")} style={bodyStyle}>{header.eyebrow}</span>
          <h2 className={sectionTitle} style={headingStyle}>
            {header.titleLine1} <br />
            <span className="italic font-normal">{header.titleLine2Italic}</span>
          </h2>
          {header.caption ? (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-offgrid-green/70 md:text-base" style={bodyStyle}>
              {header.caption}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group"
          >
            <img
              src={hero.image}
              alt="Community highlight"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {hero.label ? (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-offgrid-green">
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
              className="rounded-2xl overflow-hidden relative group aspect-square"
            >
              <img
                src={tile.image}
                alt={tile.label || "Community"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {tile.label ? (
                <div
                  className={cn(
                    "absolute bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-offgrid-green",
                    index === 1 ? "bottom-3 right-3" : "bottom-3 left-3",
                  )}
                >
                  {tile.label}
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-7 rounded-2xl shadow-sm border border-offgrid-green/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-offgrid-green text-offgrid-green" />
                  ))}
                </div>
                <p className="text-offgrid-green/85 text-sm font-medium italic mb-7 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-offgrid-green/8 pt-5">
                <div>
                  <p className="font-bold text-offgrid-green text-sm">{testimonial.author}</p>
                  <p className="text-xs text-offgrid-green/50">
                    {testimonial.handle} · {testimonial.location}
                  </p>
                </div>
                <span className="px-3 py-1 bg-offgrid-cream rounded-full text-[10px] font-bold tracking-[0.15em] uppercase text-offgrid-green">
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
