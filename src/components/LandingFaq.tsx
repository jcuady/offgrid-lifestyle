import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

export function LandingFaq() {
  const faq = useSiteContentStore((s) => s.landingContent.faq);
  const typography = useSiteContentStore((s) => s.landingContent.typography.faq);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  return (
    <section id="faq" className={cn(sectionPaddingCream, "bg-white")}>
      <div className={siteContainer}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
          >
            <span className={sectionEyebrow} style={bodyStyle}>
              {faq.eyebrow}
            </span>
            <h2 className={cn(sectionTitle, "mt-3")} style={headingStyle}>
              {faq.titleLine1}{" "}
              <span className="font-normal italic">{faq.titleLine2Italic}</span>
            </h2>
            {faq.caption ? (
              <p className="mt-4 max-w-sm text-base leading-relaxed text-offgrid-green/70" style={bodyStyle}>
                {faq.caption}
              </p>
            ) : null}
            <Link
              to="/custom#faqs"
              className="group mt-6 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-green transition-colors hover:text-offgrid-lime"
            >
              {faq.ctaLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Accordion type="single" collapsible className="w-full">
              {faq.items.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-base sm:text-lg">{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
