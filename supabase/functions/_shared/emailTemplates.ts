const BRAND = "OFF GRID® Lifestyle";
const ACCENT = "#c8f542";
const DARK = "#000000";
const MUTED = "#4a4a4a";

function formatPhp(amountCentavos: number | null | undefined): string {
  if (amountCentavos == null) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amountCentavos / 100);
}

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e6;font-family:Helvetica,Arial,sans-serif;color:${DARK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e0d0;">
        <tr><td style="background:${DARK};padding:24px 28px;">
          <p style="margin:0;font-size:18px;font-weight:800;letter-spacing:0.04em;color:#ffffff;">${BRAND}</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.2;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <p style="margin:0;font-size:12px;color:${MUTED};">Manila, Philippines · <a href="https://www.oglifestyleph.com" style="color:${DARK};">oglifestyleph.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(href: string, label: string): string {
  return `<p style="margin:24px 0 0;"><a href="${href}" style="display:inline-block;background:${DARK};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px;">${label}</a></p>`;
}

export function contactStaffEmail(params: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): { subject: string; html: string; text: string } {
  const subject = `[${params.topic}] Message from ${params.name}`;
  const text = `Name: ${params.name}\nEmail: ${params.email}\nTopic: ${params.topic}\n\n${params.message}`;
  const html = layout(
    "New contact message",
    `<p style="color:${MUTED};line-height:1.6;">You received a message from the contact form.</p>
     <table role="presentation" width="100%" style="margin-top:16px;font-size:14px;line-height:1.6;">
       <tr><td style="padding:6px 0;color:${MUTED};width:90px;">Name</td><td><strong>${escapeHtml(params.name)}</strong></td></tr>
       <tr><td style="padding:6px 0;color:${MUTED};">Email</td><td><a href="mailto:${escapeHtml(params.email)}">${escapeHtml(params.email)}</a></td></tr>
       <tr><td style="padding:6px 0;color:${MUTED};">Topic</td><td>${escapeHtml(params.topic)}</td></tr>
     </table>
     <div style="margin-top:20px;padding:16px;background:#f5f0e6;border-radius:12px;white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(params.message)}</div>`,
  );
  return { subject, html, text };
}

export function contactAutoReplyEmail(params: { name: string; topic: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "We received your message — OFF GRID® Lifestyle";
  const text = `Hi ${params.name},\n\nThanks for reaching out about ${params.topic}. Our team usually replies within one business day.\n\n— OFF GRID® Lifestyle`;
  const html = layout(
    "Message received",
    `<p style="color:${MUTED};line-height:1.6;">Hi ${escapeHtml(params.name)},</p>
     <p style="color:${MUTED};line-height:1.6;">Thanks for reaching out about <strong>${escapeHtml(params.topic)}</strong>. We received your message and will get back to you within one business day.</p>
     <p style="margin-top:20px;padding:14px 16px;border-left:4px solid ${ACCENT};background:#f5f0e6;font-size:13px;color:${MUTED};">Team kits, wholesale, and custom orders — we’re on it.</p>`,
  );
  return { subject, html, text };
}

type LineItem = { name?: string; quantity?: number; size?: string; color?: string; price?: number };

export function orderReceiptEmail(params: {
  orderId: string;
  orderType: "retail" | "custom";
  customerName: string;
  siteUrl: string;
  totalCentavos: number | null;
  lineItems?: LineItem[];
  teamOrOrg?: string;
  quantity?: number;
}): { subject: string; html: string; text: string } {
  const isRetail = params.orderType === "retail";
  const subject = isRetail
    ? `Order confirmed — ${params.orderId}`
    : `Custom order received — ${params.orderId}`;
  const ordersUrl = `${params.siteUrl}/account/orders/${params.orderId}`;

  let details = "";
  if (isRetail && params.lineItems?.length) {
    const rows = params.lineItems
      .map(
        (line) =>
          `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(line.name ?? "Item")} · ${escapeHtml(line.size ?? "")} · ${escapeHtml(line.color ?? "")}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee;">×${line.quantity ?? 1}</td></tr>`,
      )
      .join("");
    details = `<table role="presentation" width="100%" style="margin-top:16px;font-size:14px;">${rows}</table>`;
  } else if (!isRetail) {
    details = `<p style="color:${MUTED};font-size:14px;line-height:1.6;margin-top:12px;">
      ${params.teamOrOrg ? `Team / org: <strong>${escapeHtml(params.teamOrOrg)}</strong><br>` : ""}
      ${params.quantity ? `Quantity: <strong>${params.quantity}</strong><br>` : ""}
      Our team will review your files and send an official quote soon.
    </p>`;
  }

  const text = isRetail
    ? `Hi ${params.customerName},\n\nYour shop order ${params.orderId} is confirmed. Total: ${formatPhp(params.totalCentavos)}.\nView: ${ordersUrl}`
    : `Hi ${params.customerName},\n\nWe received your custom order ${params.orderId}. Our team will send a quote soon.\nView: ${ordersUrl}`;

  const html = layout(
    isRetail ? "Order confirmed" : "Custom order received",
    `<p style="color:${MUTED};line-height:1.6;">Hi ${escapeHtml(params.customerName)},</p>
     <p style="color:${MUTED};line-height:1.6;">${isRetail ? "Thanks for your order." : "Thanks for submitting your custom order request."} Reference: <strong>${escapeHtml(params.orderId)}</strong></p>
     ${params.totalCentavos != null ? `<p style="font-size:18px;font-weight:800;margin:16px 0 0;">${formatPhp(params.totalCentavos)}</p>` : ""}
     ${details}
     ${cta(ordersUrl, "View order")}`,
  );

  return { subject, html, text };
}

export function orderUpdateEmail(params: {
  orderId: string;
  customerName: string;
  title: string;
  message: string;
  siteUrl: string;
  extraHtml?: string;
}): { subject: string; html: string; text: string } {
  const ordersUrl = `${params.siteUrl}/account/orders/${params.orderId}`;
  const subject = `${params.title} — ${params.orderId}`;
  const text = `Hi ${params.customerName},\n\n${params.message}\n\nView order: ${ordersUrl}`;
  const html = layout(
    params.title,
    `<p style="color:${MUTED};line-height:1.6;">Hi ${escapeHtml(params.customerName)},</p>
     <p style="color:${MUTED};line-height:1.6;">${escapeHtml(params.message)}</p>
     ${params.extraHtml ?? ""}
     ${cta(ordersUrl, "View order")}`,
  );
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
}): { subject: string; html: string; text: string } {
  const subject = AUTH_SUBJECTS[params.actionType] ?? "OFF GRID® Lifestyle";
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi there,";

  let body = "";
  let textBody = "";

  if (params.actionType === "signup") {
    body = `<p style="color:${MUTED};line-height:1.6;">${greeting}</p>
      <p style="color:${MUTED};line-height:1.6;">Welcome to OFF GRID® Lifestyle. Confirm your email to activate your account and track shop orders, custom requests, and delivery updates.</p>
      ${params.otp ? `<p style="margin:16px 0;padding:14px 20px;background:#f5f0e6;border-radius:12px;font-family:monospace;font-size:22px;font-weight:800;letter-spacing:0.2em;text-align:center;">${escapeHtml(params.otp)}</p>` : ""}
      ${cta(params.verifyUrl, "Confirm email")}`;
    textBody = `Confirm your account: ${params.verifyUrl}${params.otp ? `\n\nOr use code: ${params.otp}` : ""}`;
  } else if (params.actionType === "recovery") {
    body = `<p style="color:${MUTED};line-height:1.6;">${greeting}</p>
      <p style="color:${MUTED};line-height:1.6;">We received a request to reset your password. If you didn't ask for this, you can ignore this email.</p>
      ${cta(params.verifyUrl, "Reset password")}`;
    textBody = `Reset your password: ${params.verifyUrl}`;
  } else if (params.actionType === "magiclink") {
    body = `<p style="color:${MUTED};line-height:1.6;">${greeting}</p>
      <p style="color:${MUTED};line-height:1.6;">Use the button below to sign in to your account. This link expires soon.</p>
      ${cta(params.verifyUrl, "Sign in")}`;
    textBody = `Sign in: ${params.verifyUrl}`;
  } else {
    body = `<p style="color:${MUTED};line-height:1.6;">${greeting}</p>
      <p style="color:${MUTED};line-height:1.6;">Complete this action using the link below.</p>
      ${params.otp ? `<p style="margin:16px 0;font-family:monospace;font-size:18px;font-weight:700;">${escapeHtml(params.otp)}</p>` : ""}
      ${cta(params.verifyUrl, "Continue")}`;
    textBody = `Continue: ${params.verifyUrl}`;
  }

  const title =
    params.actionType === "signup"
      ? "Confirm your email"
      : params.actionType === "recovery"
        ? "Reset your password"
        : "Account action";

  return { subject, html: layout(title, body), text: textBody };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export { formatPhp };
