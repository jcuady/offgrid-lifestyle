import { LandingFaq } from "@/src/components/LandingFaq";
import { sectionEyebrowOnDark, sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export function FaqPage() {
  return (
    <div className="min-h-screen bg-offgrid-cream">
      <section className="bg-offgrid-green pt-28 pb-14 sm:pt-36 sm:pb-16">
        <div className={cn(siteContainer)}>
          <span className={sectionEyebrowOnDark}>FAQ</span>
          <h1 className={cn(sectionTitleOnDark, "mt-2 max-w-3xl")}>
            Straight answers. <span className="font-normal italic text-white">No fluff.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-offgrid-cream/70 md:text-base">
            Orders, artwork, sizing, and custom team kits — the questions teams ask us most.
          </p>
        </div>
      </section>
      <LandingFaq />
    </div>
  );
}
