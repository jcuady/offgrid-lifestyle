import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { CustomOrderWizard } from "@/src/components/custom-order/CustomOrderWizard";
import { Footer } from "@/src/components/Footer";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { siteContainer } from "@/src/lib/brandLayout";
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
      <section className="relative bg-offgrid-green pt-28 pb-10 sm:pt-32 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,211,48,0.08),transparent_70%)]" />
        <div className={cn(siteContainer, "relative z-10")}>
          <Link
            to="/custom"
            className="mb-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream/70 hover:text-white"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {hero.backLink}
          </Link>
          <span className="inline-block py-1.5 px-4 rounded-full bg-offgrid-cream/10 backdrop-blur-md border border-offgrid-cream/15 text-offgrid-cream text-[10px] font-semibold tracking-[0.2em] uppercase mb-5">
            {hero.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-offgrid-cream leading-[0.95] tracking-tight max-w-3xl">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-offgrid-cream/70">{hero.description}</p>
        </div>
      </section>

      <section className="bg-offgrid-cream py-10 sm:py-14">
        <div className={cn(siteContainer, "space-y-6")}>
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
              Headwear ordering
            </p>
            <h2 className="mt-2 text-3xl font-display font-black text-offgrid-green sm:text-4xl">
              Team order system
            </h2>
            <p className="mt-3 text-sm text-offgrid-green/65 sm:text-base">
              OffGrid custom orders run on a roster-first workflow so production details stay accurate.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {teamOrderSteps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold text-offgrid-green">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-offgrid-green/70">{step.detail}</p>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Create with OffGrid</p>
            <h3 className="mt-2 font-display text-2xl font-black tracking-tight text-offgrid-green">No Designer? No Problem.</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-offgrid-green/75 sm:text-base">
              Design fees are on the house. If you have an idea, rough sketch, or simple concept, our team can shape it
              into a clean production-ready design for your squad.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/55 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/55">Fonts</p>
                <ul className="mt-2 space-y-1.5 text-xs text-offgrid-green/70">
                  <li>- Team name and text to include</li>
                  <li>- Preferred font style or peg</li>
                </ul>
              </article>
              <article className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/55 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/55">Colors</p>
                <ul className="mt-2 space-y-1.5 text-xs text-offgrid-green/70">
                  <li>- Theme or mood direction</li>
                  <li>- Primary and accent colors</li>
                </ul>
              </article>
              <article className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/55 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/55">Elements</p>
                <ul className="mt-2 space-y-1.5 text-xs text-offgrid-green/70">
                  <li>- High-res logos and badges</li>
                  <li>- Specific graphics or patterns</li>
                </ul>
              </article>
            </div>

            <p className="mt-4 text-xs text-offgrid-green/60">
              Still deciding? Check our social channels for inspiration and attach your peg links in the order brief.
            </p>
            <p className="mt-2 text-xs text-offgrid-green/60">
              If your files are ready, upload them directly in the form. If not, submit what you have and our team will guide you through the rest.
            </p>

            <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
              <Link to="/custom/templates">
                Get templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CustomOrderWizard />

      <Footer />
    </>
  );
}
