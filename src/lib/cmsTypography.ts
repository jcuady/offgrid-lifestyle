import type { CSSProperties } from "react";
import type { CmsSectionTypography, CmsTextSize } from "@/src/data/landingContent";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export const CMS_HEADING_SIZE_REM: Record<Exclude<CmsTextSize, "">, string> = {
  sm: "1.75rem",
  md: "2.25rem",
  lg: "3rem",
  xl: "3.75rem",
};

export const CMS_BODY_SIZE_REM: Record<Exclude<CmsTextSize, "">, string> = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
};

export const CMS_TEXT_SIZE_OPTIONS: { value: CmsTextSize; label: string }[] = [
  { value: "", label: "Default" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

export function sanitizeCmsColor(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const normalized = value.trim().startsWith("#") ? value.trim() : `#${value.trim()}`;
  return HEX_COLOR_RE.test(normalized) ? normalized : undefined;
}

export function cmsTypographyStyle(
  typography: CmsSectionTypography | undefined,
  part: "heading" | "body",
): CSSProperties {
  if (!typography) return {};
  const color = sanitizeCmsColor(part === "heading" ? typography.headingColor : typography.bodyColor);
  const sizeKey = part === "heading" ? typography.headingSize : typography.bodySize;
  const sizeMap = part === "heading" ? CMS_HEADING_SIZE_REM : CMS_BODY_SIZE_REM;
  const fontSize = sizeKey && sizeKey in sizeMap ? sizeMap[sizeKey as Exclude<CmsTextSize, "">] : undefined;
  return {
    ...(color ? { color } : {}),
    ...(fontSize ? { fontSize } : {}),
  };
}
