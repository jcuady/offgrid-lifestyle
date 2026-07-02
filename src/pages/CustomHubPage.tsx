import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { hydrateSiteContentFromSupabase } from "@/src/services";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { buildProcessSteps, type ProcessStepMeta } from "@/src/components/custom-order/customOrderFlowMeta";
import { GuideSectionProse } from "@/src/components/custom/GuideSectionProse";
import { resolveGuideSections } from "@/src/lib/customGuideSections";
import { followCmsCta } from "@/src/lib/cmsNavigation";
import type { CustomDesignSupportCard } from "@/src/data/customPageContent";
import { siteContainer, sectionEyebrow, sectionEyebrowOnDark } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

function scrollToId(id: string) {
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ------------------------------------------------------------------ */
/* Interactive 6-step process                                          */
/* ------------------------------------------------------------------ */

function ProcessStepper({ steps }: { steps: ProcessStepMeta[] }) {
  const [active, setActive] = useState(0);
  const count = steps.length;
  const progress = count > 1 ? (active / (count - 1)) * 100 : 0;
  // ponytail: caret centers on an even step distribution (ignores the small grid gaps) — close enough for a 1rem marker.
  const caretLeft = count > 0 ? ((active + 0.5) / count) * 100 : 50;

  return (
    <div>
      {/* Rail */}
      <div className="relative" role="tablist" aria-label="Custom order process">
        <div className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-offgrid-green/15 sm:block" aria-hidden>
          <motion.span
            className="absolute left-0 top-0 h-px bg-offgrid-lime"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-6 sm:gap-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {steps.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <button
                key={step.label}
                type="button"
                role="tab"
                id={`process-tab-${i}`}
                aria-selected={isActive}
                aria-controls="process-panel"
                onClick={() => setActive(i)}
                className="group flex min-w-[100px] flex-1 snap-start flex-col items-center gap-2 outline-none sm:min-w-0"
              >
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-xs font-bold tabular-nums transition-all duration-300",
                    isActive
                      ? "scale-110 border-offgrid-lime bg-offgrid-lime text-white shadow-[0_8px_24px_-6px_rgba(0,10,255,0.65)]"
                      : isDone
                        ? "border-offgrid-lime/40 bg-offgrid-lime/10 text-offgrid-lime"
                        : "border-offgrid-green/20 bg-white text-offgrid-green/45 group-hover:border-offgrid-green/40 group-hover:scale-105",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-center text-[11px] font-semibold leading-tight transition-colors sm:text-xs",
                    isActive ? "text-offgrid-green" : "text-offgrid-green/45 group-hover:text-offgrid-green/70",
                  )}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active detail panel */}
      <div className="relative mt-6">
        {/* Caret points up to the active step so the eye follows the sequence */}
        <motion.span
          aria-hidden
          className="absolute -top-1.5 hidden h-4 w-4 rotate-45 rounded-[3px] bg-offgrid-green sm:block"
          initial={false}
          animate={{ left: `calc(${caretLeft}% - 0.5rem)` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div
          id="process-panel"
          role="tabpanel"
          aria-labelledby={`process-tab-${active}`}
          className="overflow-hidden rounded-3xl bg-offgrid-green text-offgrid-cream"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-10"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-offgrid-lime font-display text-2xl font-black tabular-nums text-white sm:h-20 sm:w-20 sm:text-3xl">
                {String(active + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/80">
                Step {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl">{steps[active]?.label}</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-offgrid-cream/70 sm:text-base">
                {steps[active]?.desc}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setActive((p) => Math.max(0, p - 1))}
                disabled={active === 0}
                aria-label="Previous step"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-offgrid-cream/25 text-offgrid-cream transition-colors hover:bg-offgrid-cream/10 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActive((p) => Math.min(count - 1, p + 1))}
                disabled={active === count - 1}
                aria-label="Next step"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-offgrid-cream/25 text-offgrid-cream transition-colors hover:bg-offgrid-cream/10 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Design support spotlight                                            */
/* ------------------------------------------------------------------ */

function DesignSupportSection({
  eyebrow,
  title,
  ownArtwork,
  freeSupport,
  onCta,
}: {
  eyebrow: string;
  title: string;
  ownArtwork: CustomDesignSupportCard;
  freeSupport: CustomDesignSupportCard;
  onCta: (href: string) => void;
}) {
  return (
    <section className="bg-offgrid-cream pb-14 sm:pb-20">
      <div className={siteContainer}>
        <div className="mb-8 max-w-2xl lg:hidden">
          <p className={sectionEyebrow}>{eyebrow}</p>
          <h2 className="font-display text-2xl font-black tracking-tight text-offgrid-green sm:text-3xl">{title}</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white shadow-sm sm:rounded-3xl">
          <div className="grid gap-0 md:grid-cols-2">
            <article className="border-b border-offgrid-green/10 p-5 sm:p-7 md:border-b-0 md:border-r md:p-9">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
                {ownArtwork.eyebrow}
              </p>
              <h3 className="mt-3 font-display text-xl font-black tracking-tight text-offgrid-green sm:text-2xl md:text-3xl">
                {ownArtwork.title}
              </h3>
              <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-offgrid-green/75">{ownArtwork.body}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-5 w-full gap-2 sm:w-auto"
                onClick={() => onCta(ownArtwork.ctaHref)}
              >
                {ownArtwork.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </article>

            <article className="bg-offgrid-green/[0.02] p-5 sm:p-7 md:p-9">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
                {freeSupport.eyebrow}
              </p>
              <h3 className="mt-3 font-display text-xl font-black tracking-tight text-offgrid-green sm:text-2xl md:text-3xl">
                {freeSupport.title}
              </h3>
              <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-offgrid-green/75">{freeSupport.body}</p>
              {freeSupport.checklistTitle && freeSupport.checklistItems?.length ? (
                <div className="mt-4 rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/60 p-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/55">
                    {freeSupport.checklistTitle}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-offgrid-green/70">
                    {freeSupport.checklistItems.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-offgrid-lime">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <Button
                size="sm"
                className="mt-5 w-full gap-2 sm:w-auto"
                onClick={() => onCta(freeSupport.ctaHref)}
              >
                {freeSupport.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function CustomHubPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    void hydrateSiteContentFromSupabase();
  }, []);

  const hub = useSiteContentStore((state) => state.customPageContent.hub);
  const customSectionsRaw = useSiteContentStore((state) => state.customSections);
  const sections = useMemo(
    () => resolveGuideSections(customSectionsRaw).filter((entry) => entry.isPublished),
    [customSectionsRaw],
  );
  const processSteps = useMemo(() => buildProcessSteps(hub.processSteps), [hub.processSteps]);

  const [openGuideSlugs, setOpenGuideSlugs] = useState<Set<string>>(() => new Set());
  const allOpen = sections.length > 0 && sections.every((s) => openGuideSlugs.has(s.slug));

  const toggleGuideSlug = useCallback((slug: string) => {
    setOpenGuideSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const openGuideSlug = useCallback((slug: string) => {
    setOpenGuideSlugs((prev) => new Set(prev).add(slug));
    scrollToId(slug);
  }, []);

  const toggleAll = useCallback(() => {
    setOpenGuideSlugs((prev) => (sections.every((s) => prev.has(s.slug)) ? new Set() : new Set(sections.map((s) => s.slug))));
  }, [sections]);

  useEffect(() => {
    const raw = location.hash.replace(/^#/, "");
    if (!raw) return;

    if (raw === "templates") {
      navigate("/custom/templates", { replace: true });
      return;
    }
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

  const goToGuide = () => {
    followCmsCta(navigate, hub.ctaOrderingGuideHref);
    if (hub.ctaOrderingGuideHref === "/custom#ordering-guide") {
      scrollToId("ordering-guide");
    }
  };

  const handleCta = (href: string) => followCmsCta(navigate, href);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-offgrid-green pt-24 pb-14 sm:pt-32 sm:pb-20 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,10,255,0.22),transparent_58%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10")}>
          <span className={sectionEyebrowOnDark}>{hub.heroEyebrow}</span>
          <h1 className="max-w-4xl font-display text-[2.35rem] font-black leading-[0.95] tracking-tight text-offgrid-cream sm:text-5xl md:text-7xl">
            {hub.heroTitleLine1} <br />
            <span className="italic font-normal text-white">{hub.heroTitleLine2Italic}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-offgrid-cream/70 sm:mt-5 md:text-base">
            {hub.heroDescription.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < hub.heroDescription.split("\n").length - 1 ? <br /> : null}
              </span>
            ))}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              className="group w-full sm:w-auto"
              variant="secondary"
              size="lg"
              onClick={() => handleCta(hub.ctaPlaceOrderHref)}
            >
              {hub.ctaPlaceOrder}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-offgrid-cream/45 bg-offgrid-cream/10 text-offgrid-cream backdrop-blur-sm hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
              onClick={goToGuide}
            >
              {hub.ctaOrderingGuide}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-offgrid-cream/45 bg-offgrid-cream/10 text-offgrid-cream backdrop-blur-sm hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
              onClick={() => handleCta(hub.ctaTemplatesHref)}
            >
              {hub.ctaTemplates}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-offgrid-cream/15 bg-offgrid-cream/15 sm:mt-12 sm:grid-cols-4 sm:rounded-2xl">
            {hub.heroFacts.map((fact) => (
              <div key={fact.label} className="bg-offgrid-green px-3 py-3.5 sm:px-5 sm:py-5">
                <dt className="font-display text-lg font-black tracking-tight text-offgrid-cream sm:text-2xl">{fact.value}</dt>
                <dd className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-offgrid-cream/55">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={goToGuide}
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-offgrid-cream/60 transition-colors hover:text-offgrid-cream sm:mt-10"
          >
            {hub.heroScrollCue}
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* ---------------- Interactive process ---------------- */}
      <section className="border-b border-offgrid-green/8 bg-offgrid-cream py-12 sm:py-16 md:py-20">
        <div className={siteContainer}>
          <div className="mb-6 max-w-2xl sm:mb-8">
            <p className={sectionEyebrow}>{hub.howItWorksTitle}</p>
            <h2 className="font-display text-2xl font-black tracking-tight text-offgrid-green sm:text-3xl md:text-4xl">
              {hub.howItWorksHeading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-offgrid-green/65 sm:mt-3 sm:text-base">
              {hub.howItWorksDescription}
            </p>
          </div>
          <ProcessStepper steps={processSteps} />
        </div>
      </section>

      {/* ---------------- Design support ---------------- */}
      <div className="hidden bg-offgrid-cream pt-14 sm:block sm:pt-20">
        <div className={cn(siteContainer, "mb-8 max-w-2xl")}>
          <p className={sectionEyebrow}>{hub.designSectionEyebrow}</p>
          <h2 className="font-display text-3xl font-black tracking-tight text-offgrid-green sm:text-4xl">
            {hub.designSectionTitle}
          </h2>
        </div>
      </div>
      <DesignSupportSection
        eyebrow={hub.designSectionEyebrow}
        title={hub.designSectionTitle}
        ownArtwork={hub.designOwnArtwork}
        freeSupport={hub.designFreeSupport}
        onCta={handleCta}
      />

      {/* ---------------- Ordering guide ---------------- */}
      <section id="ordering-guide" className="scroll-mt-24 bg-offgrid-cream pb-14 sm:scroll-mt-28 md:pb-24">
        <div className={siteContainer}>
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className={sectionEyebrow}>{hub.guideEyebrow}</p>
              <h2 className="font-display text-3xl font-black tracking-tight text-offgrid-green sm:text-4xl md:text-5xl">
                {hub.guideTitle}
              </h2>
              <p className="mt-3 font-sans text-sm leading-relaxed text-offgrid-green/65 sm:mt-4 md:text-base">
                {hub.guideDescription}
              </p>
            </div>
            {sections.length > 0 ? (
              <Button variant="outline" size="sm" className="w-full shrink-0 gap-2 sm:w-auto" onClick={toggleAll}>
                {allOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {allOpen ? "Collapse all" : "Expand all"}
              </Button>
            ) : null}
          </div>

          {/* Mobile jump pills */}
          {sections.length > 0 ? (
            <nav
              className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
              aria-label="Ordering guide sections"
            >
              {sections.map((section, i) => {
                const isOpen = openGuideSlugs.has(section.slug);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => openGuideSlug(section.slug)}
                    className={cn(
                      "shrink-0 snap-start rounded-full border px-3.5 py-2 text-left transition-colors",
                      isOpen
                        ? "border-offgrid-lime bg-offgrid-green text-offgrid-cream"
                        : "border-offgrid-green/15 bg-white text-offgrid-green/70",
                    )}
                  >
                    <span
                      className={cn(
                        "block font-mono text-[10px] font-bold",
                        isOpen ? "text-offgrid-cream/80" : "text-offgrid-lime/80",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block max-w-[9rem] truncate text-xs font-semibold">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
            {/* Sticky jump nav */}
            <aside className="hidden lg:block">
              <nav className="sticky top-28" aria-label="Ordering guide sections">
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
                  Jump to
                </p>
                <ul className="overflow-hidden rounded-xl bg-white ring-1 ring-offgrid-green/12">
                  {sections.map((section, i) => {
                    const isOpen = openGuideSlugs.has(section.slug);
                    return (
                      <li key={section.id} className="border-t border-offgrid-green/8 first:border-t-0">
                        <button
                          type="button"
                          onClick={() => openGuideSlug(section.slug)}
                          aria-current={isOpen}
                          className={cn(
                            "group flex w-full items-center gap-3 border-l-2 px-3.5 py-3 text-left transition-colors",
                            isOpen
                              ? "border-offgrid-lime bg-offgrid-green/[0.04]"
                              : "border-transparent hover:bg-offgrid-green/[0.03]",
                          )}
                        >
                          <span
                            className={cn(
                              "font-mono text-[11px] font-bold tabular-nums transition-colors",
                              isOpen ? "text-offgrid-lime" : "text-offgrid-green/30",
                            )}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-[13px] font-semibold transition-colors",
                              isOpen ? "text-offgrid-green" : "text-offgrid-green/55 group-hover:text-offgrid-green",
                            )}
                          >
                            {section.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Accordion — unified editorial list */}
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-offgrid-green/12 shadow-[0_2px_30px_-14px_rgba(0,0,0,0.18)]">
              {sections.map((section, i) => {
                const open = openGuideSlugs.has(section.slug);
                return (
                  <div
                    key={section.id}
                    id={section.slug}
                    className={cn(
                      "scroll-mt-28 border-t border-offgrid-green/8 transition-colors first:border-t-0",
                      open && "bg-offgrid-cream/40",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleGuideSlug(section.slug)}
                      aria-expanded={open}
                      className="group flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-offgrid-green/[0.02] sm:gap-6 sm:px-7 sm:py-6"
                    >
                      <span
                        className={cn(
                          "font-mono text-xl font-bold tabular-nums transition-colors sm:text-3xl",
                          open ? "text-offgrid-lime" : "text-offgrid-green/20 group-hover:text-offgrid-green/40",
                        )}
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45 sm:text-[10px] sm:tracking-[0.18em]">
                          {section.subtitle}
                        </span>
                        <span className="mt-0.5 block font-display text-lg font-black tracking-tight text-offgrid-green sm:mt-1 sm:text-xl md:text-2xl">
                          {section.title}
                        </span>
                        <span
                          className={cn(
                            "mt-1.5 block font-sans text-sm leading-snug text-offgrid-green/60 sm:text-[15px]",
                            !open && "line-clamp-1",
                          )}
                        >
                          {section.summary}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 sm:h-9 sm:w-9",
                          open
                            ? "rotate-180 border-offgrid-lime bg-offgrid-lime text-white"
                            : "border-offgrid-green/20 text-offgrid-green/50 group-hover:border-offgrid-green/45 group-hover:text-offgrid-green",
                        )}
                        aria-hidden
                      >
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.div
                          key="panel"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-0 px-4 pb-8 pt-1 sm:gap-6 sm:px-7 sm:pb-11">
                            <span
                              aria-hidden
                              className="hidden w-[2ch] shrink-0 font-mono text-2xl font-bold sm:block sm:text-3xl"
                            />
                            <div className="min-w-0 flex-1">
                              {section.heroImage ? (
                                <div className="mb-8 overflow-hidden rounded-xl ring-1 ring-offgrid-green/10">
                                  <img
                                    src={section.heroImage}
                                    alt=""
                                    loading="lazy"
                                    className="h-44 w-full object-cover sm:h-56"
                                  />
                                </div>
                              ) : null}

                              <GuideSectionProse body={section.body} />

                              {section.slug === "sizing-chart" && (
                                <div className="mt-10 max-w-3xl overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white">
                                  <div className="border-b border-offgrid-green/8 bg-offgrid-green px-5 py-3.5 sm:px-6">
                                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/80">
                                      {hub.sizingPreviewTitle}
                                    </p>
                                    <p className="mt-1 font-sans text-xs text-offgrid-cream/60">
                                      {hub.sizingPreviewCaption}
                                    </p>
                                  </div>
                                  <div className="overflow-x-auto px-5 py-4 sm:px-6">
                                    <table className="min-w-full text-left text-sm text-offgrid-green">
                                      <thead>
                                        <tr className="border-b border-offgrid-green/10 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
                                          <th className="pb-3 pr-6">Size</th>
                                          <th className="pb-3 pr-6">Chest (in)</th>
                                          <th className="pb-3 pr-6">Length (in)</th>
                                          <th className="pb-3">Waist (in)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="font-sans text-offgrid-green/85">
                                        {hub.sizingRows.map((r) => (
                                          <tr key={r.size} className="border-b border-offgrid-green/[0.06] last:border-0">
                                            <td className="py-3 pr-6 font-display font-bold text-offgrid-green">{r.size}</td>
                                            <td className="py-3 pr-6">{r.chest}</td>
                                            <td className="py-3 pr-6">{r.length}</td>
                                            <td className="py-3">{r.waist}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              <div className="mt-8 sm:mt-9">
                                <Button
                                  className="group w-full sm:w-auto"
                                  size="lg"
                                  onClick={() => handleCta(section.ctaHref)}
                                >
                                  {section.ctaLabel}
                                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
        </div>
      </section>

      {/* ---------------- Closing CTAs ---------------- */}
      <section className="bg-offgrid-green py-12 sm:py-16 md:py-20">
        <div className={cn(siteContainer, "grid gap-4 sm:gap-5 md:grid-cols-2")}>
          <div className="flex flex-col justify-between gap-5 rounded-2xl bg-offgrid-lime p-6 text-white sm:gap-6 sm:rounded-3xl sm:p-8 md:p-10">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                {hub.primaryClosingEyebrow}
              </p>
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
                {hub.primaryClosingTitle}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">{hub.primaryClosingDescription}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="secondary"
                size="lg"
                className="group w-full sm:w-auto"
                onClick={() => handleCta(hub.primaryClosingCtaHref)}
              >
                {hub.primaryClosingCtaLabel}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/50 bg-transparent text-white hover:bg-white hover:text-offgrid-lime sm:w-auto"
                onClick={() => handleCta(hub.primaryClosingSecondaryHref)}
              >
                {hub.primaryClosingSecondaryLabel}
              </Button>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-offgrid-cream/15 bg-offgrid-green p-6 sm:gap-6 sm:rounded-3xl sm:p-8 md:p-10">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/50">
                In stock
              </p>
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-offgrid-cream sm:text-3xl md:text-4xl">
                {hub.bottomTitle}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-offgrid-cream/60">{hub.bottomDescription}</p>
            </div>
            <div>
              <Button
                variant="outline"
                size="lg"
                className="group w-full border-offgrid-cream/45 bg-offgrid-cream/5 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
                onClick={() => handleCta(hub.bottomCtaHref)}
              >
                {hub.bottomCta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
