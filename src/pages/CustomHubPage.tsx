import { useCallback, useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronDown, Paintbrush2, FileCheck2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { Footer } from "@/src/components/Footer";
import { buildProcessSteps } from "@/src/components/custom-order/customOrderFlowMeta";
import { GuideSectionProse } from "@/src/components/custom/GuideSectionProse";
import { resolveGuideSections } from "@/src/lib/customGuideSections";
import { siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

function followCta(navigate: NavigateFunction, href: string) {
  if (href === "/custom/order" || href === "/custom#order-flow") {
    navigate("/custom/order");
    return;
  }
  if (href === "/custom#templates") {
    navigate("/custom/templates");
    return;
  }
  const onCustom = /^\/custom#([\w-]+)$/.exec(href);
  if (onCustom) {
    navigate({ pathname: "/custom", hash: onCustom[1] });
    return;
  }
  navigate(href);
}

function OffgridDesignAssistBlock({ onTemplatesClick }: { onTemplatesClick: () => void }) {
  return (
    <div className="mt-10 max-w-4xl overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-2">
        <article className="border-b border-offgrid-green/10 p-6 md:border-b-0 md:border-r">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Artwork format</p>
          <div className="mt-3 flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-offgrid-green/70" aria-hidden />
            <h3 className="font-display text-2xl font-black tracking-tight text-offgrid-green">Your Own Design</h3>
          </div>
          <p className="mt-3 font-sans text-sm leading-relaxed text-offgrid-green/75">
            Use OffGrid templates and submit final artwork as Adobe Illustrator (<strong>.AI</strong>) in{" "}
            <strong>CMYK</strong> color mode for reliable print output. Not using Illustrator? Send any format and we
            will help convert it for production.
          </p>
          <Button size="sm" variant="outline" className="mt-4 gap-2" onClick={onTemplatesClick}>
            Get design templates
            <ArrowRight className="h-4 w-4" />
          </Button>
        </article>

        <article className="p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Free support</p>
          <div className="mt-3 flex items-center gap-2">
            <Paintbrush2 className="h-5 w-5 text-offgrid-green/70" aria-hidden />
            <h3 className="font-display text-2xl font-black tracking-tight text-offgrid-green">No Designer? No Problem.</h3>
          </div>
          <p className="mt-3 font-sans text-sm leading-relaxed text-offgrid-green/75">
            Design fees are on us. Share your concept, rough sketch, or reference pegs and our team will turn it into a
            production-ready OffGrid layout.
          </p>
          <div className="mt-4 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/55 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/55">Quick brief checklist</p>
            <ul className="mt-2 space-y-1.5 text-xs text-offgrid-green/70">
              <li>- Fonts: team name, player text, and preferred font style</li>
              <li>- Colors: primary palette plus accent colors</li>
              <li>- Elements: high-res logos, icons, and pattern references</li>
            </ul>
          </div>
          <p className="mt-3 text-xs text-offgrid-green/60">
            Still deciding? Browse our social pages for inspiration and share the looks you want us to adapt.
          </p>
        </article>
      </div>
    </div>
  );
}

export function CustomHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const hub = useSiteContentStore((state) => state.customPageContent.hub);
  const customSectionsRaw = useSiteContentStore((state) => state.customSections);
  const sections = useMemo(
    () => resolveGuideSections(customSectionsRaw).filter((entry) => entry.isPublished),
    [customSectionsRaw],
  );
  const processSteps = useMemo(() => buildProcessSteps(hub.processSteps), [hub.processSteps]);

  const [openGuideSlugs, setOpenGuideSlugs] = useState<Set<string>>(() => new Set());

  const toggleGuideSlug = useCallback((slug: string) => {
    setOpenGuideSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  useEffect(() => {
    const raw = location.hash.replace(/^#/, "");
    if (!raw) return;

    if (raw === "templates") {
      navigate("/custom/templates", { replace: true });
      return;
    }

    const scrollToId = (id: string) => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    if (raw === "order-flow") {
      navigate("/custom/order", { replace: true });
      return;
    }
    if (raw === "ordering-guide") {
      scrollToId("ordering-guide");
      return;
    }

    setOpenGuideSlugs((prev) => new Set(prev).add(raw));
    scrollToId(raw);
  }, [location.pathname, location.hash, navigate]);

  return (
    <>
      <section className="bg-offgrid-green pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className={siteContainer}>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/80">
            {hub.heroEyebrow}
          </span>
          <h1 className="mt-4 text-5xl md:text-7xl font-display font-black text-offgrid-cream leading-[0.9]">
            {hub.heroTitleLine1} <br />
            <span className="italic font-normal text-white">{hub.heroTitleLine2Italic}</span>
          </h1>
          <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-offgrid-cream/70 md:text-base">
            {hub.heroDescription}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
            <Button className="group" variant="secondary" size="lg" onClick={() => navigate("/custom/order")}>
              {hub.ctaPlaceOrder}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-cream/45 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green backdrop-blur-sm bg-offgrid-cream/10"
              onClick={() => {
                document.getElementById("ordering-guide")?.scrollIntoView({ behavior: "smooth" });
                window.history.replaceState(null, "", `${location.pathname}${location.search}#ordering-guide`);
              }}
            >
              {hub.ctaOrderingGuide}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-cream/45 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green backdrop-blur-sm bg-offgrid-cream/10"
              onClick={() => navigate("/custom/templates")}
            >
              {hub.ctaTemplates}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-offgrid-cream py-12 sm:py-16 border-b border-offgrid-green/8">
        <div className={siteContainer}>
          <h2 className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/40 mb-8">
            {hub.howItWorksTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-6">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-offgrid-green/8 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-offgrid-green" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-offgrid-green">{step.label}</p>
                    <p className="text-[10px] text-offgrid-green/50 mt-0.5 max-w-[200px] mx-auto">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="ordering-guide" className="scroll-mt-28 bg-offgrid-cream py-16 md:py-24">
        <div className={siteContainer}>
          <div className="mb-10 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-offgrid-green/45">
              {hub.guideEyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-display font-black tracking-tight text-offgrid-green md:text-5xl">
              {hub.guideTitle}
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-offgrid-green/65 md:text-base">
              {hub.guideDescription}
            </p>
          </div>

          <div className="flex flex-col gap-4 md:gap-5">
            {sections.map((section) => {
              const open = openGuideSlugs.has(section.slug);
              return (
                <div
                  key={section.id}
                  id={section.slug}
                  className={cn(
                    "scroll-mt-28 overflow-hidden rounded-2xl bg-white shadow-[0_2px_28px_-6px_rgba(15,47,47,0.1)] ring-1 ring-offgrid-green/[0.09] transition-shadow",
                    open && "ring-offgrid-green/18 shadow-[0_8px_40px_-8px_rgba(15,47,47,0.12)]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleGuideSlug(section.slug)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-offgrid-cream/35 sm:gap-5 sm:p-6"
                  >
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-offgrid-green/10 sm:h-24 sm:w-36">
                      <img src={section.heroImage} alt="" className="h-full w-full object-cover" />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-dark/25 to-transparent"
                        aria-hidden
                      />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
                        {section.subtitle}
                      </span>
                      <span className="mt-1.5 block text-xl font-display font-bold tracking-tight text-offgrid-green sm:text-2xl">
                        {section.title}
                      </span>
                      <span className="mt-2 block font-sans text-sm leading-snug text-offgrid-green/65 line-clamp-2 sm:text-[15px]">
                        {section.summary}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "mt-2 h-5 w-5 shrink-0 text-offgrid-green/35 transition-transform duration-200",
                        open && "rotate-180 text-offgrid-green/55",
                      )}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t border-offgrid-green/[0.07]"
                      >
                        <div className="relative bg-gradient-to-b from-offgrid-cream/80 via-offgrid-cream/50 to-offgrid-cream/30 px-5 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-8">
                          <div
                            className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-offgrid-lime via-offgrid-lime/70 to-offgrid-green/20"
                            aria-hidden
                          />
                          <div className="pl-4 sm:pl-5">
                            <GuideSectionProse body={section.body} />

                            {section.slug === "faqs" && (
                              <OffgridDesignAssistBlock onTemplatesClick={() => navigate("/custom/templates")} />
                            )}

                            {section.slug === "sizing-chart" && (
                              <div className="mt-10 max-w-3xl overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white shadow-sm">
                                <div className="border-b border-offgrid-green/8 bg-offgrid-green/[0.04] px-5 py-3 sm:px-6">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
                                    {hub.sizingPreviewTitle}
                                  </p>
                                  <p className="mt-1 font-sans text-xs text-offgrid-green/55">
                                    {hub.sizingPreviewCaption}
                                  </p>
                                </div>
                                <div className="overflow-x-auto px-5 py-4 sm:px-6">
                                  <table className="min-w-full text-left text-sm text-offgrid-green">
                                    <thead>
                                      <tr className="border-b border-offgrid-green/10 text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
                                        <th className="pb-3 pr-6">Size</th>
                                        <th className="pb-3 pr-6">Chest (in)</th>
                                        <th className="pb-3 pr-6">Length (in)</th>
                                        <th className="pb-3">Waist (in)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="font-sans text-offgrid-green/85">
                                      {[
                                        ["XS", "18", "26", "26-28"],
                                        ["M", "20", "28", "30-32"],
                                        ["XL", "22", "30", "34-36"],
                                      ].map((row) => (
                                        <tr key={row[0]} className="border-b border-offgrid-green/[0.06] last:border-0">
                                          <td className="py-3 pr-6 font-display font-bold text-offgrid-green">{row[0]}</td>
                                          <td className="py-3 pr-6">{row[1]}</td>
                                          <td className="py-3 pr-6">{row[2]}</td>
                                          <td className="py-3">{row[3]}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            <div className="mt-10">
                              <Button className="group" size="lg" onClick={() => followCta(navigate, section.ctaHref)}>
                                {section.ctaLabel}
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-offgrid-green py-16 sm:py-20">
        <div className={cn(siteContainer, "text-center")}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-offgrid-cream mb-4">
            {hub.bottomTitle}
          </h2>
          <p className="text-offgrid-cream/60 text-sm sm:text-base max-w-md mx-auto mb-8">{hub.bottomDescription}</p>
          <Button variant="secondary" size="lg" className="group" onClick={() => navigate("/shop")}>
            {hub.bottomCta}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
