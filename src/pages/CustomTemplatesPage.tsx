import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import type { CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import { siteContainer, sectionEyebrow, sectionEyebrowOnDark } from "@/src/lib/brandLayout";
import { resolveCanonicalTemplates } from "@/src/lib/canonicalTemplates";
import { triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";
import { hydrateSiteContentFromSupabase } from "@/src/services";
import { cn } from "@/src/lib/utils";

const TEMPLATE_CATEGORY_ORDER = ["jerseys", "headwear", "towels", "shorts"] as const;
const TEMPLATE_CATEGORY_LABELS: Record<(typeof TEMPLATE_CATEGORY_ORDER)[number], string> = {
  jerseys: "Jerseys",
  headwear: "Headwear",
  towels: "Towels",
  shorts: "Shorts",
};

export function CustomTemplatesPage() {
  const page = useSiteContentStore((state) => state.customPageContent.templatesPage);
  const customTemplatesRaw = useSiteContentStore((state) => state.customTemplates);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void hydrateSiteContentFromSupabase().finally(() => setHydrated(true));
  }, []);

  const templates = useMemo(
    () => resolveCanonicalTemplates(customTemplatesRaw).filter((entry) => entry.isPublished),
    [customTemplatesRaw],
  );
  const groupedTemplates = useMemo(
    () =>
      TEMPLATE_CATEGORY_ORDER.map((category) => ({
        category,
        label: TEMPLATE_CATEGORY_LABELS[category],
        items: templates.filter((template) => template.category === category),
      })).filter((group) => group.items.length > 0),
    [templates],
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (template: CustomTemplateAsset) => {
    try {
      setDownloadingId(template.id);
      await triggerTemplateDownload(template);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-offgrid-green pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,10,255,0.10),transparent_60%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10")}>
          <Link
            to="/custom"
            className="mb-6 inline-flex items-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {page.backLink}
          </Link>
          <p className={sectionEyebrowOnDark}>{page.eyebrow}</p>
          <h1 className="text-5xl md:text-7xl font-display font-black text-offgrid-cream leading-[0.9]">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm md:text-base text-offgrid-cream/70">{page.description}</p>
          <Button className="mt-8 group" variant="secondary" size="lg" asChild>
            <Link to="/custom/order">
              {page.ctaPlaceOrder}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="min-h-[40vh] bg-offgrid-cream py-14 md:py-20">
        <div className={siteContainer}>
          <p className={sectionEyebrow}>{page.libraryEyebrow}</p>
          <h2 className="max-w-2xl font-display text-2xl font-bold tracking-tight text-offgrid-green md:text-3xl">
            {page.libraryTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-offgrid-green/60">{page.libraryDescription}</p>
          {templates.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-offgrid-green/[0.09] bg-white p-10 text-center shadow-sm ring-1 ring-offgrid-green/[0.06]">
              <p className="font-display text-lg font-semibold text-offgrid-green">
                {!hydrated ? "Loading templates…" : page.emptyTitle}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-offgrid-green/60">
                {!hydrated ? "Fetching the latest template library." : page.emptyDescription}
              </p>
              <Button className="mt-6" variant="outline" size="lg" asChild>
                <Link to="/custom">{page.emptyCta}</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              {groupedTemplates.map((group) => (
                <section key={group.category}>
                  <h3 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/55">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-offgrid-lime" />
                    {group.label}
                    <span className="text-offgrid-green/30">({group.items.length})</span>
                  </h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    {group.items.map((template) => {
                const busy = downloadingId === template.id;
                const canTry =
                  template.storageKind === "idb" ||
                  template.storageKind === "storage" ||
                  (template.fileUrl && template.fileUrl !== "#");

                return (
                  <article
                    key={template.id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-offgrid-lime/40"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-offgrid-green/[0.06] bg-offgrid-cream/50">
                      {template.previewImageUrl ? (
                        <img
                          src={template.previewImageUrl}
                          alt={`${template.name} preview`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-offgrid-green/35">
                          <ImageIcon className="h-6 w-6" />
                          <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em]">{template.format}</span>
                        </div>
                      )}
                      <span className="absolute right-3 top-3 rounded-full bg-offgrid-green/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-offgrid-cream backdrop-blur">
                        {template.format}
                      </span>
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-dark/15 to-transparent"
                        aria-hidden
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl font-bold text-offgrid-green">{template.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-offgrid-green/65">{template.description}</p>
                        <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/40">
                          {template.fileName}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busy || !canTry}
                        onClick={() => handleDownload(template)}
                        className={cn(
                          "inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors",
                          "hover:bg-offgrid-dark disabled:pointer-events-none disabled:opacity-40",
                        )}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {busy ? "Preparing…" : "Download"}
                      </button>
                    </div>
                  </article>
                );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

    </>
  );
}
