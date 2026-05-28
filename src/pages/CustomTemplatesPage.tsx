import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import type { CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import { Footer } from "@/src/components/Footer";
import { siteContainer } from "@/src/lib/brandLayout";
import { resolveCanonicalTemplates } from "@/src/lib/canonicalTemplates";
import { triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";
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
      <section className="bg-offgrid-green pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className={siteContainer}>
          <Link
            to="/custom"
            className="mb-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream/70 hover:text-offgrid-lime"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {page.backLink}
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime">{page.eyebrow}</p>
          <h1 className="mt-3 text-5xl md:text-7xl font-display font-black text-offgrid-cream leading-[0.9]">
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/40">
            {page.libraryEyebrow}
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold tracking-tight text-offgrid-green md:text-3xl">
            {page.libraryTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-offgrid-green/60">{page.libraryDescription}</p>
          {templates.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-offgrid-green/[0.09] bg-white p-10 text-center shadow-sm ring-1 ring-offgrid-green/[0.06]">
              <p className="font-display text-lg font-semibold text-offgrid-green">{page.emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-offgrid-green/60">{page.emptyDescription}</p>
              <Button className="mt-6" variant="outline" size="lg" asChild>
                <Link to="/custom">{page.emptyCta}</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              {groupedTemplates.map((group) => (
                <section key={group.category}>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                    {group.label}
                  </h3>
                  <div className="mt-3 grid gap-5 md:grid-cols-2">
                    {group.items.map((template) => {
                const busy = downloadingId === template.id;
                const canTry =
                  template.storageKind === "idb" || (template.fileUrl && template.fileUrl !== "#");

                return (
                  <article
                    key={template.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-offgrid-green/[0.09] bg-white shadow-[0_2px_28px_-6px_rgba(15,47,47,0.08)] ring-1 ring-offgrid-green/[0.06]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-offgrid-green/[0.06] bg-offgrid-cream/50">
                      {template.previewImageUrl ? (
                        <img
                          src={template.previewImageUrl}
                          alt={`${template.name} preview`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-offgrid-green/35">
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-xs font-semibold uppercase tracking-[0.12em]">{template.format}</span>
                        </div>
                      )}
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-dark/15 to-transparent"
                        aria-hidden
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-xl font-display font-bold text-offgrid-green">{template.name}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-offgrid-green/65">{template.description}</p>
                          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/40">
                            {template.fileName} · {template.format}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={busy || !canTry}
                          onClick={() => handleDownload(template)}
                          className={cn(
                            "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-offgrid-green bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream",
                            "hover:bg-offgrid-green/90 disabled:pointer-events-none disabled:opacity-40 sm:self-start",
                          )}
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          {busy ? "…" : "Download"}
                        </button>
                      </div>
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

      <Footer />
    </>
  );
}
