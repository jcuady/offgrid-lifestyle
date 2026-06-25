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
    heroEyebrow: "Custom Orders",
    heroTitleLine1: "Made for Your Team.",
    heroTitleLine2Italic: "Crafted Your Way.",
    heroDescription:
      "Create custom apparel designed around your identity. From clubs and communities to businesses and events, every piece is made with the same commitment to comfort, movement, and craftsmanship. Browse catalogs, explore sizing, and review production timelines below. When you're ready, submit your request through our order page.",
    ctaPlaceOrder: "Place custom order",
    ctaOrderingGuide: "Ordering guide",
    ctaTemplates: "Templates",
    howItWorksTitle: "How it works",
    processSteps: [
      { label: "Know details", description: "Review catalog, size chart, lead times, and minimum order quantities." },
      { label: "Customize", description: "Prepare your design and complete the team order kit sheet." },
      { label: "Submit", description: "Upload files for quote review, production confirmation, and shipping updates." },
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
    badge: "Team orders",
    title: "Submit your team order",
    description: "Use our order kit to collect full roster details, then submit your design and completed sheet for review.",
  },
  wizard: {
    eyebrow: "Team order workflow",
    title: "Build your team order",
    description: "Three quick steps: customize design, complete the order sheet, and submit your request for review.",
    stepLabels: ["Customize", "Order kit", "Submit"],
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
      title: "Collect Order Details",
      description: "Download the team order sheet and complete names, numbers, sizes, quantities, and product types.",
      cutHeading: "Download team order sheet",
      fabricHeading: "Upload completed sheet",
      printHeading: "Required checklist",
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
