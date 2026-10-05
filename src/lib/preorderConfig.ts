/**
 * Configuration and domain rules for The Social Club Collection Pre-Order campaign.
 */

export const PREORDER_PRODUCT_SLUG = "the-social-club-collection";
export const PREORDER_PATH = "/pre-order/social-club";

export const PREORDER_SRP = 800;
export const PREORDER_DISCOUNT_PERCENT = 5;
export const PREORDER_PRICE = 760; // 800 * 0.95 = 760 PHP
export const PREORDER_MAX_SLOTS = 30;

// Philippine Standard Time (PST / UTC+8)
export const PREORDER_START_ISO = "2026-10-05T00:00:00+08:00";
export const PREORDER_END_ISO = "2026-10-09T23:59:59+08:00";
export const OFFICIAL_RELEASE_ISO = "2026-10-15T00:00:00+08:00";

export type PreorderVenueId = "kado_kohi" | "manila_bloc";

export interface PreorderPickupVenue {
  id: PreorderVenueId;
  name: string;
  tagline: string;
  availableDate: string;
  locationDetails: string;
  mapsUrl?: string;
  notes: string;
}

export const PREORDER_VENUES: Record<PreorderVenueId, PreorderPickupVenue> = {
  kado_kohi: {
    id: "kado_kohi",
    name: "Kado Kohi — Marikina Branch",
    tagline: "Cafe Pickup Partner",
    availableDate: "Starting October 15, 2026",
    locationDetails: "Kado Kohi Marikina, Metro Manila",
    mapsUrl: "https://maps.app.goo.gl/ztDaXVxnnDNM2HNi9",
    notes: "Claim your order directly at Kado Kohi Marikina starting Oct 15. Present your Order ID and valid ID upon claiming.",
  },
  manila_bloc: {
    id: "manila_bloc",
    name: "Manila Bloc Fest — Pop-up Booth",
    tagline: "Event Pop-up Activation",
    availableDate: "October 17 & 18, 2026 (Full Duration)",
    locationDetails: "Manila Bloc Fest, OFFGRID Pop-up Booth",
    notes: "Claim your order at the OFFGRID Pop-up Booth during the full duration of Manila Bloc Fest (Oct 17–18). Present your Order ID.",
  },
};

export interface PreorderDesign {
  id: string;
  name: string;
  image: string;
  tagline: string;
}

export const PREORDER_DESIGNS: PreorderDesign[] = [
  {
    id: "Chill Sunday",
    name: "Chill Sunday",
    image: "/images/products/social-club-chill-sunday.webp",
    tagline: "Slow mornings, easy living, Sunday state of mind.",
  },
  {
    id: "Coffee and Cup",
    name: "Coffee and Cup",
    image: "/images/products/social-club-coffee-cup.webp",
    tagline: "Brewed for the daily hustle and sideline conversations.",
  },
  {
    id: "Dink and Drink",
    name: "Dink and Drink",
    image: "/images/products/social-club-dink-drink.webp",
    tagline: "On-court rallies, off-court refreshments.",
  },
  {
    id: "Matcha Therapy",
    name: "Matcha Therapy",
    image: "/images/products/social-club-matcha-therapy.webp",
    tagline: "Calm focus, grounded energy, pure lifestyle.",
  },
];

export const PREORDER_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"] as const;

export type PreorderPaymentMethod = "gcash" | "bdo";

export interface PreorderPaymentOption {
  id: PreorderPaymentMethod;
  name: string;
  badge: string;
  qrImage: string;
  fallbackQrImage: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  referenceHint: string;
}

export const PREORDER_PAYMENT_CONFIG: Record<PreorderPaymentMethod, PreorderPaymentOption> = {
  gcash: {
    id: "gcash",
    name: "GCash QR",
    badge: "InstaPay / GCash",
    qrImage: "/payment-qr/gcash.jpg",
    fallbackQrImage: "/payment qr/GCASH.jpg",
    accountName: "DO****C KE****H D.",
    accountNumber: "0917 147 0418",
    instructions:
      "Scan the QR code with your GCash app or transfer to the account above. Please include your Order ID in the payment message/remarks.",
    referenceHint: "GCash Ref. No. (e.g. 100234567890)",
  },
  bdo: {
    id: "bdo",
    name: "BDO QR",
    badge: "BDO Unibank / InstaPay",
    qrImage: "/payment-qr/bdo.jpg",
    fallbackQrImage: "/payment qr/BDO.jpg",
    accountName: "OGLifestylePH",
    accountNumber: "011340033559",
    instructions:
      "Scan the QR code with BDO Pay or any InstaPay banking app, or transfer directly to BDO Account 011340033559 (OGLifestylePH). Please include your Order ID in the transfer remarks.",
    referenceHint: "BDO / InstaPay Ref. No. (e.g. 0123456789)",
  },
};

export function isPreorderWindowActive(now: Date = new Date()): boolean {
  const start = new Date(PREORDER_START_ISO).getTime();
  const end = new Date(PREORDER_END_ISO).getTime();
  const current = now.getTime();
  return current >= start && current <= end;
}

export function isPreorderWindowClosed(now: Date = new Date()): boolean {
  const end = new Date(PREORDER_END_ISO).getTime();
  return now.getTime() > end;
}

export function isOfficialReleaseLive(now: Date = new Date()): boolean {
  const release = new Date(OFFICIAL_RELEASE_ISO).getTime();
  return now.getTime() >= release;
}
