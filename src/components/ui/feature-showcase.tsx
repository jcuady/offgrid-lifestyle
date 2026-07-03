import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export type TabMedia = {
  value: string;
  label: string;
  src: string;
  alt?: string;
};

export type ShowcaseStep = {
  id: string;
  title: string;
  text: string;
};

export type ShowcaseAction = {
  label: string;
  href: string;
};

export type FeatureShowcaseProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  stats?: string[];
  steps: ShowcaseStep[];
  tabs: TabMedia[];
  defaultTab?: string;
  /** Maps step index → tab value for accordion ↔ media sync */
  stepTabForIndex?: (index: number) => string;
  /** First step id in each tab phase (for tab → accordion sync) */
  tabStepForValue?: (tabValue: string, steps: ShowcaseStep[]) => string | undefined;
  panelMinHeight?: number;
  primaryAction?: ShowcaseAction;
  secondaryAction?: ShowcaseAction;
  className?: string;
};

function defaultStepTab(index: number, tabs: TabMedia[]): string {
  if (tabs.length === 0) return "";
  if (index <= 1) return tabs[0]?.value ?? "";
  if (index <= 3) return tabs[1]?.value ?? tabs[0]?.value ?? "";
  return tabs[2]?.value ?? tabs[tabs.length - 1]?.value ?? "";
}

function defaultTabStep(tabValue: string, steps: ShowcaseStep[], tabs: TabMedia[]): string | undefined {
  const tabIndex = tabs.findIndex((t) => t.value === tabValue);
  if (tabIndex < 0) return steps[0]?.id;
  const startByTab = [0, 2, 4];
  const start = startByTab[tabIndex] ?? 0;
  return steps[start]?.id;
}

export function FeatureShowcase({
  eyebrow = "Discover",
  title,
  description,
  stats = [],
  steps,
  tabs,
  defaultTab,
  stepTabForIndex,
  tabStepForValue,
  panelMinHeight = 520,
  primaryAction,
  secondaryAction,
  className,
}: FeatureShowcaseProps) {
  const initialTab = defaultTab ?? tabs[0]?.value ?? "";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openStep, setOpenStep] = useState<string | undefined>(steps[0]?.id);

  const resolveStepTab = useCallback(
    (index: number) => (stepTabForIndex ? stepTabForIndex(index) : defaultStepTab(index, tabs)),
    [stepTabForIndex, tabs],
  );

  const resolveTabStep = useCallback(
    (tabValue: string) =>
      tabStepForValue ? tabStepForValue(tabValue, steps) : defaultTabStep(tabValue, steps, tabs),
    [tabStepForValue, steps, tabs],
  );

  const onAccordionChange = (value: string) => {
    setOpenStep(value || undefined);
    const index = steps.findIndex((s) => s.id === value);
    if (index >= 0) setActiveTab(resolveStepTab(index));
  };

  const onTabChange = (value: string) => {
    setActiveTab(value);
    const stepId = resolveTabStep(value);
    if (stepId) setOpenStep(stepId);
  };

  const stepIndexLabel = useMemo(() => {
    const idx = steps.findIndex((s) => s.id === openStep);
    if (idx < 0) return null;
    return `Step ${String(idx + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
  }, [openStep, steps]);

  return (
    <section className={cn("w-full bg-offgrid-cream text-offgrid-green", className)}>
      <div
        className={cn(
          siteContainer,
          "grid grid-cols-1 gap-10 py-4 md:grid-cols-12 md:gap-12 lg:gap-14",
        )}
      >
        <div className="md:col-span-6 lg:col-span-5">
          <Badge variant="outline" className="mb-5">
            {eyebrow}
          </Badge>

          <h2 className="text-balance font-display text-3xl font-black leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h2>

          {description ? (
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-offgrid-green/65 sm:text-base">{description}</p>
          ) : null}

          {stats.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {stats.map((stat) => (
                <Badge key={stat} variant="secondary">
                  {stat}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-8 max-w-xl">
            <Accordion type="single" collapsible value={openStep} onValueChange={onAccordionChange} className="w-full">
              {steps.map((step, index) => (
                <AccordionItem key={step.id} value={step.id}>
                  <AccordionTrigger>
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] font-bold tabular-nums text-offgrid-green/40">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {step.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>{step.text}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {(primaryAction || secondaryAction) && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {primaryAction ? (
                  <Button size="lg" className="group w-full sm:w-auto" asChild>
                    <Link to={primaryAction.href}>
                      {primaryAction.label}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                ) : null}
                {secondaryAction ? (
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                    <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-6 lg:col-span-7">
          <Card
            className="relative overflow-hidden rounded-3xl border-offgrid-green/10 bg-offgrid-green/[0.03] p-0 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.35)]"
            style={{ height: panelMinHeight, minHeight: Math.min(panelMinHeight, 420) }}
          >
            <Tabs value={activeTab} onValueChange={onTabChange} className="relative h-full w-full">
              <div className="relative h-full w-full">
                {tabs.map((tab, idx) => (
                  <TabsContent
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "absolute inset-0 m-0 h-full w-full",
                      "data-[state=inactive]:hidden",
                    )}
                  >
                    <img
                      src={tab.src}
                      alt={tab.alt ?? tab.label}
                      className="h-full w-full object-cover"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-green/75 via-offgrid-green/15 to-transparent"
                      aria-hidden
                    />
                  </TabsContent>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-5 sm:p-6">
                {stepIndexLabel ? (
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/80">
                    {stepIndexLabel}
                  </p>
                ) : null}
              </div>

              <div className="pointer-events-auto absolute inset-x-0 bottom-4 z-10 flex w-full justify-center px-4 sm:bottom-5">
                <TabsList className="max-w-full flex-wrap">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </section>
  );
}

/** Three-phase visuals for the custom order journey. */
export const CUSTOM_ORDER_PHASE_TABS: TabMedia[] = [
  {
    value: "design",
    label: "Design",
    src: "https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?q=80&w=1400&auto=format&fit=crop",
    alt: "Team reviewing custom apparel designs",
  },
  {
    value: "order",
    label: "Order",
    src: "https://images.unsplash.com/photo-1542393545-10f5cde2c810?q=80&w=1400&auto=format&fit=crop",
    alt: "Order details and roster collection",
  },
  {
    value: "deliver",
    label: "Deliver",
    src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1400&auto=format&fit=crop",
    alt: "Packaged team gear ready for delivery",
  },
];
