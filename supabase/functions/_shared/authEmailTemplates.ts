import {
  EMAIL_BRAND,
  emailCta,
  emailLayout,
  emailTextFooter,
  escapeHtml,
  resolveSiteUrl,
} from "./emailBrand.ts";

const { muted } = EMAIL_BRAND;

const AUTH_SUBJECTS: Record<string, string> = {
  signup: "Confirm your OFF GRID® account",
  recovery: "Reset your OFF GRID® password",
  magiclink: "Your OFF GRID® sign-in link",
  invite: "You're invited to OFF GRID® Lifestyle",
  email_change: "Confirm your new email address",
  reauthentication: "Your verification code",
};

/** Minimal auth-only templates for send-auth-email (no order deps). */
export function authActionEmail(params: {
  actionType: string;
  name: string;
  verifyUrl: string;
  otp?: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const siteUrl = resolveSiteUrl(params.siteUrl);
  const subject = AUTH_SUBJECTS[params.actionType] ?? "OFF GRID® Lifestyle";
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi there,";

  let body = "";
  let textBody = "";
  let preheader = "";
  let title = "Account action";

  if (params.actionType === "signup") {
    title = "Confirm your email";
    preheader = "Confirm your email to activate your OFF GRID® account.";
    body = `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">${greeting}</p>
      <p style="color:${muted};line-height:1.65;margin:0 0 16px;">Welcome to OFF GRID® Lifestyle. Confirm your email to activate your account.</p>
      ${emailCta(params.verifyUrl, "Confirm email")}`;
    textBody = `Confirm your account: ${params.verifyUrl}${emailTextFooter(siteUrl)}`;
  } else if (params.actionType === "recovery") {
    title = "Reset your password";
    preheader = "Reset your OFF GRID® account password.";
    body = `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">${greeting}</p>
      <p style="color:${muted};line-height:1.65;margin:0 0 16px;">We received a request to reset your password. If you didn&rsquo;t ask for this, you can ignore this email.</p>
      ${emailCta(params.verifyUrl, "Reset password")}`;
    textBody = `Reset your password: ${params.verifyUrl}${emailTextFooter(siteUrl)}`;
  } else if (params.actionType === "email_change") {
    title = "Confirm email change";
    preheader = "Confirm your OFF GRID® email address change.";
    body = `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">${greeting}</p>
      <p style="color:${muted};line-height:1.65;margin:0 0 16px;">Confirm this email change for your OFF GRID® account. If you didn&rsquo;t request it, you can ignore this message.</p>
      ${params.otp ? `<p style="margin:0 0 20px;font-family:monospace;font-size:18px;font-weight:700;color:${EMAIL_BRAND.text};">${escapeHtml(params.otp)}</p>` : ""}
      ${emailCta(params.verifyUrl, "Confirm email change")}`;
    textBody = `Confirm email change: ${params.verifyUrl}${emailTextFooter(siteUrl)}`;
  } else {
    preheader = "Complete your OFF GRID® account action.";
    body = `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">${greeting}</p>
      <p style="color:${muted};line-height:1.65;margin:0 0 16px;">Complete this action using the link below.</p>
      ${params.otp ? `<p style="margin:0 0 20px;font-family:monospace;font-size:18px;font-weight:700;color:${EMAIL_BRAND.text};">${escapeHtml(params.otp)}</p>` : ""}
      ${emailCta(params.verifyUrl, "Continue")}`;
    textBody = `Continue: ${params.verifyUrl}${emailTextFooter(siteUrl)}`;
  }

  return {
    subject,
    html: emailLayout({ title, siteUrl, preheader, bodyHtml: body }),
    text: textBody,
  };
}
