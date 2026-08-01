/** Apparel size presets + custom size helpers for admin product CRUD. */

export const SIZE_PRESETS = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"] as const;

export type SizePreset = (typeof SIZE_PRESETS)[number];

export function normalizeSizeToken(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "-");
}

export function normalizeSizes(values: readonly string[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    const token = normalizeSizeToken(value);
    if (!token) continue;
    if (!out.includes(token)) out.push(token);
  }
  return out;
}

export function toggleSize(selected: readonly string[], size: string): string[] {
  const token = normalizeSizeToken(size);
  if (!token) return normalizeSizes(selected);
  const current = normalizeSizes(selected);
  return current.includes(token) ? current.filter((s) => s !== token) : [...current, token];
}

export function addCustomSize(selected: readonly string[], custom: string): string[] {
  const token = normalizeSizeToken(custom);
  if (!token) return normalizeSizes(selected);
  return normalizeSizes([...selected, token]);
}

export function isSizePreset(size: string): size is SizePreset {
  return (SIZE_PRESETS as readonly string[]).includes(normalizeSizeToken(size));
}
