import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { CustomOrderWizard } from "@/src/components/custom-order/CustomOrderWizard";
import { Footer } from "@/src/components/Footer";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { siteContainer, sectionEyebrow } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export function CustomOrderPage() {
  const hero = useSiteContentStore((s) => s.customPageContent.orderHero);
  const teamOrderSteps = [
    {
      title: "Know the details",
      detail: "Review catalog options, size chart, lead times, and minimum order requirements before collecting your roster.",
    },
    {
      title: "Customize your gear",
      detail:
        "Use your own artwork or collaborate with OffGrid design support to shape your final look.",
    },
    {
      title: "Collect order details",
      detail: "Complete the team order sheet with names, numbers, sizes, quantities, and product types.",
    },
    {
      title: "Submit your order",
      detail: "Upload your completed files so our team can review and confirm next steps.",
    },
    {
      title: "Production starts",
      detail: "After design and order details are confirmed, production begins for your full run.",
    },
    {
      title: "Shipping",
      detail: "Tracking details and after-sales support notes are shared once your order is dispatched.",
    },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <section className="relative bg-offgrid-green pt-28 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,211,48,0.10),transparent_65%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10")}>
          <Link
            to="/custom"
            className="mb-6 inline-flex items-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {hero.backLink}
          </Link>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-offgrid-lime/30 bg-offgrid-lime/10 px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime backdrop-blur-md">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-offgrid-lime" />
            {hero.badge}
          </span>
          <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-6xl font-display font-black leading-[0.95] tracking-tight text-offgrid-cream">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-offgrid-cream/70">{hero.description}</p>
        </div>
      </section>

      <section className="bg-offgrid-cream py-12 sm:py-16">
        <div className={cn(siteContainer, "space-y-8")}>
          <div className="max-w-3xl">
            <p className={sectionEyebrow}>How team orders work</p>
            <h2 className="text-3xl font-display font-black tracking-tight text-offgrid-green sm:text-4xl">
              Team order system
            </h2>
            <p className="mt-3 text-sm text-offgrid-green/65 sm:text-base">
              OffGrid custom orders run on a roster-first workflow so production details stay accurate from brief to dispatch.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teamOrderSteps.map((step, index) => (
              <article
                key={step.title}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-offgrid-lime/40"
              >
                <span className="font-mono text-2xl font-black tabular-nums text-offgrid-green/15 transition-colors group-hover:text-offgrid-lime/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-display text-lg font-bold text-offgrid-green">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-offgrid-green/65">{step.detail}</p>
              </article>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/10">
            <div className="flex flex-col gap-1 border-b border-offgrid-green/10 bg-offgrid-green/[0.04] px-5 py-4 sm:px-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/50">
                Create with OffGrid
              </p>
              <h3 className="font-display text-2xl font-black tracking-tight text-offgrid-green">
                No Designer? No Problem.
              </h3>
            </div>
            <div className="p-5 sm:p-6">
              <p className="max-w-3xl text-sm leading-relaxed text-offgrid-green/75 sm:text-base">
                Design fees are on the house. If you have an idea, rough sketch, or simple concept, our team can shape it
                into a clean production-ready design for your squad.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Fonts", items: ["Team name and text to include", "Preferred font style or peg"] },
                  { label: "Colors", items: ["Theme or mood direction", "Primary and accent colors"] },
                  { label: "Elements", items: ["High-res logos and badges", "Specific graphics or patterns"] },
                ].map((group) => (
                  <article key={group.label} className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/55 p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/55">
                      {group.label}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-offgrid-green/70">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-1.5">
                          <span className="text-offgrid-lime">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <p className="mt-5 text-xs text-offgrid-green/60">
                Still deciding? Check our social channels for inspiration and attach your peg links in the order brief.
                If your files are ready, upload them in the form. If not, submit what you have and our team will guide you
                through the rest.
              </p>

              <Button variant="outline" size="sm" className="mt-5 gap-2" asChild>
                <Link to="/custom/templates">
                  Get templates
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CustomOrderWizard />

      <Footer />
    </>
  );
}
