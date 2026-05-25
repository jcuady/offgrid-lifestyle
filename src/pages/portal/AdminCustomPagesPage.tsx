import { useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  CmsField,
  CmsImageInput,
  CmsSectionPanel,
  CmsTextInput,
} from "@/src/components/admin/landing/CmsField";
import { FIXED_GUIDE_CTA_HREF, resolveGuideSections } from "@/src/lib/customGuideSections";
import type { CustomSectionSlug } from "@/src/store/useSiteContentStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { TemplateSlotsEditor } from "@/src/components/admin/custom/TemplateSlotsEditor";
import { Button } from "@/src/components/ui/Button";
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
  const updateTemplatesPage = useSiteContentStore((s) => s.updateCustomTemplatesPage);

  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id ?? "");
  const selected = sections.find((s) => s.id === selectedSectionId) ?? sections[0];

  const updateSelected = (patch: Parameters<typeof updateCustomSection>[1]) => {
    if (!selected) return;
    updateCustomSection(selected.id, patch);
  };

  const confirmResetAll = () => {
    if (
      window.confirm(
        "Reset all custom page copy, guide panels, and template slots to defaults?",
      )
    ) {
      resetCustomPageContent();
      resetCustomGuideSections();
    }
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Content</p>
          <h1 className="mt-1 font-display text-3xl font-black text-offgrid-green">Custom pages</h1>
          <p className="mt-2 max-w-xl text-sm text-offgrid-green/60">
            Ordering guide (<code className="text-xs">/custom</code>), templates (
            <code className="text-xs">/custom/templates</code>), place order (
            <code className="text-xs">/custom/order</code>), and wizard copy. Layout is fixed — edit text and images
            only. Template downloads use bundled files unless you upload a per-slot override (browser-local in this MVP).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

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
          <CmsField label="CTA — ordering guide">
            <CmsTextInput value={hub.ctaOrderingGuide} onChange={(v) => updateHub({ ctaOrderingGuide: v })} />
          </CmsField>
          <CmsField label="CTA — templates">
            <CmsTextInput value={hub.ctaTemplates} onChange={(v) => updateHub({ ctaTemplates: v })} />
          </CmsField>
        </CmsSectionPanel>

        <CmsSectionPanel title="How it works" description="Three fixed steps on /custom (icons are fixed).">
          <CmsField label="Section title" className="sm:col-span-2">
            <CmsTextInput value={hub.howItWorksTitle} onChange={(v) => updateHub({ howItWorksTitle: v })} />
          </CmsField>
          {hub.processSteps.map((step, index) => (
            <div key={index} className="contents">
              <CmsField label={`Step ${index + 1} label`}>
                <CmsTextInput
                  value={step.label}
                  onChange={(v) => updateProcessStep(index as 0 | 1 | 2, { label: v })}
                />
              </CmsField>
              <CmsField label={`Step ${index + 1} description`}>
                <CmsTextInput
                  value={step.description}
                  onChange={(v) => updateProcessStep(index as 0 | 1 | 2, { description: v })}
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
            description={`Deep link: /custom#${selected.slug} · CTA route: ${FIXED_GUIDE_CTA_HREF[selected.slug]} (fixed)`}
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

        <CmsSectionPanel title="Ordering guide — shop CTA" description="Bottom band on /custom">
          <CmsField label="Title" className="sm:col-span-2">
            <CmsTextInput value={hub.bottomTitle} onChange={(v) => updateHub({ bottomTitle: v })} />
          </CmsField>
          <CmsField label="Description" className="sm:col-span-2">
            <CmsTextInput value={hub.bottomDescription} onChange={(v) => updateHub({ bottomDescription: v })} multiline />
          </CmsField>
          <CmsField label="Button label">
            <CmsTextInput value={hub.bottomCta} onChange={(v) => updateHub({ bottomCta: v })} />
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
          <CmsField label="Cut heading">
            <CmsTextInput value={wizard.step2.cutHeading} onChange={(v) => updateStep2({ cutHeading: v })} />
          </CmsField>
          <CmsField label="Fabric heading">
            <CmsTextInput value={wizard.step2.fabricHeading} onChange={(v) => updateStep2({ fabricHeading: v })} />
          </CmsField>
          <CmsField label="Print heading">
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
          <CmsSectionPanel title="Templates page — hero" description="/custom/templates header">
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

          <TemplateSlotsEditor />
        </div>
      </div>
    </div>
  );
}
