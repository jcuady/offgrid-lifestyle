import {
  buildOrderSummaryHtml,
  buildOrderSummaryText,
  statusBadgeHtml,
  type OrderEmailContext,
} from "./orderEmail.ts";
import {
  EMAIL_BRAND,
  emailCallout,
  emailCta,
  emailLayout,
  emailTextFooter,
  escapeHtml,
  resolveSiteUrl,
} from "./emailBrand.ts";

export type { OrderEmailContext };

function formatPhp(amountCentavos: number | null | undefined): string {
  if (amountCentavos == null) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amountCentavos / 100);
}

const { muted } = EMAIL_BRAND;

export function contactStaffEmail(params: {
  name: string;
  email: string;
  topic: string;
  message: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const siteUrl = resolveSiteUrl(params.siteUrl);
  const subject = `[${params.topic}] Message from ${params.name}`;
  const text = `Name: ${params.name}\nEmail: ${params.email}\nTopic: ${params.topic}\n\n${params.message}${emailTextFooter(siteUrl)}`;
  const html = emailLayout({
    title: "New contact message",
    siteUrl,
    preheader: `New ${params.topic} inquiry from ${params.name}`,
    bodyHtml: `<p style="color:${muted};line-height:1.65;margin:0 0 16px;">You received a message from the contact form.</p>
     <table role="presentation" width="100%" style="font-size:14px;line-height:1.65;">
       <tr><td style="padding:6px 0;color:${muted};width:90px;vertical-align:top;">Name</td><td style="padding:6px 0;color:${EMAIL_BRAND.text};"><strong>${escapeHtml(params.name)}</strong></td></tr>
       <tr><td style="padding:6px 0;color:${muted};vertical-align:top;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(params.email)}" style="color:${EMAIL_BRAND.text};">${escapeHtml(params.email)}</a></td></tr>
       <tr><td style="padding:6px 0;color:${muted};vertical-align:top;">Topic</td><td style="padding:6px 0;color:${EMAIL_BRAND.text};">${escapeHtml(params.topic)}</td></tr>
     </table>
     <div style="margin-top:20px;padding:16px;background:${EMAIL_BRAND.surface};border-radius:8px;white-space:pre-wrap;font-size:14px;line-height:1.65;color:${EMAIL_BRAND.text};">${escapeHtml(params.message)}</div>`,
  });
  return { subject, html, text };
}

export function contactAutoReplyEmail(params: {
  name: string;
  topic: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const siteUrl = resolveSiteUrl(params.siteUrl);
  const subject = "We received your message — OFF GRID® Lifestyle";
  const text = `Hi ${params.name},\n\nThanks for reaching out about ${params.topic}. Our team usually replies within one business day.${emailTextFooter(siteUrl)}`;
  const html = emailLayout({
    title: "Message received",
    siteUrl,
    preheader: `We received your ${params.topic} inquiry and will reply soon.`,
    bodyHtml: `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">Hi ${escapeHtml(params.name)},</p>
     <p style="color:${muted};line-height:1.65;margin:0;">Thanks for reaching out about <strong style="color:${EMAIL_BRAND.text};">${escapeHtml(params.topic)}</strong>. We received your message and will get back to you within one business day.</p>
     ${emailCallout("Team kits, wholesale, and custom orders — we&rsquo;re on it.")}`,
  });
  return { subject, html, text };
}

export function orderReceiptEmail(
  ctx: OrderEmailContext & { siteUrl: string },
): { subject: string; html: string; text: string } {
  const isRetail = ctx.orderType === "retail";
  const unpaid = ctx.paymentStatus === "unpaid";
  const subject = isRetail
    ? unpaid
      ? `Order received — ${ctx.orderId}`
      : `Order receipt — ${ctx.orderId}`
    : `Custom order received — ${ctx.orderId}`;
  const ordersUrl = `${ctx.siteUrl}/account/orders/${ctx.orderId}`;
  const intro = isRetail
    ? unpaid
      ? "Thanks for your shop order. Here is your order summary — complete payment to confirm."
      : "Thanks for your shop order. Here is your receipt."
    : "We received your custom order request. Our team will review your files and send an official quote.";
  const title = isRetail ? (unpaid ? "Order received" : "Order receipt") : "Custom order received";

  const text = `Hi ${ctx.customerName},\n\n${intro}\n\n${buildOrderSummaryText(ctx)}\n\nView: ${ordersUrl}${emailTextFooter(ctx.siteUrl)}`;

  const html = emailLayout({
    title,
    siteUrl: ctx.siteUrl,
    preheader: isRetail
      ? `Your shop order ${ctx.orderId} was received.`
      : `We received your custom order ${ctx.orderId}.`,
    bodyHtml: `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">Hi ${escapeHtml(ctx.customerName)},</p>
     <p style="color:${muted};line-height:1.65;margin:0 0 8px;">${intro}</p>
     ${statusBadgeHtml(ctx.status)}
     ${buildOrderSummaryHtml(ctx)}
     ${emailCta(ordersUrl, "View order")}`,
  });

  return { subject, html, text };
}

/** Payment receipt sent when deposit/full payment settles (PayMongo, GCash, or staff). */
export function paymentReceiptEmail(
  ctx: OrderEmailContext & { siteUrl: string },
): { subject: string; html: string; text: string } {
  const isDeposit = ctx.paymentStatus === "deposit_paid";
  const title = isDeposit ? "Deposit receipt" : "Payment receipt";
  const subject = `${title} — ${ctx.orderId}`;
  const ordersUrl = `${ctx.siteUrl}/account/orders/${ctx.orderId}`;
  const message = isDeposit
    ? "We received your deposit. Here is your payment receipt — production can proceed once your order is confirmed."
    : "We received your payment. Here is your receipt.";

  const text = `Hi ${ctx.customerName},\n\n${message}\n\n${buildOrderSummaryText(ctx)}\n\nView: ${ordersUrl}${emailTextFooter(ctx.siteUrl)}`;

  const html = emailLayout({
    title,
    siteUrl: ctx.siteUrl,
    preheader: `${message} Order ${ctx.orderId}.`,
    bodyHtml: `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">Hi ${escapeHtml(ctx.customerName)},</p>
     <p style="color:${muted};line-height:1.65;margin:0 0 8px;">${escapeHtml(message)}</p>
     ${statusBadgeHtml(ctx.status)}
     ${emailCallout(
       isDeposit
         ? "Deposit confirmed. Thank you for trusting OFF GRID®."
         : "Payment confirmed. Thank you for shopping with OFF GRID®.",
     )}
     ${buildOrderSummaryHtml(ctx)}
     ${emailCta(ordersUrl, "View order")}`,
  });

  return { subject, html, text };
}

export function orderUpdateEmail(params: {
  ctx: OrderEmailContext;
  siteUrl: string;
  title: string;
  message: string;
  extraHtml?: string;
}): { subject: string; html: string; text: string } {
  const ordersUrl = `${params.siteUrl}/account/orders/${params.ctx.orderId}`;
  const subject = `${params.title} — ${params.ctx.orderId}`;
  const text = `Hi ${params.ctx.customerName},\n\n${params.message}\n\n${buildOrderSummaryText(params.ctx)}\n\nView: ${ordersUrl}${emailTextFooter(params.siteUrl)}`;

  const html = emailLayout({
    title: params.title,
    siteUrl: params.siteUrl,
    preheader: `${params.message} Order ${params.ctx.orderId}.`,
    bodyHtml: `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">Hi ${escapeHtml(params.ctx.customerName)},</p>
     <p style="color:${muted};line-height:1.65;margin:0 0 8px;">${escapeHtml(params.message)}</p>
     ${statusBadgeHtml(params.ctx.status)}
     ${buildOrderSummaryHtml(params.ctx)}
     ${params.extraHtml ?? ""}
     ${emailCta(ordersUrl, "View order")}`,
  });

  return { subject, html, text };
}

const AUTH_SUBJECTS: Record<string, string> = {
  signup: "Confirm your OFF GRID® account",
  recovery: "Reset your OFF GRID® password",
  magiclink: "Your OFF GRID® sign-in link",
  invite: "You're invited to OFF GRID® Lifestyle",
  email_change: "Confirm your new email address",
  reauthentication: "Your verification code",
};

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
    body = `<p class="email-text" style="color:${muted};line-height:1.65;margin:0 0 12px;">${greeting}</p>
      <p class="email-text" style="color:${muted};line-height:1.65;margin:0 0 16px;">Welcome to OFF GRID® Lifestyle. Confirm your email to activate your account and track shop orders, custom requests, and delivery updates.</p>
      ${emailCta(params.verifyUrl, "Confirm email")}`;
    textBody = `Confirm your account: ${params.verifyUrl}${emailTextFooter(siteUrl)}`;
  } else if (params.actionType === "recovery") {
    title = "Reset your password";
    preheader = "Reset your OFF GRID® account password.";
    body = `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">${greeting}</p>
      <p style="color:${muted};line-height:1.65;margin:0 0 16px;">We received a request to reset your password. If you didn&rsquo;t ask for this, you can ignore this email.</p>
      ${emailCta(params.verifyUrl, "Reset password")}`;
    textBody = `Reset your password: ${params.verifyUrl}${emailTextFooter(siteUrl)}`;
  } else if (params.actionType === "magiclink") {
    title = "Sign in to your account";
    preheader = "Your secure sign-in link for OFF GRID® Lifestyle.";
    body = `<p style="color:${muted};line-height:1.65;margin:0 0 12px;">${greeting}</p>
      <p style="color:${muted};line-height:1.65;margin:0 0 16px;">Use the button below to sign in to your account. This link expires soon.</p>
      ${emailCta(params.verifyUrl, "Sign in")}`;
    textBody = `Sign in: ${params.verifyUrl}${emailTextFooter(siteUrl)}`;
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

export { formatPhp };
