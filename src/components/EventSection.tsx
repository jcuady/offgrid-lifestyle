import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { sectionPaddingDark, sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { cn } from "@/src/lib/utils";

export function EventSection() {
  const navigate = useNavigate();
  const event = useSiteContentStore((s) => s.landingContent.event);
  const typography = useSiteContentStore((s) => s.landingContent.typography.event);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  return (
    <section
      id="events"
      className={cn("relative overflow-hidden bg-offgrid-lime text-offgrid-cream", sectionPaddingDark)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.12)_0%,transparent_50%,rgba(0,0,0,0.08)_100%)]" />
      <div className="absolute -right-20 top-0 h-full w-1/2 skew-x-[-8deg] bg-offgrid-dark/10" />

      <div className={cn(siteContainer, "relative z-10")}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
            className="lg:col-span-5"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-offgrid-cream/25 bg-offgrid-cream/10 px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/90 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-offgrid-cream" />
              {event.badge}
            </div>

            {event.date ? (
              <p className="mb-4 font-mono text-5xl font-black tabular-nums leading-none tracking-tight text-offgrid-cream sm:text-6xl">
                {event.date}
              </p>
            ) : null}

            <h2 className={cn(sectionTitleOnDark, "mb-5")} style={headingStyle}>
              {event.titleLine1}{" "}
              <span className="font-normal italic text-white">{event.titleLine2Italic}</span>
            </h2>

            <p
              className="max-w-md whitespace-pre-line text-sm leading-relaxed text-offgrid-cream/75 md:text-base"
              style={bodyStyle}
            >
              {event.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative lg:col-span-7"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-offgrid-cream/20 lg:aspect-[16/10]">
              <img
                src={event.backgroundImage}
                alt={`${event.titleLine1} ${event.titleLine2Italic}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/60 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-3 left-4 flex flex-wrap gap-2 sm:left-6 lg:-bottom-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-offgrid-dark px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-cream shadow-xl">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-offgrid-cream px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-green shadow-xl">
                <Users className="h-3.5 w-3.5" />
                {event.category}
              </span>
              {event.date ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-offgrid-lime px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-cream shadow-xl ring-1 ring-offgrid-cream/30">
                  <Calendar className="h-3.5 w-3.5" />
                  {event.date}
                </span>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
