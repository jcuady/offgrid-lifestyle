/** Shared layout + typography tokens (Swiss 721 + TG Frekuent Mono). */

/** Storefront sections — matches Tailwind `container` with consistent gutters. */
export const siteContainer = "container mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-12";

/** Header row gutters — slightly tighter than page sections so actions stay reachable. */
export const headerContainer =
  "mx-auto grid w-full max-w-7xl min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-[clamp(0.5rem,2vw,1.5rem)] px-[clamp(0.75rem,3vw,3rem)]";

/** Fluid brand mark — scales with viewport without jumping breakpoints. */
export const headerLogoClass =
  "h-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)] w-auto max-w-[min(42vw,11rem)] object-contain object-left";

/** Desktop nav link — fluid type + tap-friendly hit area. */
export const headerNavLinkClass =
  "inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-1.5 text-[clamp(0.72rem,0.62rem+0.28vw,0.875rem)] font-medium tracking-tight transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-cream/50";

/** Account / portal customer pages — fluid width, capped readable line length. */
export const accountContainer = "mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6 md:px-8 lg:px-10";

/** Shared surface for customer account panels (profile, settings, order cards). */
export const accountPanel =
  "min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.08] sm:p-6";

/** Mobile account bottom dock clearance (nav + safe area). */
export const accountMobileDockPad =
  "pb-[max(5.5rem,calc(4.25rem+env(safe-area-inset-bottom,0px)))] lg:pb-20";

/** Inner marketing page heroes (Shop, About, Contact, Custom…) — not the home OffgridHero. */
export const marketingPageHero =
  "relative overflow-hidden bg-offgrid-green pb-12 pt-[max(7rem,calc(var(--og-header-height,4.5rem)+1.75rem))] text-offgrid-cream sm:pb-16";

export const marketingPageHeroDark =
  "relative overflow-hidden bg-offgrid-dark pb-12 pt-[max(7rem,calc(var(--og-header-height,4.5rem)+1.75rem))] text-offgrid-cream sm:pb-16";

/** Sticky bars below the fixed storefront nav (safe-area aware, tracks live header height). */
export const stickyBelowNav =
  "md:sticky md:top-[calc(var(--og-header-height,4.5rem)+env(safe-area-inset-top,0px))]";

export const sectionEyebrow =
  "mb-3 block font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-green/60";

export const sectionEyebrowOnDark =
  "mb-3 block font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream/60";

/** Small TG Frekuent Mono labels — eyebrows, badges, meta (always bold). */
export const monoLabel =
  "font-mono text-xs font-bold uppercase tracking-[0.2em]";

export const monoLabelOnDark = `${monoLabel} text-offgrid-cream/75`;

export const monoLabelOnLight = `${monoLabel} text-offgrid-green/60`;

/** High-contrast primary CTA used across storefront collection sections. */
export const electricBluePill =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-offgrid-lime px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:bg-offgrid-gold hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 active:translate-y-px";

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
