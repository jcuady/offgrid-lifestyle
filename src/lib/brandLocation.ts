/** Canonical OFFGRID storefront location — Contact, Footer, About, SEO. */
export const BRAND_LOCATION = {
  street: "5 Mt Everest",
  city: "Marikina",
  postalCode: "1800",
  region: "Metro Manila",
  country: "Philippines",
  /** Full single-line address for UI. */
  line: "5 Mt Everest, Marikina, 1800 Metro Manila",
  shortLabel: "Marikina, Metro Manila",
  localityLabel: "Marikina, PH",
  mapsQuery: "5 Mt Everest Marikina 1800 Metro Manila",
  /** Mount Everest Street, 1800 Marikina (OpenStreetMap road centroid). */
  latitude: 14.6296225,
  longitude: 121.1037419,
} as const;

export function brandMapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND_LOCATION.mapsQuery)}`;
}
