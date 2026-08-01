/** Retail apparel size chart — garment measurements in inches (side-seam chest, HPS length). */

export interface RetailSizingRow {
  size: string;
  chest: string;
  length: string;
  waist: string;
}

export const RETAIL_SIZING_ROWS: RetailSizingRow[] = [
  { size: "2XS", chest: "16.5", length: "25", waist: "24–26" },
  { size: "XS", chest: "18", length: "26", waist: "26–28" },
  { size: "S", chest: "19", length: "27", waist: "28–30" },
  { size: "M", chest: "20", length: "28", waist: "30–32" },
  { size: "L", chest: "21.5", length: "29", waist: "32–34" },
  { size: "XL", chest: "23", length: "30", waist: "34–36" },
  { size: "2XL", chest: "24.5", length: "31", waist: "36–38" },
  { size: "3XL", chest: "26", length: "32", waist: "38–40" },
  { size: "4XL", chest: "27.5", length: "33", waist: "40–42" },
  { size: "5XL", chest: "29", length: "34", waist: "42–44" },
];

export const RETAIL_SIZING_TIPS = [
  "Chest: measure across the front, side seam to side seam (garment flat).",
  "Length: high point of shoulder (HPS) down the center back.",
  "Between sizes? Size up for a roomier athletic fit.",
] as const;

export function retailSizingRowsForProduct(sizes: string[]): RetailSizingRow[] {
  if (!sizes.length) return RETAIL_SIZING_ROWS;
  const wanted = new Set(sizes.map((s) => s.trim().toUpperCase()));
  const filtered = RETAIL_SIZING_ROWS.filter((row) => wanted.has(row.size.toUpperCase()));
  return filtered.length > 0 ? filtered : RETAIL_SIZING_ROWS;
}
