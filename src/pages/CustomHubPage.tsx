import { useCallback, useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { Footer } from "@/src/components/Footer";
import { CUSTOM_ORDER_PROCESS_STEPS } from "@/src/components/custom-order/customOrderFlowMeta";
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

export function CustomHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const customSectionsRaw = useSiteContentStore((state) => state.customSections);
  const sections = useMemo(
    () => customSectionsRaw.filter((entry) => entry.isPublished),
    [customSectionsRaw],
  );

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
        <div className="container mx-auto px-6 md:px-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime">
            Custom orders
          </span>
          <h1 className="mt-4 text-5xl md:text-7xl font-display font-black text-offgrid-cream leading-[0.9]">
            Build Your Teamwear <br />
            <span className="italic font-normal text-offgrid-lime">The OffGrid Way</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm md:text-base text-offgrid-cream/70">
            Explore how to order, catalogs, sizing, and timelines below. Download templates from the nav, then place your
            quote on the dedicated order page.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
            <Button className="group" variant="secondary" size="lg" onClick={() => navigate("/custom/order")}>
              Place custom order
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-cream/45 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green backdrop-blur-sm bg-offgrid-cream/10"
              onClick={() => {
                document.getElementById("ordering-guide")?.scrollIntoView({ behavior: "smooth" });
                window.history.replaceState(
                  null,
                  "",
                  `${location.pathname}${location.search}#ordering-guide`,
                );
              }}
            >
              Ordering guide
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-cream/45 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green backdrop-blur-sm bg-offgrid-cream/10"
              onClick={() => navigate("/custom/templates")}
            >
              Templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-offgrid-cream py-12 sm:py-16 border-b border-offgrid-green/8">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/40 mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-6">
            {CUSTOM_ORDER_PROCESS_STEPS.map((step, i) => {
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

      <section id="ordering-guide" className="scroll-mt-28 bg-offgrid-cream py-14 md:py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
                Learn before you quote
              </p>
              <h2 className="mt-2 text-4xl md:text-5xl font-display font-black text-offgrid-green">
                Ordering guide
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {sections.map((section) => {
              const open = openGuideSlugs.has(section.slug);
              return (
                <div
                  key={section.id}
                  id={section.slug}
                  className="scroll-mt-28 overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleGuideSlug(section.slug)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-4 p-4 sm:p-5 text-left transition-colors hover:bg-offgrid-green/[0.03]"
                  >
                    <img
                      src={section.heroImage}
                      alt=""
                      className="h-16 w-24 shrink-0 rounded-lg object-cover sm:h-20 sm:w-28"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
                        {section.subtitle}
                      </span>
                      <span className="mt-1 block text-lg font-display font-bold text-offgrid-green sm:text-xl">
                        {section.title}
                      </span>
                      <span className="mt-1 block text-sm text-offgrid-green/65 line-clamp-2">{section.summary}</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0 text-offgrid-green/40 transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <div className="border-t border-offgrid-green/10 px-4 pb-5 pt-2 sm:px-6">
                      <p className="text-sm text-offgrid-green/75">{section.summary}</p>
                      <div className="mt-4 rounded-xl bg-offgrid-green/[0.04] p-4 sm:p-6 ring-1 ring-offgrid-green/10">
                        {section.body.split("\n").map((line) => (
                          <p key={line} className="mb-3 text-sm leading-relaxed text-offgrid-green/70 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                      <Button className="mt-6 group" size="lg" onClick={() => followCta(navigate, section.ctaHref)}>
                        {section.ctaLabel}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-offgrid-green py-16 sm:py-20">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-offgrid-cream mb-4">
            Looking for ready-made?
          </h2>
          <p className="text-offgrid-cream/60 text-sm sm:text-base max-w-md mx-auto mb-8">
            Browse our collection of premium sportswear — in stock, ready to ship.
          </p>
          <Button variant="secondary" size="lg" className="group" onClick={() => navigate("/shop")}>
            Shop collection
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
