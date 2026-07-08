import { useEffect, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { CmsField, CmsImageInput, CmsSectionPanel, CmsTextInput, CmsTypographyControls } from "@/src/components/admin/landing/CmsField";
import { CmsRouteSelect } from "@/src/components/admin/CmsRouteSelect";
import { LANDING_COLLECTION_IDS } from "@/src/data/landingContent";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { Button } from "@/src/components/ui/Button";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { cn } from "@/src/lib/utils";
import { hydrateSiteContentFromSupabase } from "@/src/services";
import { useDebouncedLandingPersist } from "@/src/hooks/useDebouncedSitePersist";

const COLLECTION_LABELS: Record<(typeof LANDING_COLLECTION_IDS)[number], string> = {
  pickleball: "Collection 1 — Pickleball (wide)",
  golf: "Collection 2 — Golf (wide)",
  "og-pilipinas": "Collection 3 — OG Pilipinas",
  everyday: "Collection 4 — Everyday Wear (wide)",
};

export function AdminLandingPage() {
  const [persistReady, setPersistReady] = useState(false);
  useDebouncedLandingPersist(persistReady);

  useEffect(() => {
    void hydrateSiteContentFromSupabase().finally(() => setPersistReady(true));
  }, []);

  const landing = useSiteContentStore((s) => s.landingContent);
  const products = useSiteContentStore((s) => s.products);
  const updateHero = useSiteContentStore((s) => s.updateLandingHero);
  const updateCollectionsHeader = useSiteContentStore((s) => s.updateLandingCollectionsHeader);
  const updateCollectionsViewAllLabel = useSiteContentStore((s) => s.updateLandingCollectionsViewAllLabel);
  const updateCollectionCard = useSiteContentStore((s) => s.updateLandingCollectionCard);
  const updateBestSellersHeader = useSiteContentStore((s) => s.updateLandingBestSellersHeader);
  const updateBestSellersShopLink = useSiteContentStore((s) => s.updateLandingBestSellersShopLink);
  const updateBenefits = useSiteContentStore((s) => s.updateLandingBenefits);
  const updateBenefitItem = useSiteContentStore((s) => s.updateLandingBenefitItem);
  const updateFaq = useSiteContentStore((s) => s.updateLandingFaq);
  const updateFaqItem = useSiteContentStore((s) => s.updateLandingFaqItem);
  const updateBrandStory = useSiteContentStore((s) => s.updateLandingBrandStory);
  const updateEvent = useSiteContentStore((s) => s.updateLandingEvent);
  const updateSocialHeader = useSiteContentStore((s) => s.updateLandingSocialHeader);
  const updateUgcTile = useSiteContentStore((s) => s.updateLandingUgcTile);
  const updateTestimonial = useSiteContentStore((s) => s.updateLandingTestimonial);
  const updateTestimonialsViewAll = useSiteContentStore((s) => s.updateLandingTestimonialsViewAll);
  const updateTeamCommunity = useSiteContentStore((s) => s.updateLandingTeamCommunity);
  const updateTeamChip = useSiteContentStore((s) => s.updateLandingTeamChip);
  const updateTypography = useSiteContentStore((s) => s.updateLandingTypography);
  const updateCta = useSiteContentStore((s) => s.updateLandingCta);
  const updateFooter = useSiteContentStore((s) => s.updateLandingFooter);
  const updateFeaturedSpotlight = useSiteContentStore((s) => s.updateLandingFeaturedSpotlight);
  const updateFeaturedSpotlightSlot = useSiteContentStore((s) => s.updateLandingFeaturedSpotlightSlot);
  const resetLandingContent = useSiteContentStore((s) => s.resetLandingContent);

  const liveProducts = products.filter((p) => p.status !== "archived");
  const featured = landing.featuredSpotlight;

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
            Edit text and image URLs for each fixed section on the landing page. Featured spotlight layout and picks
            are configured in the <strong>Featured spotlight</strong> panel below. Product cards in Best Sellers still
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
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput
              value={landing.hero.description}
              onChange={(v) => updateHero({ description: v })}
              multiline
              rows={3}
            />
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
          <CmsField label="Stats — OG Signatures label">
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
          <CmsTypographyControls
            value={landing.typography.hero}
            onChange={(patch) => updateTypography("hero", patch)}
          />
        </CmsSectionPanel>

        <CmsSectionPanel title="OG Signatures" description="Four fixed signature cards; shop links stay tied to category filters.">
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
          <CmsField label="View all link label" className="sm:col-span-2">
            <CmsTextInput
              value={landing.collectionsViewAllLabel}
              onChange={updateCollectionsViewAllLabel}
            />
          </CmsField>
          <CmsTypographyControls
            value={landing.typography.collections}
            onChange={(patch) => updateTypography("collections", patch)}
          />
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
                uploadSection={`collections-${card.id}`}
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
          title="Featured spotlight"
          description="Electric-blue band on homepage and /shop. Choose layout, product source, and optional image overrides."
        >
          <CmsField label="Show on homepage" className="sm:col-span-1">
            <label className="inline-flex items-center gap-2 text-sm text-offgrid-green">
              <input
                type="checkbox"
                checked={featured.showOnHome}
                onChange={(e) => updateFeaturedSpotlight({ showOnHome: e.target.checked })}
                className="h-4 w-4 rounded border-offgrid-green/30 text-offgrid-lime focus:ring-offgrid-lime"
              />
              Visible on home
            </label>
          </CmsField>
          <CmsField label="Show on shop" className="sm:col-span-1">
            <label className="inline-flex items-center gap-2 text-sm text-offgrid-green">
              <input
                type="checkbox"
                checked={featured.showOnShop}
                onChange={(e) => updateFeaturedSpotlight({ showOnShop: e.target.checked })}
                className="h-4 w-4 rounded border-offgrid-green/30 text-offgrid-lime focus:ring-offgrid-lime"
              />
              Visible on /shop
            </label>
          </CmsField>

          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput value={featured.eyebrow} onChange={(v) => updateFeaturedSpotlight({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={featured.titleLine1} onChange={(v) => updateFeaturedSpotlight({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput
              value={featured.titleLine2Italic}
              onChange={(v) => updateFeaturedSpotlight({ titleLine2Italic: v })}
            />
          </CmsField>
          <CmsField label="Subtitle" className="sm:col-span-2">
            <CmsTextInput
              value={featured.subtitle}
              onChange={(v) => updateFeaturedSpotlight({ subtitle: v })}
              multiline
            />
          </CmsField>
          <CmsField label="CTA label">
            <CmsTextInput value={featured.ctaLabel} onChange={(v) => updateFeaturedSpotlight({ ctaLabel: v })} />
          </CmsField>
          <CmsField label="CTA link">
            <CmsRouteSelect value={featured.ctaHref} onChange={(v) => updateFeaturedSpotlight({ ctaHref: v })} />
          </CmsField>

          <CmsField label="Layout" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "bento", label: "Bento — 3 product tiles (1 large + 2 small)" },
                  { value: "hero", label: "Hero — 1 full-width banner (Linya-Linya style)" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFeaturedSpotlight({ layout: option.value })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm",
                    featured.layout === option.value
                      ? "border-offgrid-lime bg-offgrid-lime/10 text-offgrid-green"
                      : "border-offgrid-green/15 text-offgrid-green/70 hover:border-offgrid-green/30",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CmsField>

          <CmsField label="Product source" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  {
                    value: "best_sellers",
                    label: "Best sellers — Crowd Favorites rank from Products (top 3, or 1 for hero)",
                  },
                  { value: "manual", label: "Manual — pick products and override images below" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFeaturedSpotlight({ source: option.value })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm",
                    featured.source === option.value
                      ? "border-offgrid-lime bg-offgrid-lime/10 text-offgrid-green"
                      : "border-offgrid-green/15 text-offgrid-green/70 hover:border-offgrid-green/30",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CmsField>

          {featured.source === "manual" ? (
            <>
              {(featured.layout === "hero" ? [0] : [0, 1, 2]).map((slotIndex) => {
                const slot = featured.slots[slotIndex as 0 | 1 | 2];
                const slotLabel =
                  featured.layout === "hero"
                    ? "Hero banner"
                    : slotIndex === 0
                      ? "Tile 1 — large (primary)"
                      : `Tile ${slotIndex + 1}`;

                return (
                  <div key={slotIndex} className="contents">
                    <CmsField label={`${slotLabel} — product`} className="sm:col-span-2">
                      <select
                        value={slot.productId}
                        onChange={(e) =>
                          updateFeaturedSpotlightSlot(slotIndex as 0 | 1 | 2, { productId: e.target.value })
                        }
                        className="w-full rounded-lg border border-offgrid-green/20 bg-white px-3 py-2 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/20"
                      >
                        <option value="">Image only (no product link)</option>
                        {liveProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} — {product.category}
                          </option>
                        ))}
                      </select>
                    </CmsField>
                    <CmsField label={`${slotLabel} — image override`} className="sm:col-span-2">
                      <CmsImageInput
                        value={slot.imageOverride}
                        onChange={(v) => updateFeaturedSpotlightSlot(slotIndex as 0 | 1 | 2, { imageOverride: v })}
                        alt={slotLabel}
                      />
                      <p className="mt-1.5 text-xs text-offgrid-green/55">
                        Leave empty to use the product photo. Set a custom URL to replace the tile image.
                      </p>
                    </CmsField>
                  </div>
                );
              })}
            </>
          ) : (
            <CmsField label="Best sellers note" className="sm:col-span-2">
              <p className="text-sm text-offgrid-green/65">
                Products are pulled from{" "}
                <Link to="/portal/admin/products" className="font-semibold underline-offset-2 hover:underline">
                  Products → Crowd Favorites rank
                </Link>
                . Hero layout uses rank #1; bento uses ranks #1–3. If ranks are empty, tagged top sellers backfill.
              </p>
            </CmsField>
          )}
        </CmsSectionPanel>

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
          <CmsTypographyControls
            value={landing.typography.bestSellers}
            onChange={(patch) => updateTypography("bestSellers", patch)}
          />
        </CmsSectionPanel>

        <CmsSectionPanel title="Brand benefits" description="Four benefit rows on the homepage (sticky heading + numbered list).">
          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput value={landing.benefits.eyebrow} onChange={(v) => updateBenefits({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={landing.benefits.titleLine1} onChange={(v) => updateBenefits({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput
              value={landing.benefits.titleLine2Italic}
              onChange={(v) => updateBenefits({ titleLine2Italic: v })}
            />
          </CmsField>
          <CmsTypographyControls
            value={landing.typography.benefits}
            onChange={(patch) => updateTypography("benefits", patch)}
          />
        </CmsSectionPanel>

        {landing.benefits.items.map((item, index) => (
          <div key={index}>
            <CmsSectionPanel title={`Benefit ${index + 1}`}>
              <CmsField label="Title">
                <CmsTextInput
                  value={item.title}
                  onChange={(v) => updateBenefitItem(index as 0 | 1 | 2 | 3, { title: v })}
                />
              </CmsField>
              <CmsField label="Description" className="sm:col-span-2">
                <CmsTextInput
                  value={item.description}
                  onChange={(v) => updateBenefitItem(index as 0 | 1 | 2 | 3, { description: v })}
                  multiline
                  rows={3}
                />
              </CmsField>
            </CmsSectionPanel>
          </div>
        ))}

        <CmsSectionPanel title="Brand story" description="Content for the About Us page (/about).">
          <CmsField label="Hero image" className="sm:col-span-2">
            <CmsImageInput
              value={landing.brandStory.image}
              onChange={(v) => updateBrandStory({ image: v })}
              alt="Brand story"
              uploadSection="brand-story"
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

        <CmsSectionPanel title="Community & events" description="Evergreen homepage band (#events). Leave date/location empty — specific events live on /events.">
          <CmsField label="Background image" className="sm:col-span-2">
            <CmsImageInput
              value={landing.event.backgroundImage}
              onChange={(v) => updateEvent({ backgroundImage: v })}
              alt="Event"
              uploadSection="event"
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
          <CmsTypographyControls
            value={landing.typography.event}
            onChange={(patch) => updateTypography("event", patch)}
          />
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
          <CmsField label="Caption" className="sm:col-span-2">
            <CmsTextInput
              value={landing.socialHeader.caption}
              onChange={(v) => updateSocialHeader({ caption: v })}
              multiline
            />
          </CmsField>
          <CmsField label="View all button" className="sm:col-span-2">
            <CmsTextInput value={landing.testimonialsViewAll} onChange={updateTestimonialsViewAll} />
          </CmsField>
          <CmsTypographyControls
            value={landing.typography.social}
            onChange={(patch) => updateTypography("social", patch)}
          />
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
                uploadSection={`ugc-${index + 1}`}
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

        <CmsSectionPanel title="Team community" description="Community band with partner teams and CTAs.">
          <CmsField label="Badge" className="sm:col-span-2">
            <CmsTextInput value={landing.teamCommunity.badge} onChange={(v) => updateTeamCommunity({ badge: v })} />
          </CmsField>
          <CmsField label="Headline line 1">
            <CmsTextInput
              value={landing.teamCommunity.headlineLine1}
              onChange={(v) => updateTeamCommunity({ headlineLine1: v })}
            />
          </CmsField>
          <CmsField label="Headline line 2 (italic)">
            <CmsTextInput
              value={landing.teamCommunity.headlineLine2Italic}
              onChange={(v) => updateTeamCommunity({ headlineLine2Italic: v })}
              multiline
            />
          </CmsField>
          {landing.teamCommunity.teams.map((team, index) => (
            <div key={index} className="contents">
              <CmsField label={`Team ${index + 1} — name`}>
                <CmsTextInput
                  value={team.name}
                  onChange={(v) => updateTeamChip(index as 0 | 1 | 2 | 3, { name: v })}
                />
              </CmsField>
              <CmsField label={`Team ${index + 1} — sport`}>
                <CmsTextInput
                  value={team.sport}
                  onChange={(v) => updateTeamChip(index as 0 | 1 | 2 | 3, { sport: v })}
                />
              </CmsField>
            </div>
          ))}
          <CmsField label="Primary CTA label">
            <CmsTextInput
              value={landing.teamCommunity.primaryCtaLabel}
              onChange={(v) => updateTeamCommunity({ primaryCtaLabel: v })}
            />
          </CmsField>
          <CmsField label="Secondary CTA label">
            <CmsTextInput
              value={landing.teamCommunity.secondaryCtaLabel}
              onChange={(v) => updateTeamCommunity({ secondaryCtaLabel: v })}
            />
          </CmsField>
          <CmsField label="Social heading" className="sm:col-span-2">
            <CmsTextInput
              value={landing.teamCommunity.socialHeading}
              onChange={(v) => updateTeamCommunity({ socialHeading: v })}
            />
          </CmsField>
          <CmsField label="Instagram URL">
            <CmsTextInput
              value={landing.teamCommunity.instagramUrl}
              onChange={(v) => updateTeamCommunity({ instagramUrl: v })}
            />
          </CmsField>
          <CmsField label="Facebook URL">
            <CmsTextInput
              value={landing.teamCommunity.facebookUrl}
              onChange={(v) => updateTeamCommunity({ facebookUrl: v })}
            />
          </CmsField>
          <CmsTypographyControls
            value={landing.typography.teamCommunity}
            onChange={(patch) => updateTypography("teamCommunity", patch)}
          />
        </CmsSectionPanel>

        <CmsSectionPanel title="FAQ" description="Homepage accordion — five Q&A pairs with link to full custom guide.">
          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput value={landing.faq.eyebrow} onChange={(v) => updateFaq({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={landing.faq.titleLine1} onChange={(v) => updateFaq({ titleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput value={landing.faq.titleLine2Italic} onChange={(v) => updateFaq({ titleLine2Italic: v })} />
          </CmsField>
          <CmsField label="Caption" className="sm:col-span-2">
            <CmsTextInput value={landing.faq.caption} onChange={(v) => updateFaq({ caption: v })} multiline />
          </CmsField>
          <CmsField label="Full guide link label" className="sm:col-span-2">
            <CmsTextInput value={landing.faq.ctaLabel} onChange={(v) => updateFaq({ ctaLabel: v })} />
          </CmsField>
          <CmsTypographyControls
            value={landing.typography.faq}
            onChange={(patch) => updateTypography("faq", patch)}
          />
        </CmsSectionPanel>

        {landing.faq.items.map((item, index) => (
          <div key={index}>
            <CmsSectionPanel title={`FAQ ${index + 1}`}>
              <CmsField label="Question" className="sm:col-span-2">
                <CmsTextInput
                  value={item.question}
                  onChange={(v) => updateFaqItem(index as 0 | 1 | 2 | 3 | 4, { question: v })}
                />
              </CmsField>
              <CmsField label="Answer" className="sm:col-span-2">
                <CmsTextInput
                  value={item.answer}
                  onChange={(v) => updateFaqItem(index as 0 | 1 | 2 | 3 | 4, { answer: v })}
                  multiline
                  rows={4}
                />
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
          <CmsTypographyControls
            value={landing.typography.cta}
            onChange={(patch) => updateTypography("cta", patch)}
          />
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
