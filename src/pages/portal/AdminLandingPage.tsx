import { ExternalLink, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { CmsField, CmsImageInput, CmsSectionPanel, CmsTextInput } from "@/src/components/admin/landing/CmsField";
import { LANDING_COLLECTION_IDS } from "@/src/data/landingContent";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { Button } from "@/src/components/ui/Button";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";

const COLLECTION_LABELS: Record<(typeof LANDING_COLLECTION_IDS)[number], string> = {
  pickleball: "Collection 1 — Pickleball (wide)",
  golf: "Collection 2 — Golf (wide)",
  "og-pilipinas": "Collection 3 — OG Pilipinas",
  everyday: "Collection 4 — Everyday Wear (wide)",
};

export function AdminLandingPage() {
  const landing = useSiteContentStore((s) => s.landingContent);
  const updateHero = useSiteContentStore((s) => s.updateLandingHero);
  const updateCollectionsHeader = useSiteContentStore((s) => s.updateLandingCollectionsHeader);
  const updateCollectionCard = useSiteContentStore((s) => s.updateLandingCollectionCard);
  const updateBestSellersHeader = useSiteContentStore((s) => s.updateLandingBestSellersHeader);
  const updateBestSellersShopLink = useSiteContentStore((s) => s.updateLandingBestSellersShopLink);
  const updateBrandStory = useSiteContentStore((s) => s.updateLandingBrandStory);
  const updateEvent = useSiteContentStore((s) => s.updateLandingEvent);
  const updateSocialHeader = useSiteContentStore((s) => s.updateLandingSocialHeader);
  const updateUgcTile = useSiteContentStore((s) => s.updateLandingUgcTile);
  const updateTestimonial = useSiteContentStore((s) => s.updateLandingTestimonial);
  const updateTestimonialsViewAll = useSiteContentStore((s) => s.updateLandingTestimonialsViewAll);
  const updateCta = useSiteContentStore((s) => s.updateLandingCta);
  const updateFooter = useSiteContentStore((s) => s.updateLandingFooter);
  const resetLandingContent = useSiteContentStore((s) => s.resetLandingContent);

  const confirmReset = () => {
    if (window.confirm("Reset all homepage text and images to defaults? This cannot be undone.")) {
      resetLandingContent();
    }
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Content"
        title="Homepage"
        description={
          <>
            Edit text and image URLs for each fixed section on the landing page. Product cards in Best Sellers still
            come from{" "}
            <Link to="/portal/admin/products" className="font-semibold text-offgrid-green underline-offset-2 hover:underline">
              Products
            </Link>{" "}
            (Crowd Favorites rank 1–4).
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Preview site
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" type="button" onClick={confirmReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset defaults
            </Button>
          </>
        }
      />

      <div className="space-y-8">
        <CmsSectionPanel title="Hero" description="Full-viewport intro, CTAs, and stats bar labels.">
          <CmsField label="Badge" className="sm:col-span-2">
            <CmsTextInput value={landing.hero.badge} onChange={(v) => updateHero({ badge: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={landing.hero.titleLine1} onChange={(v) => updateHero({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2">
            <CmsTextInput value={landing.hero.titleLine2} onChange={(v) => updateHero({ titleLine2: v })} />
          </CmsField>
          <CmsField label="Tagline" className="sm:col-span-2">
            <CmsTextInput value={landing.hero.tagline} onChange={(v) => updateHero({ tagline: v })} />
          </CmsField>
          <CmsField label="Locality line">
            <CmsTextInput value={landing.hero.locality} onChange={(v) => updateHero({ locality: v })} />
          </CmsField>
          <CmsField label="Shop CTA">
            <CmsTextInput value={landing.hero.ctaShopLabel} onChange={(v) => updateHero({ ctaShopLabel: v })} />
          </CmsField>
          <CmsField label="Explore CTA">
            <CmsTextInput value={landing.hero.ctaExploreLabel} onChange={(v) => updateHero({ ctaExploreLabel: v })} />
          </CmsField>
          <CmsField label="Stats — sold label">
            <CmsTextInput value={landing.hero.statItemsSoldLabel} onChange={(v) => updateHero({ statItemsSoldLabel: v })} />
          </CmsField>
          <CmsField label="Stats — collections label">
            <CmsTextInput
              value={landing.hero.statCollectionsLabel}
              onChange={(v) => updateHero({ statCollectionsLabel: v })}
            />
          </CmsField>
          <CmsField label="Stats — locality (desktop)">
            <CmsTextInput value={landing.hero.statLocalityLine} onChange={(v) => updateHero({ statLocalityLine: v })} />
          </CmsField>
          <CmsField label="Stats — locality sub">
            <CmsTextInput value={landing.hero.statLocalitySub} onChange={(v) => updateHero({ statLocalitySub: v })} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Featured collections" description="Four fixed cards; shop links stay tied to category filters.">
          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput
              value={landing.collectionsHeader.eyebrow}
              onChange={(v) => updateCollectionsHeader({ eyebrow: v })}
            />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput
              value={landing.collectionsHeader.titleLine1}
              onChange={(v) => updateCollectionsHeader({ titleLine1: v })}
            />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput
              value={landing.collectionsHeader.titleLine2Italic}
              onChange={(v) => updateCollectionsHeader({ titleLine2Italic: v })}
            />
          </CmsField>
          <CmsField label="Caption" className="sm:col-span-2">
            <CmsTextInput
              value={landing.collectionsHeader.caption}
              onChange={(v) => updateCollectionsHeader({ caption: v })}
              multiline
            />
          </CmsField>
        </CmsSectionPanel>

        {landing.collections.map((card) => (
          <div key={card.id}>
          <CmsSectionPanel
            title={COLLECTION_LABELS[card.id]}
            description={`Shop filter: ${card.shopCategory} (fixed)`}
          >
            <CmsField label="Image" className="sm:col-span-2">
              <CmsImageInput
                value={card.image}
                onChange={(v) => updateCollectionCard(card.id, { image: v })}
                alt={card.title}
              />
            </CmsField>
            <CmsField label="Tag">
              <CmsTextInput value={card.tag} onChange={(v) => updateCollectionCard(card.id, { tag: v })} />
            </CmsField>
            <CmsField label="Title">
              <CmsTextInput value={card.title} onChange={(v) => updateCollectionCard(card.id, { title: v })} />
            </CmsField>
            <CmsField label="Subtitle" className="sm:col-span-2">
              <CmsTextInput value={card.subtitle} onChange={(v) => updateCollectionCard(card.id, { subtitle: v })} />
            </CmsField>
          </CmsSectionPanel>
          </div>
        ))}

        <CmsSectionPanel
          title="Best sellers"
          description="Section headings only; picks are configured under Products (homepage rank 1–4)."
        >
          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput
              value={landing.bestSellersHeader.eyebrow}
              onChange={(v) => updateBestSellersHeader({ eyebrow: v })}
            />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput
              value={landing.bestSellersHeader.titleLine1}
              onChange={(v) => updateBestSellersHeader({ titleLine1: v })}
            />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput
              value={landing.bestSellersHeader.titleLine2Italic}
              onChange={(v) => updateBestSellersHeader({ titleLine2Italic: v })}
            />
          </CmsField>
          <CmsField label="Catalog link label" className="sm:col-span-2">
            <CmsTextInput value={landing.bestSellersShopLink} onChange={updateBestSellersShopLink} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Brand story" description="About section on homepage (#about).">
          <CmsField label="Hero image" className="sm:col-span-2">
            <CmsImageInput
              value={landing.brandStory.image}
              onChange={(v) => updateBrandStory({ image: v })}
              alt="Brand story"
            />
          </CmsField>
          <CmsField label="Eyebrow">
            <CmsTextInput value={landing.brandStory.eyebrow} onChange={(v) => updateBrandStory({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={landing.brandStory.titleLine1} onChange={(v) => updateBrandStory({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput
              value={landing.brandStory.titleLine2Italic}
              onChange={(v) => updateBrandStory({ titleLine2Italic: v })}
            />
          </CmsField>
          <CmsField label="Title line 3">
            <CmsTextInput value={landing.brandStory.titleLine3} onChange={(v) => updateBrandStory({ titleLine3: v })} />
          </CmsField>
          <CmsField label="Paragraph 1" className="sm:col-span-2">
            <CmsTextInput value={landing.brandStory.paragraph1} onChange={(v) => updateBrandStory({ paragraph1: v })} multiline />
          </CmsField>
          <CmsField label="Paragraph 2" className="sm:col-span-2">
            <CmsTextInput value={landing.brandStory.paragraph2} onChange={(v) => updateBrandStory({ paragraph2: v })} multiline rows={4} />
          </CmsField>
          <CmsField label="Paragraph 3 — prefix">
            <CmsTextInput
              value={landing.brandStory.paragraph3Prefix}
              onChange={(v) => updateBrandStory({ paragraph3Prefix: v })}
            />
          </CmsField>
          <CmsField label="Paragraph 3 — highlight">
            <CmsTextInput
              value={landing.brandStory.paragraph3Highlight}
              onChange={(v) => updateBrandStory({ paragraph3Highlight: v })}
            />
          </CmsField>
          <CmsField label="Closing quote" className="sm:col-span-2">
            <CmsTextInput value={landing.brandStory.closingQuote} onChange={(v) => updateBrandStory({ closingQuote: v })} />
          </CmsField>
          <CmsField label="Floating badge — EST">
            <CmsTextInput value={landing.brandStory.badgeEst} onChange={(v) => updateBrandStory({ badgeEst: v })} />
          </CmsField>
          <CmsField label="Floating badge — locality">
            <CmsTextInput value={landing.brandStory.badgeLocality} onChange={(v) => updateBrandStory({ badgeLocality: v })} />
          </CmsField>
          <CmsField label="Trait — Gritty">
            <CmsTextInput value={landing.brandStory.badgeGritty} onChange={(v) => updateBrandStory({ badgeGritty: v })} />
          </CmsField>
          <CmsField label="Trait — In Motion">
            <CmsTextInput value={landing.brandStory.badgeInMotion} onChange={(v) => updateBrandStory({ badgeInMotion: v })} />
          </CmsField>
          <CmsField label="Trait — Proudly Pinoy">
            <CmsTextInput
              value={landing.brandStory.badgeProudlyPinoy}
              onChange={(v) => updateBrandStory({ badgeProudlyPinoy: v })}
            />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Event spotlight" description="Homepage event band (#events) — separate from full Events page list.">
          <CmsField label="Background image" className="sm:col-span-2">
            <CmsImageInput
              value={landing.event.backgroundImage}
              onChange={(v) => updateEvent({ backgroundImage: v })}
              alt="Event"
            />
          </CmsField>
          <CmsField label="Badge" className="sm:col-span-2">
            <CmsTextInput value={landing.event.badge} onChange={(v) => updateEvent({ badge: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={landing.event.titleLine1} onChange={(v) => updateEvent({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput value={landing.event.titleLine2Italic} onChange={(v) => updateEvent({ titleLine2Italic: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={landing.event.description} onChange={(v) => updateEvent({ description: v })} multiline rows={4} />
          </CmsField>
          <CmsField label="Date (display)" hint="Shown in UI and used for countdown (with year 2026).">
            <CmsTextInput value={landing.event.date} onChange={(v) => updateEvent({ date: v })} />
          </CmsField>
          <CmsField label="Countdown time">
            <CmsTextInput value={landing.event.countdownTime} onChange={(v) => updateEvent({ countdownTime: v })} placeholder="09:00:00" />
          </CmsField>
          <CmsField label="Location">
            <CmsTextInput value={landing.event.location} onChange={(v) => updateEvent({ location: v })} />
          </CmsField>
          <CmsField label="Category">
            <CmsTextInput value={landing.event.category} onChange={(v) => updateEvent({ category: v })} />
          </CmsField>
          <CmsField label="Primary CTA">
            <CmsTextInput value={landing.event.ctaPrimary} onChange={(v) => updateEvent({ ctaPrimary: v })} />
          </CmsField>
          <CmsField label="Secondary CTA">
            <CmsTextInput value={landing.event.ctaSecondary} onChange={(v) => updateEvent({ ctaSecondary: v })} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Social proof" description="Community grid and three testimonial cards.">
          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput value={landing.socialHeader.eyebrow} onChange={(v) => updateSocialHeader({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={landing.socialHeader.titleLine1} onChange={(v) => updateSocialHeader({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput
              value={landing.socialHeader.titleLine2Italic}
              onChange={(v) => updateSocialHeader({ titleLine2Italic: v })}
            />
          </CmsField>
          <CmsField label="View all button" className="sm:col-span-2">
            <CmsTextInput value={landing.testimonialsViewAll} onChange={updateTestimonialsViewAll} />
          </CmsField>
        </CmsSectionPanel>

        {landing.ugcTiles.map((tile, index) => (
          <div key={index}>
          <CmsSectionPanel
            title={`UGC tile ${index + 1}${index === 0 ? " (large)" : ""}`}
            description="Leave label empty to hide the overlay chip."
          >
            <CmsField label="Image" className="sm:col-span-2">
              <CmsImageInput
                value={tile.image}
                onChange={(v) => updateUgcTile(index as 0 | 1 | 2 | 3 | 4, { image: v })}
                alt={`UGC ${index + 1}`}
              />
            </CmsField>
            <CmsField label="Overlay label" className="sm:col-span-2">
              <CmsTextInput
                value={tile.label}
                onChange={(v) => updateUgcTile(index as 0 | 1 | 2 | 3 | 4, { label: v })}
                placeholder="Optional"
              />
            </CmsField>
          </CmsSectionPanel>
          </div>
        ))}

        {landing.testimonials.map((entry, index) => (
          <div key={index}>
          <CmsSectionPanel title={`Testimonial ${index + 1}`}>
            <CmsField label="Quote" className="sm:col-span-2">
              <CmsTextInput
                value={entry.quote}
                onChange={(v) => updateTestimonial(index as 0 | 1 | 2, { quote: v })}
                multiline
                rows={4}
              />
            </CmsField>
            <CmsField label="Author">
              <CmsTextInput value={entry.author} onChange={(v) => updateTestimonial(index as 0 | 1 | 2, { author: v })} />
            </CmsField>
            <CmsField label="Handle">
              <CmsTextInput value={entry.handle} onChange={(v) => updateTestimonial(index as 0 | 1 | 2, { handle: v })} />
            </CmsField>
            <CmsField label="Location">
              <CmsTextInput value={entry.location} onChange={(v) => updateTestimonial(index as 0 | 1 | 2, { location: v })} />
            </CmsField>
            <CmsField label="Tag">
              <CmsTextInput value={entry.tag} onChange={(v) => updateTestimonial(index as 0 | 1 | 2, { tag: v })} />
            </CmsField>
          </CmsSectionPanel>
          </div>
        ))}

        <CmsSectionPanel title="Closing CTA" description="Dark band before footer.">
          <CmsField label="Title line 1">
            <CmsTextInput value={landing.cta.titleLine1} onChange={(v) => updateCta({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2">
            <CmsTextInput value={landing.cta.titleLine2} onChange={(v) => updateCta({ titleLine2: v })} />
          </CmsField>
          <CmsField
            label="Price fallback"
            className="sm:col-span-2"
            hint="Used when no products exist; otherwise prices are built from the catalog."
          >
            <CmsTextInput
              value={landing.cta.priceFallback}
              onChange={(v) => updateCta({ priceFallback: v })}
              multiline
            />
          </CmsField>
          <CmsField label="Shop CTA">
            <CmsTextInput value={landing.cta.ctaShop} onChange={(v) => updateCta({ ctaShop: v })} />
          </CmsField>
          <CmsField label="Story CTA">
            <CmsTextInput value={landing.cta.ctaStory} onChange={(v) => updateCta({ ctaStory: v })} />
          </CmsField>
          <CmsField label="Trust — shipping">
            <CmsTextInput value={landing.cta.trustShipping} onChange={(v) => updateCta({ trustShipping: v })} />
          </CmsField>
          <CmsField label="Trust — returns">
            <CmsTextInput value={landing.cta.trustReturns} onChange={(v) => updateCta({ trustReturns: v })} />
          </CmsField>
          <CmsField label="Trust — ships">
            <CmsTextInput value={landing.cta.trustShips} onChange={(v) => updateCta({ trustShips: v })} />
          </CmsField>
          <CmsField label="Trust — checkout">
            <CmsTextInput value={landing.cta.trustCheckout} onChange={(v) => updateCta({ trustCheckout: v })} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Footer" description="Tagline and copyright on homepage footer.">
          <CmsField label="Tagline line 1" className="sm:col-span-2">
            <CmsTextInput value={landing.footer.taglineLine1} onChange={(v) => updateFooter({ taglineLine1: v })} />
          </CmsField>
          <CmsField label="Tagline line 2" className="sm:col-span-2">
            <CmsTextInput value={landing.footer.taglineLine2} onChange={(v) => updateFooter({ taglineLine2: v })} />
          </CmsField>
          <CmsField label="Copyright" className="sm:col-span-2">
            <CmsTextInput value={landing.footer.copyright} onChange={(v) => updateFooter({ copyright: v })} />
          </CmsField>
        </CmsSectionPanel>
      </div>
    </div>
  );
}
