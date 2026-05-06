import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import type { CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import { Footer } from "@/src/components/Footer";
import { triggerTemplateDownload } from "@/src/lib/resolveTemplateDownload";
import { cn } from "@/src/lib/utils";

export function CustomTemplatesPage() {
  const customTemplatesRaw = useSiteContentStore((state) => state.customTemplates);
  const templates = useMemo(
    () => customTemplatesRaw.filter((entry) => entry.isPublished),
    [customTemplatesRaw],
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
        <div className="container mx-auto px-6 md:px-12">
          <Link
            to="/custom"
            className="mb-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream/70 hover:text-offgrid-lime"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to ordering guide
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime">Templates</p>
          <h1 className="mt-3 text-5xl md:text-7xl font-display font-black text-offgrid-cream leading-[0.9]">
            Download packs
          </h1>
          <p className="mt-5 max-w-2xl text-sm md:text-base text-offgrid-cream/70">
            Artwork templates with safe zones and bleed guides. Download here, then use Place custom order in the nav when
            you are ready to submit a quote.
          </p>
          <Button className="mt-8 group" variant="secondary" size="lg" asChild>
            <Link to="/custom/order">
              Place custom order
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-offgrid-dark py-14 md:py-20 text-offgrid-cream min-h-[40vh]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => {
              const busy = downloadingId === template.id;
              const canTry =
                template.storageKind === "idb" ||
                (template.fileUrl && template.fileUrl !== "#");

              return (
                <article key={template.id} className="rounded-2xl border border-offgrid-cream/10 bg-offgrid-cream/5 p-5">
                  <div className="mb-4 overflow-hidden rounded-xl border border-offgrid-cream/10 bg-offgrid-dark/30 aspect-[4/3]">
                    {template.previewImageUrl ? (
                      <img
                        src={template.previewImageUrl}
                        alt={`${template.name} preview`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center gap-2 text-offgrid-cream/45">
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em]">{template.format}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-display font-bold">{template.name}</h2>
                      <p className="mt-1 text-sm text-offgrid-cream/60">{template.description}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-offgrid-cream/45">
                        {template.fileName} · {template.format}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busy || !canTry}
                      onClick={() => handleDownload(template)}
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-xl border border-offgrid-cream/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]",
                        "hover:bg-offgrid-cream hover:text-offgrid-green disabled:pointer-events-none disabled:opacity-40",
                      )}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      {busy ? "…" : "Download"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
