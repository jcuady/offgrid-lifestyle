/** OFF GRID® transactional email branding — aligned with site tokens (Black / White / Electric Blue). */

export const EMAIL_BRAND = {
  name: "OFF GRID® Lifestyle",
  tagline: "When comfort meets movement",
  location: "Est. Manila, PH",
  accent: "#000AFF",
  dark: "#000000",
  muted: "#6A6A6A",
  subtle: "#A1A1A1",
  border: "#E4E4E4",
  surface: "#F1F1F1",
  white: "#FFFFFF",
  logoWhitePath: "/OG%20logo/OG%20logo/Complete/White%20No%20BG.png",
} as const;

export function resolveSiteUrl(override?: string): string {
  const raw = override ?? Deno.env.get("SITE_URL") ?? "https://www.oglifestyleph.com";
  return raw.replace(/\/$/, "");
}

export function logoUrl(siteUrl: string): string {
  return `${siteUrl}${EMAIL_BRAND.logoWhitePath}`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function emailCta(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr><td style="border-radius:999px;background:${EMAIL_BRAND.dark};">
      <a href="${href}" style="display:inline-block;padding:13px 26px;color:${EMAIL_BRAND.white};text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.02em;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

export function emailCallout(html: string): string {
  return `<p style="margin:20px 0 0;padding:14px 16px;border-left:4px solid ${EMAIL_BRAND.accent};background:${EMAIL_BRAND.surface};font-size:13px;line-height:1.6;color:${EMAIL_BRAND.muted};">${html}</p>`;
}

export function emailFooter(siteUrl: string): string {
  const shop = `${siteUrl}/shop`;
  const custom = `${siteUrl}/custom`;
  const contact = `${siteUrl}/contact`;
  return `<tr><td style="padding:22px 28px 26px;background:${EMAIL_BRAND.white};border-top:1px solid ${EMAIL_BRAND.border};">
    <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_BRAND.muted};">${EMAIL_BRAND.tagline}</p>
    <p style="margin:0 0 12px;font-size:12px;color:${EMAIL_BRAND.muted};">${EMAIL_BRAND.location} · <a href="${siteUrl}" style="color:${EMAIL_BRAND.dark};text-decoration:none;font-weight:600;">oglifestyleph.com</a></p>
    <p style="margin:0;font-size:11px;color:${EMAIL_BRAND.subtle};">
      <a href="${shop}" style="color:${EMAIL_BRAND.muted};text-decoration:none;">Shop</a>
      &nbsp;·&nbsp;
      <a href="${custom}" style="color:${EMAIL_BRAND.muted};text-decoration:none;">Custom orders</a>
      &nbsp;·&nbsp;
      <a href="${contact}" style="color:${EMAIL_BRAND.muted};text-decoration:none;">Contact</a>
    </p>
  </td></tr>`;
}

export function emailTextFooter(siteUrl: string): string {
  return `\n—\n${EMAIL_BRAND.name}\n${EMAIL_BRAND.tagline}\n${EMAIL_BRAND.location} · ${siteUrl.replace(/^https?:\/\//, "")}`;
}

export function emailLayout(params: {
  title: string;
  bodyHtml: string;
  siteUrl?: string;
  preheader?: string;
}): string {
  const siteUrl = resolveSiteUrl(params.siteUrl);
  const logo = logoUrl(siteUrl);
  const preheader = params.preheader ?? params.title;
  const { dark, white, surface, muted } = EMAIL_BRAND;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background:${surface};font-family:Helvetica,Arial,sans-serif;color:${dark};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${surface};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${white};border-radius:12px;overflow:hidden;border:1px solid ${EMAIL_BRAND.border};">
        <tr><td style="background:${dark};padding:22px 28px;text-align:center;">
          <a href="${siteUrl}" style="text-decoration:none;">
            <img src="${logo}" alt="${EMAIL_BRAND.name}" width="200" height="auto" style="display:block;margin:0 auto;border:0;outline:none;max-width:200px;height:auto;">
          </a>
        </td></tr>
        <tr><td style="padding:32px 28px 28px;">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;font-weight:800;color:${dark};">${escapeHtml(params.title)}</h1>
          ${params.bodyHtml}
        </td></tr>
        ${emailFooter(siteUrl)}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
