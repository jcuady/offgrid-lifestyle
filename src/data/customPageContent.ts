/** Fixed copy for /custom, /custom/order, and the order wizard — text only (images in guide panels). */

export const CUSTOM_PROCESS_STEP_COUNT = 3;
export const CUSTOM_WIZARD_STEP_COUNT = 3;

export interface CustomProcessStepCopy {
  label: string;
  description: string;
}

export interface CustomHubPageContent {
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2Italic: string;
  heroDescription: string;
  ctaPlaceOrder: string;
  ctaOrderingGuide: string;
  ctaTemplates: string;
  howItWorksTitle: string;
  processSteps: CustomProcessStepCopy[];
  guideEyebrow: string;
  guideTitle: string;
  guideDescription: string;
  sizingPreviewTitle: string;
  sizingPreviewCaption: string;
  bottomTitle: string;
  bottomDescription: string;
  bottomCta: string;
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

/** Guarantees fixed step counts after partial edits or old localStorage. */
export function normalizeCustomPageContent(page: CustomPageContent): CustomPageContent {
  const processSteps = [...page.hub.processSteps];
  while (processSteps.length < CUSTOM_PROCESS_STEP_COUNT) {
    processSteps.push(initialCustomPageContent.hub.processSteps[processSteps.length]!);
  }

  const stepLabels = [...page.wizard.stepLabels];
  while (stepLabels.length < CUSTOM_WIZARD_STEP_COUNT) {
    stepLabels.push(initialCustomPageContent.wizard.stepLabels[stepLabels.length] ?? `Step ${stepLabels.length + 1}`);
  }

  return {
    ...page,
    hub: { ...page.hub, processSteps: processSteps.slice(0, CUSTOM_PROCESS_STEP_COUNT) },
    wizard: { ...page.wizard, stepLabels: stepLabels.slice(0, CUSTOM_WIZARD_STEP_COUNT) },
    templatesPage: { ...initialCustomPageContent.templatesPage, ...page.templatesPage },
  };
}

export const initialCustomPageContent: CustomPageContent = {
  hub: {
    heroEyebrow: "Custom orders",
    heroTitleLine1: "Build Your Teamwear",
    heroTitleLine2Italic: "The OffGrid Way",
    heroDescription:
      "Explore how to order, catalogs, sizing, and timelines below. Download templates from the nav, then place your quote on the dedicated order page.",
    ctaPlaceOrder: "Place custom order",
    ctaOrderingGuide: "Ordering guide",
    ctaTemplates: "Templates",
    howItWorksTitle: "How it works",
    processSteps: [
      { label: "Design", description: "Submit your artwork or use our template" },
      { label: "Specs", description: "Cut, fabric, and print method in one place" },
      { label: "Summary", description: "Review, get your quote, and confirm" },
    ],
    guideEyebrow: "Learn before you quote",
    guideTitle: "Ordering guide",
    guideDescription: "Expand a section for full details, sizing, and downloadable templates.",
    sizingPreviewTitle: "Sample sizing preview",
    sizingPreviewCaption: "Illustrative only — confirm measurements for your roster before production.",
    bottomTitle: "Looking for ready-made?",
    bottomDescription: "Browse our collection of premium sportswear — in stock, ready to ship.",
    bottomCta: "Shop collection",
  },
  orderHero: {
    backLink: "Back to ordering guide",
    badge: "Custom quote",
    title: "Place your custom order",
    description: "Submit your design and specs — our team will follow up with a finalized quote and deposit steps.",
  },
  wizard: {
    eyebrow: "Custom quote",
    title: "Build your order",
    description: "Three quick steps — upload your design, lock in garment specs, then review and submit for pricing.",
    stepLabels: ["Design", "Specs", "Summary"],
    step1: {
      title: "Submit Your Design",
      description: "Upload your artwork or use our template to get started. We accept PNG, JPG, PDF, and AI files.",
      uploadLabel: "Upload Design File",
      uploadPlaceholder: "Click to browse or drag your file here",
      designNotesLabel: "Design Notes (Optional)",
      designNotesPlaceholder: "Describe your vision — colors, placement, special instructions…",
      templatesHint: "Need another silhouette? Browse all templates.",
      nextButton: "Next: Garment & print specs",
    },
    step2: {
      title: "Garment & print specs",
      description: "Choose cut, fabric, and print method — everything we need to quote your run accurately.",
      cutHeading: "Cut & style",
      fabricHeading: "Fabric",
      printHeading: "Print method",
      backButton: "Back",
      nextButton: "Next: Review & submit",
    },
    step3: {
      title: "Review & Submit",
      description: "Confirm your selections and provide contact details to get your quote.",
      orderDetailsHeading: "Order Details",
      pricingHeading: "Estimated Pricing",
      pricingFootnote: "* Final pricing confirmed after design review. Deposit required before production.",
      contactHeading: "Contact Details",
      submitButton: "Submit Order Request",
      successTitle: "Request Submitted",
      successBody:
        "Our team will review your custom order and reach out within 1–2 business days with a finalized quote and next steps.",
      depositTitle: "60% Deposit Required",
      depositBody: "Estimated deposit shown below. Production begins after deposit confirmation.",
      accountHint:
        "After you sign in, open My orders under your account to see the full request and the official quote when our team posts it.",
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
