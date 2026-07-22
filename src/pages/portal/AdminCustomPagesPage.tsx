import { useEffect, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  CmsField,
  CmsImageInput,
  CmsSectionPanel,
  CmsTextInput,
} from "@/src/components/admin/landing/CmsField";
import { CmsRouteSelect } from "@/src/components/admin/CmsRouteSelect";
import { DEFAULT_GUIDE_CTA_HREF, resolveGuideSections } from "@/src/lib/customGuideSections";
import { CUSTOM_PROCESS_STEP_COUNT } from "@/src/data/customPageContent";
import type { CustomSectionSlug } from "@/src/store/useSiteContentStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { hydrateSiteContentFromSupabase, localContentService } from "@/src/services";
import { useDebouncedCustomPagesPersist } from "@/src/hooks/useDebouncedSitePersist";
import { HeadwearOptionsEditor } from "@/src/components/admin/custom/HeadwearOptionsEditor";
import { Button } from "@/src/components/ui/Button";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { cn } from "@/src/lib/utils";

const GUIDE_LABELS: Record<CustomSectionSlug, string> = {
  "how-to-order": "How to order",
  "product-catalog": "Product catalog",
  "team-deals": "Team deals",
  "sizing-chart": "Sizing chart",
  "free-jersey-promo": "Free jersey promo",
  faqs: "FAQs",
  "lead-times": "Lead times",
};

export function AdminCustomPagesPage() {
  const [persistReady, setPersistReady] = useState(false);
  useDebouncedCustomPagesPersist(persistReady);

  const hub = useSiteContentStore((s) => s.customPageContent.hub);
  const orderHero = useSiteContentStore((s) => s.customPageContent.orderHero);
  const wizard = useSiteContentStore((s) => s.customPageContent.wizard);
  const templatesPage = useSiteContentStore((s) => s.customPageContent.templatesPage);
  const customSectionsRaw = useSiteContentStore((s) => s.customSections);
  const sections = resolveGuideSections(customSectionsRaw);

  const updateHub = useSiteContentStore((s) => s.updateCustomHub);
  const updateOrderHero = useSiteContentStore((s) => s.updateCustomOrderHero);
  const updateWizard = useSiteContentStore((s) => s.updateCustomWizard);
  const updateStep1 = useSiteContentStore((s) => s.updateCustomWizardStep1);
  const updateStep2 = useSiteContentStore((s) => s.updateCustomWizardStep2);
  const updateStep3 = useSiteContentStore((s) => s.updateCustomWizardStep3);
  const updateProcessStep = useSiteContentStore((s) => s.updateCustomProcessStep);
  const updateCustomSection = useSiteContentStore((s) => s.updateCustomSection);
  const resetCustomPageContent = useSiteContentStore((s) => s.resetCustomPageContent);
  const resetCustomGuideSections = useSiteContentStore((s) => s.resetCustomGuideSections);
  const resetHeadwearOptions = useSiteContentStore((s) => s.resetHeadwearOptions);
  const updateTemplatesPage = useSiteContentStore((s) => s.updateCustomTemplatesPage);

  useEffect(() => {
    void hydrateSiteContentFromSupabase().finally(() => setPersistReady(true));
  }, []);

  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id ?? "");
  const selected = sections.find((s) => s.id === selectedSectionId) ?? sections[0];

  const updateSelected = (patch: Parameters<typeof updateCustomSection>[1]) => {
    if (!selected) return;
    localContentService.updateCustomSection(selected.id, patch);
  };

  const confirmResetAll = () => {
    if (
      window.confirm(
        "Reset all custom page copy, guide panels, and headwear/towel types to defaults? Template slots are managed on Templates.",
      )
    ) {
      resetCustomPageContent();
      resetCustomGuideSections();
      resetHeadwearOptions();
    }
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Content"
        title="Custom pages"
        description={
          <>
            Ordering guide (<code className="text-xs">/custom</code>), templates page copy (
            <code className="text-xs">/custom/templates</code>), place order (
            <code className="text-xs">/custom/order</code>), and wizard copy. Layout is fixed — edit text, images,
            button labels, and where each button links. Downloadable OG template files are managed on{" "}
            <Link to="/portal/admin/templates" className="font-semibold text-offgrid-green underline-offset-2 hover:underline">
              Templates
            </Link>
            .
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/custom" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Preview guide
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/custom/templates" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Preview templates
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/custom/order" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Preview order
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" type="button" onClick={confirmResetAll}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset defaults
            </Button>
          </>
        }
      />

      <div className="space-y-8">
        <CmsSectionPanel title="Ordering guide — hero" description="/custom top band">
          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput value={hub.heroEyebrow} onChange={(v) => updateHub({ heroEyebrow: v })} />
          </CmsField>
          <CmsField label="Title line 1">
            <CmsTextInput value={hub.heroTitleLine1} onChange={(v) => updateHub({ heroTitleLine1: v })} />
          </CmsField>
          <CmsField label="Title line 2 (italic)">
            <CmsTextInput value={hub.heroTitleLine2Italic} onChange={(v) => updateHub({ heroTitleLine2Italic: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={hub.heroDescription} onChange={(v) => updateHub({ heroDescription: v })} multiline rows={4} />
          </CmsField>
          <CmsField label="CTA — place order">
            <CmsTextInput value={hub.ctaPlaceOrder} onChange={(v) => updateHub({ ctaPlaceOrder: v })} />
          </CmsField>
          <CmsField label="Place order → page">
            <CmsRouteSelect value={hub.ctaPlaceOrderHref} onChange={(v) => updateHub({ ctaPlaceOrderHref: v })} />
          </CmsField>
          <CmsField label="CTA — ordering guide">
            <CmsTextInput value={hub.ctaOrderingGuide} onChange={(v) => updateHub({ ctaOrderingGuide: v })} />
          </CmsField>
          <CmsField label="Ordering guide → page">
            <CmsRouteSelect value={hub.ctaOrderingGuideHref} onChange={(v) => updateHub({ ctaOrderingGuideHref: v })} />
          </CmsField>
          <CmsField label="CTA — templates">
            <CmsTextInput value={hub.ctaTemplates} onChange={(v) => updateHub({ ctaTemplates: v })} />
          </CmsField>
          <CmsField label="Templates → page">
            <CmsRouteSelect value={hub.ctaTemplatesHref} onChange={(v) => updateHub({ ctaTemplatesHref: v })} />
          </CmsField>
          <CmsField label="Scroll cue" className="sm:col-span-2">
            <CmsTextInput value={hub.heroScrollCue} onChange={(v) => updateHub({ heroScrollCue: v })} />
          </CmsField>
          {hub.heroFacts.map((fact, index) => (
            <div key={index} className="contents">
              <CmsField label={`Quick fact ${index + 1} value`}>
                <CmsTextInput
                  value={fact.value}
                  onChange={(v) => {
                    const next = [...hub.heroFacts];
                    next[index] = { ...next[index]!, value: v };
                    updateHub({ heroFacts: next });
                  }}
                />
              </CmsField>
              <CmsField label={`Quick fact ${index + 1} label`}>
                <CmsTextInput
                  value={fact.label}
                  onChange={(v) => {
                    const next = [...hub.heroFacts];
                    next[index] = { ...next[index]!, label: v };
                    updateHub({ heroFacts: next });
                  }}
                />
              </CmsField>
            </div>
          ))}
        </CmsSectionPanel>

        <CmsSectionPanel title="How it works" description={`${CUSTOM_PROCESS_STEP_COUNT} fixed steps on /custom (icons are fixed).`}>
          <CmsField label="Section eyebrow" className="sm:col-span-2">
            <CmsTextInput value={hub.howItWorksTitle} onChange={(v) => updateHub({ howItWorksTitle: v })} />
          </CmsField>
          <CmsField label="Section heading" className="sm:col-span-2">
            <CmsTextInput value={hub.howItWorksHeading} onChange={(v) => updateHub({ howItWorksHeading: v })} />
          </CmsField>
          <CmsField label="Section description" className="sm:col-span-2">
            <CmsTextInput
              value={hub.howItWorksDescription}
              onChange={(v) => updateHub({ howItWorksDescription: v })}
              multiline
            />
          </CmsField>
          {hub.processSteps.map((step, index) => (
            <div key={index} className="contents">
              <CmsField label={`Step ${index + 1} label`}>
                <CmsTextInput
                  value={step.label}
                  onChange={(v) => updateProcessStep(index as 0 | 1 | 2 | 3 | 4 | 5, { label: v })}
                />
              </CmsField>
              <CmsField label={`Step ${index + 1} description`}>
                <CmsTextInput
                  value={step.description}
                  onChange={(v) => updateProcessStep(index as 0 | 1 | 2 | 3 | 4 | 5, { description: v })}
                />
              </CmsField>
            </div>
          ))}
        </CmsSectionPanel>

        <CmsSectionPanel title="Design support" description="Two-column block on /custom">
          <CmsField label="Section eyebrow" className="sm:col-span-2">
            <CmsTextInput value={hub.designSectionEyebrow} onChange={(v) => updateHub({ designSectionEyebrow: v })} />
          </CmsField>
          <CmsField label="Section title" className="sm:col-span-2">
            <CmsTextInput value={hub.designSectionTitle} onChange={(v) => updateHub({ designSectionTitle: v })} />
          </CmsField>
          <CmsField label="Own artwork — eyebrow">
            <CmsTextInput
              value={hub.designOwnArtwork.eyebrow}
              onChange={(v) => updateHub({ designOwnArtwork: { ...hub.designOwnArtwork, eyebrow: v } })}
            />
          </CmsField>
          <CmsField label="Own artwork — title">
            <CmsTextInput
              value={hub.designOwnArtwork.title}
              onChange={(v) => updateHub({ designOwnArtwork: { ...hub.designOwnArtwork, title: v } })}
            />
          </CmsField>
          <CmsField label="Own artwork — body" className="sm:col-span-2">
            <CmsTextInput
              value={hub.designOwnArtwork.body}
              onChange={(v) => updateHub({ designOwnArtwork: { ...hub.designOwnArtwork, body: v } })}
              multiline
              rows={3}
            />
          </CmsField>
          <CmsField label="Own artwork — button label">
            <CmsTextInput
              value={hub.designOwnArtwork.ctaLabel}
              onChange={(v) => updateHub({ designOwnArtwork: { ...hub.designOwnArtwork, ctaLabel: v } })}
            />
          </CmsField>
          <CmsField label="Own artwork — button page">
            <CmsRouteSelect
              value={hub.designOwnArtwork.ctaHref}
              onChange={(v) => updateHub({ designOwnArtwork: { ...hub.designOwnArtwork, ctaHref: v } })}
            />
          </CmsField>
          <CmsField label="Free support — eyebrow">
            <CmsTextInput
              value={hub.designFreeSupport.eyebrow}
              onChange={(v) => updateHub({ designFreeSupport: { ...hub.designFreeSupport, eyebrow: v } })}
            />
          </CmsField>
          <CmsField label="Free support — title">
            <CmsTextInput
              value={hub.designFreeSupport.title}
              onChange={(v) => updateHub({ designFreeSupport: { ...hub.designFreeSupport, title: v } })}
            />
          </CmsField>
          <CmsField label="Free support — body" className="sm:col-span-2">
            <CmsTextInput
              value={hub.designFreeSupport.body}
              onChange={(v) => updateHub({ designFreeSupport: { ...hub.designFreeSupport, body: v } })}
              multiline
              rows={3}
            />
          </CmsField>
          <CmsField label="Free support — button label">
            <CmsTextInput
              value={hub.designFreeSupport.ctaLabel}
              onChange={(v) => updateHub({ designFreeSupport: { ...hub.designFreeSupport, ctaLabel: v } })}
            />
          </CmsField>
          <CmsField label="Free support — button page">
            <CmsRouteSelect
              value={hub.designFreeSupport.ctaHref}
              onChange={(v) => updateHub({ designFreeSupport: { ...hub.designFreeSupport, ctaHref: v } })}
            />
          </CmsField>
          <CmsField label="Checklist title" className="sm:col-span-2">
            <CmsTextInput
              value={hub.designFreeSupport.checklistTitle ?? ""}
              onChange={(v) => updateHub({ designFreeSupport: { ...hub.designFreeSupport, checklistTitle: v } })}
            />
          </CmsField>
          {(hub.designFreeSupport.checklistItems ?? []).map((item, index) => (
            <div key={index} className="contents">
              <CmsField label={`Checklist item ${index + 1}`} className="sm:col-span-2">
                <CmsTextInput
                  value={item}
                  onChange={(v) => {
                    const next = [...(hub.designFreeSupport.checklistItems ?? [])];
                    next[index] = v;
                    updateHub({ designFreeSupport: { ...hub.designFreeSupport, checklistItems: next } });
                  }}
                />
              </CmsField>
            </div>
          ))}
        </CmsSectionPanel>

        <CmsSectionPanel title="Ordering guide — section header" description="Intro above accordion panels">
          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput value={hub.guideEyebrow} onChange={(v) => updateHub({ guideEyebrow: v })} />
          </CmsField>
          <CmsField label="Title">
            <CmsTextInput value={hub.guideTitle} onChange={(v) => updateHub({ guideTitle: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={hub.guideDescription} onChange={(v) => updateHub({ guideDescription: v })} multiline />
          </CmsField>
          <CmsField label="Sizing table — title">
            <CmsTextInput value={hub.sizingPreviewTitle} onChange={(v) => updateHub({ sizingPreviewTitle: v })} />
          </CmsField>
          <CmsField label="Sizing table — caption">
            <CmsTextInput value={hub.sizingPreviewCaption} onChange={(v) => updateHub({ sizingPreviewCaption: v })} multiline />
          </CmsField>
          {hub.sizingRows.map((row, index) => (
            <div key={index} className="contents">
              <CmsField label={`Sizing row ${index + 1} — size`}>
                <CmsTextInput
                  value={row.size}
                  onChange={(v) => {
                    const next = [...hub.sizingRows];
                    next[index] = { ...next[index]!, size: v };
                    updateHub({ sizingRows: next });
                  }}
                />
              </CmsField>
              <CmsField label={`Row ${index + 1} — chest`}>
                <CmsTextInput
                  value={row.chest}
                  onChange={(v) => {
                    const next = [...hub.sizingRows];
                    next[index] = { ...next[index]!, chest: v };
                    updateHub({ sizingRows: next });
                  }}
                />
              </CmsField>
              <CmsField label={`Row ${index + 1} — length`}>
                <CmsTextInput
                  value={row.length}
                  onChange={(v) => {
                    const next = [...hub.sizingRows];
                    next[index] = { ...next[index]!, length: v };
                    updateHub({ sizingRows: next });
                  }}
                />
              </CmsField>
              <CmsField label={`Row ${index + 1} — waist`}>
                <CmsTextInput
                  value={row.waist}
                  onChange={(v) => {
                    const next = [...hub.sizingRows];
                    next[index] = { ...next[index]!, waist: v };
                    updateHub({ sizingRows: next });
                  }}
                />
              </CmsField>
            </div>
          ))}
        </CmsSectionPanel>

        <CmsSectionPanel title="Guide panels" description="Seven fixed accordion items — select one to edit.">
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setSelectedSectionId(section.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  selected?.id === section.id
                    ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                    : "border-offgrid-green/20 text-offgrid-green/70 hover:border-offgrid-green/40",
                )}
              >
                {GUIDE_LABELS[section.slug]}
              </button>
            ))}
          </div>
        </CmsSectionPanel>

        {selected ? (
          <CmsSectionPanel
            title={GUIDE_LABELS[selected.slug]}
            description={`Deep link: /custom#${selected.slug} · Default CTA: ${DEFAULT_GUIDE_CTA_HREF[selected.slug]}`}
          >
            <CmsField label="Panel title" className="sm:col-span-2">
              <CmsTextInput value={selected.title} onChange={(v) => updateSelected({ title: v })} />
            </CmsField>
            <CmsField label="Eyebrow / kicker">
              <CmsTextInput value={selected.subtitle} onChange={(v) => updateSelected({ subtitle: v })} />
            </CmsField>
            <CmsField label="Collapsed summary" className="sm:col-span-2">
              <CmsTextInput value={selected.summary} onChange={(v) => updateSelected({ summary: v })} multiline rows={2} />
            </CmsField>
            <CmsField label="Expanded body" className="sm:col-span-2">
              <CmsTextInput value={selected.body} onChange={(v) => updateSelected({ body: v })} multiline rows={10} />
            </CmsField>
            <CmsField label="Thumbnail image" className="sm:col-span-2">
              <CmsImageInput
                value={selected.heroImage}
                onChange={(v) => updateSelected({ heroImage: v })}
                alt={selected.title}
              />
            </CmsField>
            <CmsField label="CTA button label">
              <CmsTextInput value={selected.ctaLabel} onChange={(v) => updateSelected({ ctaLabel: v })} />
            </CmsField>
            <CmsField label="CTA button → page">
              <CmsRouteSelect value={selected.ctaHref} onChange={(v) => updateSelected({ ctaHref: v })} />
            </CmsField>
            <CmsField label="Published on /custom">
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-offgrid-green">
                <input
                  type="checkbox"
                  checked={selected.isPublished}
                  onChange={(e) => updateSelected({ isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-offgrid-green/30"
                />
                Show this panel on the ordering guide
              </label>
            </CmsField>
          </CmsSectionPanel>
        ) : null}

        <CmsSectionPanel title="Closing CTAs" description="Bottom band on /custom — two cards">
          <CmsField label="Primary card — eyebrow">
            <CmsTextInput value={hub.primaryClosingEyebrow} onChange={(v) => updateHub({ primaryClosingEyebrow: v })} />
          </CmsField>
          <CmsField label="Primary card — title">
            <CmsTextInput value={hub.primaryClosingTitle} onChange={(v) => updateHub({ primaryClosingTitle: v })} />
          </CmsField>
          <CmsField label="Primary card — description" className="sm:col-span-2">
            <CmsTextInput
              value={hub.primaryClosingDescription}
              onChange={(v) => updateHub({ primaryClosingDescription: v })}
              multiline
            />
          </CmsField>
          <CmsField label="Primary button label">
            <CmsTextInput value={hub.primaryClosingCtaLabel} onChange={(v) => updateHub({ primaryClosingCtaLabel: v })} />
          </CmsField>
          <CmsField label="Primary button → page">
            <CmsRouteSelect
              value={hub.primaryClosingCtaHref}
              onChange={(v) => updateHub({ primaryClosingCtaHref: v })}
            />
          </CmsField>
          <CmsField label="Secondary button label">
            <CmsTextInput
              value={hub.primaryClosingSecondaryLabel}
              onChange={(v) => updateHub({ primaryClosingSecondaryLabel: v })}
            />
          </CmsField>
          <CmsField label="Secondary button → page">
            <CmsRouteSelect
              value={hub.primaryClosingSecondaryHref}
              onChange={(v) => updateHub({ primaryClosingSecondaryHref: v })}
            />
          </CmsField>
          <CmsField label="Shop card — title" className="sm:col-span-2">
            <CmsTextInput value={hub.bottomTitle} onChange={(v) => updateHub({ bottomTitle: v })} />
          </CmsField>
          <CmsField label="Shop card — description" className="sm:col-span-2">
            <CmsTextInput value={hub.bottomDescription} onChange={(v) => updateHub({ bottomDescription: v })} multiline />
          </CmsField>
          <CmsField label="Shop button label">
            <CmsTextInput value={hub.bottomCta} onChange={(v) => updateHub({ bottomCta: v })} />
          </CmsField>
          <CmsField label="Shop button → page">
            <CmsRouteSelect value={hub.bottomCtaHref} onChange={(v) => updateHub({ bottomCtaHref: v })} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Place custom order — hero" description="/custom/order header only (wizard below)">
          <CmsField label="Back link">
            <CmsTextInput value={orderHero.backLink} onChange={(v) => updateOrderHero({ backLink: v })} />
          </CmsField>
          <CmsField label="Badge">
            <CmsTextInput value={orderHero.badge} onChange={(v) => updateOrderHero({ badge: v })} />
          </CmsField>
          <CmsField label="Title" className="sm:col-span-2">
            <CmsTextInput value={orderHero.title} onChange={(v) => updateOrderHero({ title: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={orderHero.description} onChange={(v) => updateOrderHero({ description: v })} multiline />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Order wizard — intro" description="Section above the 3-step indicator">
          <CmsField label="Eyebrow" className="sm:col-span-2">
            <CmsTextInput value={wizard.eyebrow} onChange={(v) => updateWizard({ eyebrow: v })} />
          </CmsField>
          <CmsField label="Title">
            <CmsTextInput value={wizard.title} onChange={(v) => updateWizard({ title: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={wizard.description} onChange={(v) => updateWizard({ description: v })} multiline />
          </CmsField>
          {wizard.stepLabels.map((label, index) => (
            <div key={index}>
              <CmsField label={`Step ${index + 1} tab label`}>
                <CmsTextInput
                  value={label}
                  onChange={(v) => {
                    const next = [...wizard.stepLabels];
                    next[index] = v;
                    updateWizard({ stepLabels: next });
                  }}
                />
              </CmsField>
            </div>
          ))}
        </CmsSectionPanel>

        <CmsSectionPanel title="Wizard — Step 1: Design">
          <CmsField label="Title" className="sm:col-span-2">
            <CmsTextInput value={wizard.step1.title} onChange={(v) => updateStep1({ title: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={wizard.step1.description} onChange={(v) => updateStep1({ description: v })} multiline />
          </CmsField>
          <CmsField label="Upload label">
            <CmsTextInput value={wizard.step1.uploadLabel} onChange={(v) => updateStep1({ uploadLabel: v })} />
          </CmsField>
          <CmsField label="Upload placeholder">
            <CmsTextInput value={wizard.step1.uploadPlaceholder} onChange={(v) => updateStep1({ uploadPlaceholder: v })} />
          </CmsField>
          <CmsField label="Design notes label">
            <CmsTextInput value={wizard.step1.designNotesLabel} onChange={(v) => updateStep1({ designNotesLabel: v })} />
          </CmsField>
          <CmsField label="Design notes placeholder" className="sm:col-span-2">
            <CmsTextInput
              value={wizard.step1.designNotesPlaceholder}
              onChange={(v) => updateStep1({ designNotesPlaceholder: v })}
            />
          </CmsField>
          <CmsField label="Templates hint" className="sm:col-span-2">
            <CmsTextInput value={wizard.step1.templatesHint} onChange={(v) => updateStep1({ templatesHint: v })} />
          </CmsField>
          <CmsField label="Next button">
            <CmsTextInput value={wizard.step1.nextButton} onChange={(v) => updateStep1({ nextButton: v })} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Wizard — Step 2: Specs">
          <CmsField label="Title" className="sm:col-span-2">
            <CmsTextInput value={wizard.step2.title} onChange={(v) => updateStep2({ title: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={wizard.step2.description} onChange={(v) => updateStep2({ description: v })} multiline />
          </CmsField>
          <CmsField label="Section heading: Download sheet">
            <CmsTextInput value={wizard.step2.cutHeading} onChange={(v) => updateStep2({ cutHeading: v })} />
          </CmsField>
          <CmsField label="Section heading: Upload completed sheet">
            <CmsTextInput value={wizard.step2.fabricHeading} onChange={(v) => updateStep2({ fabricHeading: v })} />
          </CmsField>
          <CmsField label="Section heading: Checklist">
            <CmsTextInput value={wizard.step2.printHeading} onChange={(v) => updateStep2({ printHeading: v })} />
          </CmsField>
          <CmsField label="Back button">
            <CmsTextInput value={wizard.step2.backButton} onChange={(v) => updateStep2({ backButton: v })} />
          </CmsField>
          <CmsField label="Next button">
            <CmsTextInput value={wizard.step2.nextButton} onChange={(v) => updateStep2({ nextButton: v })} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="Wizard — Step 3: Summary & success">
          <CmsField label="Title" className="sm:col-span-2">
            <CmsTextInput value={wizard.step3.title} onChange={(v) => updateStep3({ title: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={wizard.step3.description} onChange={(v) => updateStep3({ description: v })} multiline />
          </CmsField>
          <CmsField label="Order details heading">
            <CmsTextInput value={wizard.step3.orderDetailsHeading} onChange={(v) => updateStep3({ orderDetailsHeading: v })} />
          </CmsField>
          <CmsField label="Pricing heading">
            <CmsTextInput value={wizard.step3.pricingHeading} onChange={(v) => updateStep3({ pricingHeading: v })} />
          </CmsField>
          <CmsField label="Pricing footnote" className="sm:col-span-2">
            <CmsTextInput value={wizard.step3.pricingFootnote} onChange={(v) => updateStep3({ pricingFootnote: v })} multiline />
          </CmsField>
          <CmsField label="Contact heading">
            <CmsTextInput value={wizard.step3.contactHeading} onChange={(v) => updateStep3({ contactHeading: v })} />
          </CmsField>
          <CmsField label="Submit button">
            <CmsTextInput value={wizard.step3.submitButton} onChange={(v) => updateStep3({ submitButton: v })} />
          </CmsField>
          <CmsField label="Success title">
            <CmsTextInput value={wizard.step3.successTitle} onChange={(v) => updateStep3({ successTitle: v })} />
          </CmsField>
          <CmsField label="Success body" className="sm:col-span-2">
            <CmsTextInput value={wizard.step3.successBody} onChange={(v) => updateStep3({ successBody: v })} multiline rows={4} />
          </CmsField>
          <CmsField label="Deposit callout title">
            <CmsTextInput value={wizard.step3.depositTitle} onChange={(v) => updateStep3({ depositTitle: v })} />
          </CmsField>
          <CmsField label="Deposit callout body" className="sm:col-span-2">
            <CmsTextInput value={wizard.step3.depositBody} onChange={(v) => updateStep3({ depositBody: v })} multiline />
          </CmsField>
          <CmsField label="Account hint" className="sm:col-span-2">
            <CmsTextInput value={wizard.step3.accountHint} onChange={(v) => updateStep3({ accountHint: v })} multiline />
          </CmsField>
          <CmsField label="New order button">
            <CmsTextInput value={wizard.step3.newOrderButton} onChange={(v) => updateStep3({ newOrderButton: v })} />
          </CmsField>
          <CmsField label="Back button">
            <CmsTextInput value={wizard.step3.backButton} onChange={(v) => updateStep3({ backButton: v })} />
          </CmsField>
        </CmsSectionPanel>

        <div id="templates-cms">
          <HeadwearOptionsEditor />

          <CmsSectionPanel
            title="Templates page — hero"
            description="/custom/templates header copy. Downloadable OG files are managed on Templates."
          >
            <CmsField label="Back link">
              <CmsTextInput value={templatesPage.backLink} onChange={(v) => updateTemplatesPage({ backLink: v })} />
            </CmsField>
            <CmsField label="Eyebrow">
              <CmsTextInput value={templatesPage.eyebrow} onChange={(v) => updateTemplatesPage({ eyebrow: v })} />
            </CmsField>
            <CmsField label="Title" className="sm:col-span-2">
              <CmsTextInput value={templatesPage.title} onChange={(v) => updateTemplatesPage({ title: v })} />
            </CmsField>
            <CmsField label="Description" className="sm:col-span-2">
              <CmsTextInput
                value={templatesPage.description}
                onChange={(v) => updateTemplatesPage({ description: v })}
                multiline
                rows={4}
              />
            </CmsField>
            <CmsField label="Hero CTA">
              <CmsTextInput value={templatesPage.ctaPlaceOrder} onChange={(v) => updateTemplatesPage({ ctaPlaceOrder: v })} />
            </CmsField>
            <CmsField label="Library eyebrow">
              <CmsTextInput value={templatesPage.libraryEyebrow} onChange={(v) => updateTemplatesPage({ libraryEyebrow: v })} />
            </CmsField>
            <CmsField label="Library title">
              <CmsTextInput value={templatesPage.libraryTitle} onChange={(v) => updateTemplatesPage({ libraryTitle: v })} />
            </CmsField>
            <CmsField label="Library description" className="sm:col-span-2">
              <CmsTextInput
                value={templatesPage.libraryDescription}
                onChange={(v) => updateTemplatesPage({ libraryDescription: v })}
                multiline
              />
            </CmsField>
            <CmsField label="Empty state title">
              <CmsTextInput value={templatesPage.emptyTitle} onChange={(v) => updateTemplatesPage({ emptyTitle: v })} />
            </CmsField>
            <CmsField label="Empty state description" className="sm:col-span-2">
              <CmsTextInput
                value={templatesPage.emptyDescription}
                onChange={(v) => updateTemplatesPage({ emptyDescription: v })}
                multiline
              />
            </CmsField>
            <CmsField label="Empty state CTA">
              <CmsTextInput value={templatesPage.emptyCta} onChange={(v) => updateTemplatesPage({ emptyCta: v })} />
            </CmsField>
          </CmsSectionPanel>
        </div>
      </div>
    </div>
  );
}
