/** Fixed copy for /custom, /custom/order, and the order wizard — text only (images in guide panels). */

import { sanitizeCmsHref } from "@/src/lib/cmsNavigation";

export const CUSTOM_PROCESS_STEP_COUNT = 6;
export const CUSTOM_WIZARD_STEP_COUNT = 3;
export const CUSTOM_HERO_FACT_COUNT = 4;
export const CUSTOM_SIZING_ROW_COUNT = 3;

export interface CustomProcessStepCopy {
  label: string;
  description: string;
}

export interface CustomHeroFact {
  value: string;
  label: string;
}

export interface CustomSizingRow {
  size: string;
  chest: string;
  length: string;
  waist: string;
}

export interface CustomDesignSupportCard {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  checklistTitle?: string;
  checklistItems?: string[];
}

export interface CustomHubPageContent {
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2Italic: string;
  heroDescription: string;
  ctaPlaceOrder: string;
  ctaPlaceOrderHref: string;
  ctaOrderingGuide: string;
  ctaOrderingGuideHref: string;
  ctaTemplates: string;
  ctaTemplatesHref: string;
  heroFacts: CustomHeroFact[];
  heroScrollCue: string;
  howItWorksTitle: string;
  howItWorksHeading: string;
  howItWorksDescription: string;
  processSteps: CustomProcessStepCopy[];
  designSectionEyebrow: string;
  designSectionTitle: string;
  designOwnArtwork: CustomDesignSupportCard;
  designFreeSupport: CustomDesignSupportCard;
  guideEyebrow: string;
  guideTitle: string;
  guideDescription: string;
  sizingPreviewTitle: string;
  sizingPreviewCaption: string;
  sizingRows: CustomSizingRow[];
  primaryClosingEyebrow: string;
  primaryClosingTitle: string;
  primaryClosingDescription: string;
  primaryClosingCtaLabel: string;
  primaryClosingCtaHref: string;
  primaryClosingSecondaryLabel: string;
  primaryClosingSecondaryHref: string;
  bottomTitle: string;
  bottomDescription: string;
  bottomCta: string;
  bottomCtaHref: string;
}

export interface CustomOrderHeroContent {
  backLink: string;
  badge: string;
  title: string;
  description: string;
}

export interface CustomWizardStepContent {
  title: string;
  description: string;
}

export interface CustomWizardPageContent {
  eyebrow: string;
  title: string;
  description: string;
  stepLabels: string[];
  step1: CustomWizardStepContent & {
    uploadLabel: string;
    uploadPlaceholder: string;
    designNotesLabel: string;
    designNotesPlaceholder: string;
    templatesHint: string;
    nextButton: string;
  };
  step2: CustomWizardStepContent & {
    cutHeading: string;
    fabricHeading: string;
    printHeading: string;
    orderKitDownloadHeading: string;
    orderKitDownloadDescription: string;
    orderKitDownloadButton: string;
    orderKitUploadHeading: string;
    orderKitUploadPlaceholder: string;
    orderKitChecklistHeading: string;
    backButton: string;
    nextButton: string;
  };
  step3: CustomWizardStepContent & {
    orderDetailsHeading: string;
    pricingHeading: string;
    pricingFootnote: string;
    contactHeading: string;
    submitButton: string;
    successTitle: string;
    successBody: string;
    depositTitle: string;
    depositBody: string;
    accountHint: string;
    newOrderButton: string;
    backButton: string;
  };
}

export interface CustomTemplatesPageContent {
  backLink: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaPlaceOrder: string;
  libraryEyebrow: string;
  libraryTitle: string;
  libraryDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCta: string;
}

export interface CustomPageContent {
  hub: CustomHubPageContent;
  orderHero: CustomOrderHeroContent;
  wizard: CustomWizardPageContent;
  templatesPage: CustomTemplatesPageContent;
}

function normalizeHeroFacts(facts: CustomHeroFact[] | undefined): CustomHeroFact[] {
  const seed = initialCustomPageContent.hub.heroFacts;
  const next = [...(facts ?? [])];
  while (next.length < CUSTOM_HERO_FACT_COUNT) {
    next.push(seed[next.length]!);
  }
  return next.slice(0, CUSTOM_HERO_FACT_COUNT);
}

function normalizeSizingRows(rows: CustomSizingRow[] | undefined): CustomSizingRow[] {
  const seed = initialCustomPageContent.hub.sizingRows;
  const next = [...(rows ?? [])];
  while (next.length < CUSTOM_SIZING_ROW_COUNT) {
    next.push(seed[next.length]!);
  }
  return next.slice(0, CUSTOM_SIZING_ROW_COUNT);
}

function normalizeDesignCard(
  card: Partial<CustomDesignSupportCard> | undefined,
  seed: CustomDesignSupportCard,
): CustomDesignSupportCard {
  return {
    ...seed,
    ...card,
    ctaHref: sanitizeCmsHref(card?.ctaHref ?? seed.ctaHref, seed.ctaHref),
    checklistItems: card?.checklistItems ?? seed.checklistItems,
  };
}

/** Guarantees fixed step counts after partial edits or old localStorage. */
export function normalizeCustomPageContent(page: CustomPageContent): CustomPageContent {
  const seedHub = initialCustomPageContent.hub;
  const hubIn = { ...seedHub, ...page.hub };

  const processSteps = [...hubIn.processSteps];
  while (processSteps.length < CUSTOM_PROCESS_STEP_COUNT) {
    processSteps.push(seedHub.processSteps[processSteps.length]!);
  }

  const stepLabels = [...page.wizard.stepLabels];
  while (stepLabels.length < CUSTOM_WIZARD_STEP_COUNT) {
    stepLabels.push(initialCustomPageContent.wizard.stepLabels[stepLabels.length] ?? `Step ${stepLabels.length + 1}`);
  }

  return {
    ...page,
    hub: {
      ...hubIn,
      ctaPlaceOrderHref: sanitizeCmsHref(hubIn.ctaPlaceOrderHref, seedHub.ctaPlaceOrderHref),
      ctaOrderingGuideHref: sanitizeCmsHref(hubIn.ctaOrderingGuideHref, seedHub.ctaOrderingGuideHref),
      ctaTemplatesHref: sanitizeCmsHref(hubIn.ctaTemplatesHref, seedHub.ctaTemplatesHref),
      heroFacts: normalizeHeroFacts(hubIn.heroFacts),
      heroScrollCue: hubIn.heroScrollCue || seedHub.heroScrollCue,
      howItWorksHeading: hubIn.howItWorksHeading || seedHub.howItWorksHeading,
      howItWorksDescription: hubIn.howItWorksDescription || seedHub.howItWorksDescription,
      designSectionEyebrow: hubIn.designSectionEyebrow || seedHub.designSectionEyebrow,
      designSectionTitle: hubIn.designSectionTitle || seedHub.designSectionTitle,
      designOwnArtwork: normalizeDesignCard(hubIn.designOwnArtwork, seedHub.designOwnArtwork),
      designFreeSupport: normalizeDesignCard(hubIn.designFreeSupport, seedHub.designFreeSupport),
      sizingRows: normalizeSizingRows(hubIn.sizingRows),
      primaryClosingEyebrow: hubIn.primaryClosingEyebrow || seedHub.primaryClosingEyebrow,
      primaryClosingTitle: hubIn.primaryClosingTitle || seedHub.primaryClosingTitle,
      primaryClosingDescription: hubIn.primaryClosingDescription || seedHub.primaryClosingDescription,
      primaryClosingCtaLabel: hubIn.primaryClosingCtaLabel || seedHub.primaryClosingCtaLabel,
      primaryClosingCtaHref: sanitizeCmsHref(hubIn.primaryClosingCtaHref, seedHub.primaryClosingCtaHref),
      primaryClosingSecondaryLabel: hubIn.primaryClosingSecondaryLabel || seedHub.primaryClosingSecondaryLabel,
      primaryClosingSecondaryHref: sanitizeCmsHref(hubIn.primaryClosingSecondaryHref, seedHub.primaryClosingSecondaryHref),
      bottomCtaHref: sanitizeCmsHref(hubIn.bottomCtaHref, seedHub.bottomCtaHref),
      processSteps: processSteps.slice(0, CUSTOM_PROCESS_STEP_COUNT),
    },
    wizard: {
      ...page.wizard,
      stepLabels: stepLabels.slice(0, CUSTOM_WIZARD_STEP_COUNT),
      step2: { ...initialCustomPageContent.wizard.step2, ...page.wizard.step2 },
    },
    templatesPage: { ...initialCustomPageContent.templatesPage, ...page.templatesPage },
  };
}

export const initialCustomPageContent: CustomPageContent = {
  hub: {
    heroEyebrow: "Custom Orders",
    heroTitleLine1: "Made for Your Team.",
    heroTitleLine2Italic: "Crafted Your Way.",
    heroDescription:
      "Create custom apparel designed around your identity. From clubs and communities to businesses and events, every piece is made with the same commitment to comfort, movement, and craftsmanship.\n\nBrowse catalogs, explore sizing, and review production timelines below. When you're ready, submit your request through our order page.",
    ctaPlaceOrder: "Place custom order",
    ctaPlaceOrderHref: "/custom/order",
    ctaOrderingGuide: "Ordering guide",
    ctaOrderingGuideHref: "/custom#ordering-guide",
    ctaTemplates: "Templates",
    ctaTemplatesHref: "/custom/templates",
    heroFacts: [
      { value: "10 pcs", label: "Minimum / design" },
      { value: "Free", label: "Design support" },
      { value: "5–10 days", label: "Production" },
      { value: "Nationwide", label: "Shipping + tracking" },
    ],
    heroScrollCue: "Scroll to explore",
    howItWorksTitle: "How it works",
    howItWorksHeading: "From idea to delivery in six steps",
    howItWorksDescription:
      "Tap any step to see exactly what happens — so you always know what's next, from first brief to tracked shipment.",
    processSteps: [
      { label: "Know the details", description: "Check the product catalog, size chart, lead time, and minimum order quantity." },
      { label: "Customize your gear", description: "Use your own design file or work with OffGrid to create your team design." },
      { label: "Collect order details", description: "Gather names, numbers, sizes, quantities, and product types using the order kit." },
      { label: "Submit your order", description: "Send the completed order form so OffGrid can review and confirm the next steps." },
      { label: "Production starts", description: "OffGrid creates the first unit, confirms details, then proceeds to mass production." },
      { label: "Shipping", description: "Tracking details and warranty information are sent once the order ships." },
    ],
    designSectionEyebrow: "Design with OffGrid",
    designSectionTitle: "Your artwork, production-ready",
    designOwnArtwork: {
      eyebrow: "Artwork format",
      title: "Bring Your Own Design",
      body: "Drop your artwork into an OffGrid template and submit final files as Adobe Illustrator (.AI) in CMYK for true-to-print results. Not on Illustrator? Send any format — we'll help convert it for production.",
      ctaLabel: "Get design templates",
      ctaHref: "/custom/templates",
    },
    designFreeSupport: {
      eyebrow: "Free support",
      title: "No Designer? No Problem.",
      body: "Design fees are on us. Share a concept, rough sketch, or reference pegs and our team turns it into a production-ready OffGrid layout.",
      ctaLabel: "Start custom order",
      ctaHref: "/custom/order",
      checklistTitle: "Quick brief checklist",
      checklistItems: [
        "Fonts: team name, player text, preferred style",
        "Colors: primary palette plus accents",
        "Elements: high-res logos, icons, pattern references",
      ],
    },
    guideEyebrow: "Learn before you quote",
    guideTitle: "Ordering guide",
    guideDescription: "Expand a section for full details, sizing, and downloadable templates.",
    sizingPreviewTitle: "Sample sizing preview",
    sizingPreviewCaption: "Illustrative only — confirm measurements for your roster before production.",
    sizingRows: [
      { size: "XS", chest: "18", length: "26", waist: "26-28" },
      { size: "M", chest: "20", length: "28", waist: "30-32" },
      { size: "XL", chest: "22", length: "30", waist: "34-36" },
    ],
    primaryClosingEyebrow: "Ready when you are",
    primaryClosingTitle: "Start your team order",
    primaryClosingDescription:
      "Submit your design and roster — we handle production from first unit to tracked delivery.",
    primaryClosingCtaLabel: "Place custom order",
    primaryClosingCtaHref: "/custom/order",
    primaryClosingSecondaryLabel: "Templates",
    primaryClosingSecondaryHref: "/custom/templates",
    bottomTitle: "Looking for ready-made?",
    bottomDescription: "Browse our collection of premium sportswear — in stock, ready to ship.",
    bottomCta: "Shop collection",
    bottomCtaHref: "/shop",
  },
  orderHero: {
    backLink: "Back to ordering guide",
    badge: "Team orders",
    title: "Submit your team order",
    description: "Use our order kit to collect full roster details, then submit your design and completed sheet for review.",
  },
  wizard: {
    eyebrow: "Team order workflow",
    title: "Build your team order",
    description: "Three quick form steps that map to the standard custom-order process: design, specs and roster, then review for quote confirmation.",
    stepLabels: ["Design", "Specs & roster", "Review & submit"],
    step1: {
      title: "Customize Your Gear",
      description:
        "Upload your artwork or brief and align with OffGrid design support. We recommend AI in CMYK, but we can work with other formats too.",
      uploadLabel: "Upload Design File",
      uploadPlaceholder: "Click to browse or drag your file here",
      designNotesLabel: "Design Notes (Optional)",
      designNotesPlaceholder: "Describe your vision — colors, placement, special instructions…",
      templatesHint: "Need a base layout? Browse all templates.",
      nextButton: "Next: Team order kit",
    },
    step2: {
      title: "Product specs & order kit",
      description:
        "Choose cut, fabric, and print method (like a standard custom apparel flow), then download and upload your completed team order sheet.",
      cutHeading: "Select cut & style",
      fabricHeading: "Select fabric",
      printHeading: "Select print method",
      orderKitDownloadHeading: "Download team order sheet",
      orderKitDownloadDescription:
        "Download the OffGrid roster sheet so names, numbers, sizes, quantities, and product types are complete before submission.",
      orderKitDownloadButton: "Download order kit (.xlsx)",
      orderKitUploadHeading: "Upload completed sheet",
      orderKitUploadPlaceholder: "Upload completed team order sheet",
      orderKitChecklistHeading: "Required checklist",
      backButton: "Back",
      nextButton: "Next: Review & submit",
    },
    step3: {
      title: "Review & Submit",
      description: "Confirm your files and contact details so we can validate and send next steps.",
      orderDetailsHeading: "Order Details",
      pricingHeading: "Quote & confirmation",
      pricingFootnote: "* Final pricing and deposit are confirmed after order-sheet review and mockup validation.",
      contactHeading: "Contact Details",
      submitButton: "Submit Team Order",
      successTitle: "Team Order Submitted",
      successBody:
        "Our team will review your files and completed order sheet, then send your quote and production confirmation steps within 1–2 business days.",
      depositTitle: "Production starts after confirmation",
      depositBody: "We confirm quote, mockup, and deposit schedule before full production starts.",
      accountHint:
        "After sign in, open My orders to track review, official quote, and shipping updates.",
      newOrderButton: "Start New Order",
      backButton: "Back",
    },
  },
  templatesPage: {
    backLink: "Back to ordering guide",
    eyebrow: "Templates",
    title: "Download packs",
    description:
      "Artwork templates with safe zones and bleed guides. Download here, then use Place custom order in the nav when you are ready to submit a quote.",
    ctaPlaceOrder: "Place custom order",
    libraryEyebrow: "Est. MANILA, PH",
    libraryTitle: "Template library",
    libraryDescription:
      "Safe zones and bleed are marked in each pack. Need a different format? Note it in your custom order brief.",
    emptyTitle: "No templates published yet",
    emptyDescription: "When your team publishes template packs, they will appear here for download.",
    emptyCta: "Back to ordering guide",
  },
};
