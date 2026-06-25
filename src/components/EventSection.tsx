import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { sectionPaddingDark, sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

export function EventSection() {
  const navigate = useNavigate();
  const event = useSiteContentStore((s) => s.landingContent.event);

  return (
    <section
      id="events"
      className={cn("relative overflow-hidden bg-offgrid-dark text-offgrid-cream", sectionPaddingDark)}
    >
      {/* Brand-consistent ambient accents (matches BrandStory). */}
      <div className="absolute top-0 left-0 h-full w-1/2 -skew-x-12 -translate-x-1/4 bg-offgrid-green/20" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-offgrid-lime/5 blur-3xl" />

      <div className={cn(siteContainer, "relative z-10")}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="min-w-0 max-w-xl"
          >
            <div className="mb-8 inline-flex items-center rounded-full border border-offgrid-cream/20 bg-offgrid-cream/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/80 backdrop-blur-sm">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-offgrid-lime" />
              {event.badge}
            </div>

            <h2 className={cn(sectionTitleOnDark, "mb-6")}>
              {event.titleLine1} <br />
              <span className="italic font-normal text-white">{event.titleLine2Italic}</span>
            </h2>

            <p className="max-w-xl whitespace-pre-line text-base leading-relaxed text-offgrid-cream/75 md:text-lg">
              {event.description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button variant="secondary" size="lg" className="group w-full sm:w-auto" onClick={() => navigate("/events")}>
                {event.ctaPrimary}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-offgrid-cream/50 bg-offgrid-cream/10 text-offgrid-cream backdrop-blur-sm hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
                onClick={() => navigate("/events")}
              >
                {event.ctaSecondary}
              </Button>
            </div>
          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-2xl md:aspect-square">
              <img
                src={event.backgroundImage}
                alt={`${event.titleLine1} ${event.titleLine2Italic}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/70 via-transparent to-transparent" />
            </div>

            {/* Floating community context — reuses CMS location + category. */}
            <div className="absolute -bottom-4 left-2 flex max-w-[min(320px,80vw)] flex-wrap gap-2 sm:-bottom-6 sm:left-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-offgrid-lime px-3.5 py-2 text-xs font-bold text-white shadow-xl">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-offgrid-cream px-3.5 py-2 text-xs font-bold text-offgrid-green shadow-xl">
                <Users className="h-3.5 w-3.5" />
                {event.category}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
