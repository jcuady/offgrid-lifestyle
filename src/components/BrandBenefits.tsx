import { motion } from "motion/react";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

export function BrandBenefits() {
  const benefits = useSiteContentStore((s) => s.landingContent.benefits);
  const typography = useSiteContentStore((s) => s.landingContent.typography.benefits);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  return (
    <section className={cn(sectionPaddingCream, "border-t border-offgrid-green/[0.06] bg-offgrid-cream")}>
      <div className={siteContainer}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <span className={sectionEyebrow} style={bodyStyle}>
              {benefits.eyebrow}
            </span>
            <h2 className={cn(sectionTitle, "mt-3")} style={headingStyle}>
              {benefits.titleLine1}{" "}
              <span className="font-normal italic">{benefits.titleLine2Italic}</span>
            </h2>
          </div>

          <div className="space-y-0 lg:col-span-8">
            {benefits.items.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group grid grid-cols-[auto_1fr] gap-5 border-t border-offgrid-green/10 py-8 first:border-t-0 first:pt-0 sm:gap-8 sm:py-10"
              >
                <span className="font-mono text-4xl font-bold tabular-nums leading-none text-offgrid-lime/80 transition-colors group-hover:text-offgrid-lime sm:text-5xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-black tracking-tight text-offgrid-green sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-base leading-relaxed text-offgrid-green/70 sm:text-lg" style={bodyStyle}>
                    {item.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
