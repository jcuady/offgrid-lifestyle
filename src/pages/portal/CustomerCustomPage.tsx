import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Palette, Shirt } from "lucide-react";
import { AccountLayout } from "@/src/components/account/AccountLayout";
import { buildProcessSteps } from "@/src/components/custom-order/customOrderFlowMeta";
import { Button } from "@/src/components/ui/Button";
import { hydrateSiteContentFromSupabase } from "@/src/services";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export function CustomerCustomPage() {
  const hub = useSiteContentStore((state) => state.customPageContent.hub);

  useEffect(() => {
    void hydrateSiteContentFromSupabase();
  }, []);

  const steps = buildProcessSteps(hub.processSteps).slice(0, 4);

  return (
    <AccountLayout
      active="custom"
      eyebrow="Custom orders"
      title="Build a team kit"
      description="Start a request, attach artwork or a brief, then track the invoice and production from Orders."
    >
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr] sm:gap-4">
        <Link
          to="/custom/order"
          className="group rounded-[1.5rem] bg-offgrid-green p-1.5 text-offgrid-cream transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]"
        >
          <div className="flex h-full flex-col justify-between rounded-[calc(1.5rem-0.375rem)] bg-offgrid-green px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:px-6 sm:py-7">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-offgrid-lime text-white">
              <Shirt className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="mt-8">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/50">
                New request
              </p>
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight">Start a custom order</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-offgrid-cream/70">
                Minimums, sizes, and artwork — submit once and we send the invoice here.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
              Open the order form
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </div>
        </Link>

        <Link
          to="/custom/templates"
          className="group rounded-[1.5rem] bg-white p-1.5 ring-1 ring-offgrid-green/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]"
        >
          <div className="flex h-full flex-col justify-between rounded-[calc(1.5rem-0.375rem)] px-5 py-6 sm:px-6 sm:py-7">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-offgrid-lime/15 text-offgrid-green">
              <Palette className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="mt-8">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
                Artwork
              </p>
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-offgrid-green">Templates</h2>
              <p className="mt-2 text-sm leading-relaxed text-offgrid-green/60">
                Download cut files before you submit, or send a rough sketch — we convert it.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-green">
              Get templates
              <span className="grid h-8 w-8 place-items-center rounded-full bg-offgrid-green/8 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </div>
        </Link>
      </div>

      <section className="mt-8">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
          {hub.howItWorksTitle}
        </p>
        <h2 className="mt-2 font-display text-xl font-black tracking-tight text-offgrid-green sm:text-2xl">
          What happens after you submit
        </h2>
        <ol className="mt-5 divide-y divide-offgrid-green/10 overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-offgrid-green/[0.07]">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.label} className="flex gap-4 px-5 py-4 sm:px-6">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-offgrid-lime/15 font-mono text-[11px] font-bold text-offgrid-green">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-display text-base font-bold text-offgrid-green">
                    <Icon className="hidden h-4 w-4 text-offgrid-green/45 sm:block" strokeWidth={1.75} />
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-offgrid-green/60">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full gap-2 sm:w-auto" asChild>
          <Link to="/custom/order">
            Start custom order
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link to="/account/orders">See custom requests</Link>
        </Button>
      </div>
    </AccountLayout>
  );
}
