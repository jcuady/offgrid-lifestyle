import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

/** Short “who we are” band — owner asked for home = who we are + promo, no long brand essay. */
export function WhoWeAre() {
  const story = useSiteContentStore((s) => s.landingContent.brandStory);

  return (
    <section id="who-we-are" className={cn(sectionPaddingCream, "bg-offgrid-cream")}>
      <div className={cn(siteContainer, "grid items-center gap-10 lg:grid-cols-12 lg:gap-14")}>
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10">
            <img
              src={story.image}
              alt="OFFGRID athletes in motion"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-7">
          <span className={sectionEyebrow}>{story.eyebrow}</span>
          <h2 className={cn(sectionTitle, "mt-2 max-w-xl")}>
            {story.titleLine1}{" "}
            <span className="font-normal italic">{story.titleLine2Italic}</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-offgrid-green/80">
            {story.paragraph1}
          </p>
          {story.paragraph2 ? (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-offgrid-green/70">
              {story.paragraph2}
            </p>
          ) : null}
          <Link
            to="/about"
            className="group mt-7 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-green transition-colors hover:text-offgrid-lime"
          >
            Our full story
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
