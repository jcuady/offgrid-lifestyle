/** Shared layout + typography tokens (Swiss 721 + TG Frekuent Mono). */

/** Storefront sections — matches Tailwind `container` with consistent gutters. */
export const siteContainer = "container mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-12";

/** Account / portal customer pages — fluid width, capped readable line length. */
export const accountContainer = "mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6 md:px-8 lg:px-10";

export const sectionEyebrow =
  "mb-3 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/55";

export const sectionEyebrowOnDark =
  "mb-3 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/55";

export const sectionTitle =
  "font-display font-black leading-[0.95] tracking-tight text-offgrid-green text-4xl sm:text-5xl md:text-6xl lg:text-7xl";

export const sectionTitleOnDark =
  "font-display font-black leading-[0.95] tracking-tight text-offgrid-cream text-4xl sm:text-5xl md:text-6xl lg:text-7xl";

export const sectionPaddingCream = "py-16 sm:py-20 md:py-24";

export const sectionPaddingDark = "py-20 sm:py-24 md:py-28";

export const accountHeroTitle =
  "mt-2 font-display text-3xl font-black tracking-tight text-offgrid-cream sm:text-4xl md:text-5xl";

export const accountPageTitle =
  "mt-2 break-words font-display text-3xl font-black tracking-tight text-offgrid-green sm:text-4xl";

export const accountPriceDisplay =
  "mt-1 font-display text-2xl font-black tabular-nums tracking-tight text-offgrid-green sm:text-3xl";

/** Centered section header (eyebrow + title stack). */
export const sectionHeaderCenter = "flex flex-col items-center text-center";

/** Long order IDs and monospace labels in account hero. */
export const accountHeroMonoTitle =
  "mt-2 break-all font-mono text-2xl font-bold tracking-tight text-offgrid-cream sm:text-3xl md:text-4xl";
