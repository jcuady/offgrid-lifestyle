import { EMAIL_BRAND, escapeHtml } from "./emailBrand.ts";

const { muted: MUTED, accent: ACCENT, text: TEXT, surface: SURFACE, border: BORDER } = EMAIL_BRAND;

function formatPhp(amountCentavos: number | null | undefined): string {
  if (amountCentavos == null) return "—";
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    amountCentavos / 100,
  );
}

export type ShippingSnapshot = {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  zip?: string;
};

export type RetailLine = {
  name?: string;
  quantity?: number;
  size?: string;
  color?: string;
  price?: number;
};

export type OrderEmailContext = {
  orderId: string;
  orderType: "retail" | "custom";
  customerName: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  totalCentavos: number | null;
  subtotalCentavos?: number | null;
  shippingCentavos?: number | null;
  taxCentavos?: number | null;
  lineItems?: RetailLine[];
  teamOrOrg?: string;
  quantity?: number;
  category?: string;
  cut?: string | null;
  material?: string | null;
  printMethod?: string | null;
  designNotes?: string;
  shippingInfo?: ShippingSnapshot | null;
  officialTotalCentavos?: number | null;
  officialDepositCentavos?: number | null;
  quoteNotes?: string;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_deposit: "Pending deposit",
  confirmed: "Confirmed",
  in_production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  deposit_paid: "Deposit paid",
  fully_paid: "Fully paid",
  refunded: "Refunded",
};

export function formatStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

export function formatPaymentLabel(status: string): string {
  return PAYMENT_LABELS[status] ?? status.replaceAll("_", " ");
}

function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return "—";
  const labels: Record<string, string> = {
    gcash: "GCash",
    bank_transfer: "Bank transfer",
    cod: "Cash on delivery",
    card: "Card",
  };
  return labels[method] ?? method.replaceAll("_", " ");
}

function metaRow(label: string, value: string): string {
  return `<tr><td style="padding:5px 0;color:${MUTED};width:120px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:5px 0;font-weight:600;color:${TEXT};">${value}</td></tr>`;
}

function formatAddress(info: ShippingSnapshot): string {
  const lines = [
    info.fullName,
    info.phone,
    [info.address, info.barangay].filter(Boolean).join(", "),
    [info.city, info.province, info.zip].filter(Boolean).join(", "),
    info.region,
  ].filter(Boolean);
  return lines.map((l) => escapeHtml(l!)).join("<br>");
}

export function buildOrderSummaryHtml(ctx: OrderEmailContext): string {
  const channel = ctx.orderType === "retail" ? "Shop order" : "Custom order";
  let html = `<div style="margin:16px 0;padding:16px;background:${SURFACE};border-radius:8px;font-size:13px;line-height:1.5;color:${TEXT};">
    <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">${channel}</p>
    <table role="presentation" width="100%" style="font-size:13px;">`;

  html += metaRow("Order ID", escapeHtml(ctx.orderId));
  html += metaRow("Status", escapeHtml(formatStatusLabel(ctx.status)));
  html += metaRow("Payment", escapeHtml(formatPaymentLabel(ctx.paymentStatus)));

  if (ctx.orderType === "retail" && ctx.paymentMethod) {
    html += metaRow("Pay via", escapeHtml(formatPaymentMethod(ctx.paymentMethod)));
  }

  if (ctx.orderType === "retail" && ctx.lineItems?.length) {
    html += `</table><table role="presentation" width="100%" style="margin-top:12px;font-size:13px;border-collapse:collapse;">
      <tr style="border-bottom:1px solid ${BORDER};">
        <th align="left" style="padding:6px 0;color:${MUTED};font-weight:600;">Item</th>
        <th align="right" style="padding:6px 0;color:${MUTED};font-weight:600;">Qty</th>
        <th align="right" style="padding:6px 0;color:${MUTED};font-weight:600;">Price</th>
      </tr>`;
    for (const line of ctx.lineItems) {
      const label = [line.name, line.size, line.color].filter(Boolean).join(" · ");
      const lineTotal = (line.price ?? 0) * (line.quantity ?? 1);
      html += `<tr style="border-bottom:1px solid ${BORDER};">
        <td style="padding:8px 0;color:${TEXT};">${escapeHtml(label || "Item")}</td>
        <td align="right" style="padding:8px 0;color:${TEXT};">×${line.quantity ?? 1}</td>
        <td align="right" style="padding:8px 0;color:${TEXT};">${formatPhp(Math.round(lineTotal * 100))}</td>
      </tr>`;
    }
    html += `</table><table role="presentation" width="100%" style="margin-top:8px;font-size:13px;">`;
    if (ctx.subtotalCentavos != null) html += metaRow("Subtotal", formatPhp(ctx.subtotalCentavos));
    if (ctx.shippingCentavos != null) html += metaRow("Shipping", formatPhp(ctx.shippingCentavos));
    if (ctx.taxCentavos != null) html += metaRow("Tax", formatPhp(ctx.taxCentavos));
  }

  if (ctx.orderType === "custom") {
    if (ctx.teamOrOrg) html += metaRow("Team / org", escapeHtml(ctx.teamOrOrg));
    if (ctx.quantity) html += metaRow("Quantity", String(ctx.quantity));
    if (ctx.category) html += metaRow("Category", escapeHtml(ctx.category.replaceAll("_", " ")));
    if (ctx.cut) html += metaRow("Cut", escapeHtml(ctx.cut.replaceAll("_", " ")));
    if (ctx.material) html += metaRow("Fabric", escapeHtml(ctx.material.replaceAll("_", " ")));
    if (ctx.printMethod) html += metaRow("Print", escapeHtml(ctx.printMethod.replaceAll("_", " ")));
    if (ctx.officialTotalCentavos != null) {
      html += metaRow("Quote total", formatPhp(ctx.officialTotalCentavos));
    } else if (ctx.totalCentavos != null) {
      html += metaRow("Estimate", formatPhp(ctx.totalCentavos));
    }
    if (ctx.officialDepositCentavos != null) {
      html += metaRow("Deposit due", formatPhp(ctx.officialDepositCentavos));
    }
    if (ctx.designNotes?.trim()) {
      html += `</table><p style="margin:10px 0 0;font-size:12px;color:${MUTED};">Design notes</p>
        <p style="margin:4px 0 0;white-space:pre-wrap;font-size:13px;color:${TEXT};">${escapeHtml(ctx.designNotes.trim())}</p>
        <table role="presentation" width="100%" style="font-size:13px;">`;
    }
    if (ctx.quoteNotes?.trim()) {
      html += `</table><p style="margin:10px 0 0;font-size:12px;color:${MUTED};">Quote notes</p>
        <p style="margin:4px 0 0;white-space:pre-wrap;font-size:13px;color:${TEXT};">${escapeHtml(ctx.quoteNotes.trim())}</p>
        <table role="presentation" width="100%" style="font-size:13px;">`;
    }
  }

  if (ctx.totalCentavos != null && ctx.orderType === "retail") {
    html += metaRow("Total", `<span style="font-size:16px;">${formatPhp(ctx.totalCentavos)}</span>`);
  }

  html += `</table>`;

  if (ctx.shippingInfo && (ctx.shippingInfo.address || ctx.shippingInfo.city)) {
    html += `<p style="margin:12px 0 4px;font-size:12px;color:${MUTED};">Ship to</p>
      <p style="margin:0;font-size:13px;line-height:1.5;color:${TEXT};">${formatAddress(ctx.shippingInfo)}</p>`;
  }

  html += `</div>`;
  return html;
}

export function statusBadgeHtml(status: string): string {
  return `<span style="display:inline-block;margin:8px 0 4px;padding:5px 12px;border-radius:999px;background:${ACCENT};color:${EMAIL_BRAND.white};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(formatStatusLabel(status))}</span>`;
}

type OrderDbRow = {
  id: string;
  order_type: string;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  customer_name: string | null;
  total_centavos: number | null;
  subtotal_centavos?: number | null;
  shipping_centavos?: number | null;
  tax_centavos?: number | null;
  line_items: unknown;
  shipping_info: unknown;
  custom_payload: Record<string, unknown> | null;
};

export function buildOrderEmailContextFromRow(row: OrderDbRow): OrderEmailContext {
  const payload = row.custom_payload ?? {};
  const shippingRaw = (row.shipping_info ?? payload.shippingInfo) as ShippingSnapshot | null;
  const officialTotal = payload.officialTotal as { amount?: number } | null | undefined;
  const officialDeposit = payload.officialDeposit as { amount?: number } | null | undefined;

  return {
    orderId: row.id,
    orderType: row.order_type === "custom" ? "custom" : "retail",
    customerName: row.customer_name ?? (payload.contactName as string) ?? "there",
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    totalCentavos: row.total_centavos,
    subtotalCentavos: row.subtotal_centavos,
    shippingCentavos: row.shipping_centavos,
    taxCentavos: row.tax_centavos,
    lineItems: (row.line_items as RetailLine[]) ?? [],
    teamOrOrg: (payload.teamOrOrg as string) ?? "",
    quantity: (payload.quantity as number) ?? undefined,
    category: (payload.category as string) ?? undefined,
    cut: (payload.cut as string) ?? null,
    material: (payload.material as string) ?? null,
    printMethod: (payload.printMethod as string) ?? null,
    designNotes: (payload.designNotes as string) ?? "",
    shippingInfo: shippingRaw,
    officialTotalCentavos: officialTotal?.amount
      ? Math.round(officialTotal.amount * 100)
      : null,
    officialDepositCentavos: officialDeposit?.amount
      ? Math.round(officialDeposit.amount * 100)
      : null,
    quoteNotes: (payload.quoteCustomerNotes as string) ?? "",
  };
}

export function buildOrderSummaryText(ctx: OrderEmailContext): string {
  const lines: string[] = [];
  lines.push(`Order: ${ctx.orderId}`);
  lines.push(`Type: ${ctx.orderType === "retail" ? "Shop order" : "Custom order"}`);
  lines.push(`Status: ${formatStatusLabel(ctx.status)}`);
  lines.push(`Payment: ${formatPaymentLabel(ctx.paymentStatus)}`);

  if (ctx.orderType === "retail" && ctx.paymentMethod) {
    lines.push(`Pay via: ${formatPaymentMethod(ctx.paymentMethod)}`);
  }

  if (ctx.orderType === "retail" && ctx.lineItems?.length) {
    lines.push("");
    lines.push("Items:");
    for (const line of ctx.lineItems) {
      const label = [line.name, line.size, line.color].filter(Boolean).join(" · ");
      const lineTotal = (line.price ?? 0) * (line.quantity ?? 1);
      lines.push(`- ${label || "Item"} ×${line.quantity ?? 1} — ${formatPhp(Math.round(lineTotal * 100))}`);
    }
    if (ctx.subtotalCentavos != null) lines.push(`Subtotal: ${formatPhp(ctx.subtotalCentavos)}`);
    if (ctx.shippingCentavos != null) lines.push(`Shipping: ${formatPhp(ctx.shippingCentavos)}`);
    if (ctx.taxCentavos != null) lines.push(`Tax: ${formatPhp(ctx.taxCentavos)}`);
  }

  if (ctx.orderType === "custom") {
    if (ctx.teamOrOrg) lines.push(`Team / org: ${ctx.teamOrOrg}`);
    if (ctx.quantity) lines.push(`Quantity: ${ctx.quantity}`);
    if (ctx.category) lines.push(`Category: ${ctx.category.replaceAll("_", " ")}`);
    if (ctx.cut) lines.push(`Cut: ${ctx.cut.replaceAll("_", " ")}`);
    if (ctx.material) lines.push(`Fabric: ${ctx.material.replaceAll("_", " ")}`);
    if (ctx.printMethod) lines.push(`Print: ${ctx.printMethod.replaceAll("_", " ")}`);
    if (ctx.officialTotalCentavos != null) {
      lines.push(`Quote total: ${formatPhp(ctx.officialTotalCentavos)}`);
    } else if (ctx.totalCentavos != null) {
      lines.push(`Estimate: ${formatPhp(ctx.totalCentavos)}`);
    }
    if (ctx.officialDepositCentavos != null) {
      lines.push(`Deposit due: ${formatPhp(ctx.officialDepositCentavos)}`);
    }
    if (ctx.designNotes?.trim()) {
      lines.push("");
      lines.push("Design notes:");
      lines.push(ctx.designNotes.trim());
    }
    if (ctx.quoteNotes?.trim()) {
      lines.push("");
      lines.push("Quote notes:");
      lines.push(ctx.quoteNotes.trim());
    }
  }

  if (ctx.totalCentavos != null && ctx.orderType === "retail") {
    lines.push(`Total: ${formatPhp(ctx.totalCentavos)}`);
  }

  if (ctx.shippingInfo && (ctx.shippingInfo.address || ctx.shippingInfo.city)) {
    lines.push("");
    lines.push("Ship to:");
    const info = ctx.shippingInfo;
    if (info.fullName) lines.push(info.fullName);
    if (info.phone) lines.push(info.phone);
    const addr = [info.address, info.barangay].filter(Boolean).join(", ");
    if (addr) lines.push(addr);
    const cityLine = [info.city, info.province, info.zip].filter(Boolean).join(", ");
    if (cityLine) lines.push(cityLine);
    if (info.region) lines.push(info.region);
  }

  return lines.join("\n");
}

export { escapeHtml, formatPaymentMethod, MUTED, TEXT, ACCENT };
