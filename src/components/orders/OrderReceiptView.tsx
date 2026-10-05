import { formatMoney, type CustomOrderDesignFile, type Money, type RetailOrderLine } from "@/src/types/commerce";
import { formatOrderTimestamp, formatPaymentMethodLabel } from "@/src/lib/portal";
import { resolveDesignFilesFromDraft } from "@/src/lib/customOrderFiles";

export interface OrderReceiptViewProps {
  orderId: string;
  orderType: "retail" | "custom";
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  paymentMethod?: string | null;
  lineItems?: RetailOrderLine[];
  subtotal?: Money | null;
  shipping?: Money | null;
  tax?: Money | null;
  total?: Money | null;
  shippingInfo?: Record<string, unknown> | null;
  customPayload?: Record<string, unknown> | null;
  className?: string;
}

function moneyOrDash(value: Money | null | undefined): string {
  if (!value) return "—";
  return formatMoney(value);
}

function customMoneyFromPayload(payload: Record<string, unknown>, key: string): Money | null {
  const raw = payload[key];
  if (!raw || typeof raw !== "object") return null;
  const amount = (raw as { amount?: unknown }).amount;
  const currency = (raw as { currency?: unknown }).currency;
  if (typeof amount !== "number") return null;
  return { amount, currency: typeof currency === "string" ? currency : "PHP" };
}

export function OrderReceiptView({
  orderId,
  orderType,
  customerName,
  customerEmail,
  status,
  paymentStatus,
  createdAt,
  paymentMethod,
  lineItems = [],
  subtotal,
  shipping,
  tax,
  total,
  shippingInfo,
  customPayload,
  className,
}: OrderReceiptViewProps) {
  const payload = customPayload ?? {};
  const designFiles = resolveDesignFilesFromDraft({
    designFiles: payload.designFiles as CustomOrderDesignFile[] | undefined,
    designFileName: (payload.designFileName as string) ?? null,
    designFileKey: (payload.designFileKey as string) ?? null,
    designFileUrl: (payload.designFileUrl as string) ?? null,
  });

  const estimatedTotal = customMoneyFromPayload(payload, "estimatedTotal");
  const depositRequired = customMoneyFromPayload(payload, "depositRequired");
  const officialTotal = customMoneyFromPayload(payload, "officialTotal");
  const officialDeposit = customMoneyFromPayload(payload, "officialDeposit");

  return (
    <article
      className={[
        "mx-auto max-w-lg rounded-2xl border border-offgrid-green/15 bg-white p-6 text-offgrid-green shadow-sm print:max-w-none print:border-0 print:shadow-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="border-b border-offgrid-green/10 pb-4">
        <p className="font-display text-2xl font-black tracking-tight">OFFGRID</p>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-offgrid-green/50">Order receipt</p>
        <p className="mt-3 font-mono text-sm font-bold">{orderId}</p>
        <p className="text-xs text-offgrid-green/60">{formatOrderTimestamp(createdAt)}</p>
      </header>

      <section className="mt-4 space-y-1 text-sm">
        <p>
          <span className="text-offgrid-green/55">Customer:</span> {customerName}
        </p>
        <p>
          <span className="text-offgrid-green/55">Email:</span> {customerEmail}
        </p>
        <p>
          <span className="text-offgrid-green/55">Type:</span> {orderType === "custom" ? "Custom team order" : "Shop order"}
        </p>
        <p>
          <span className="text-offgrid-green/55">Status:</span> {status.replace(/_/g, " ")}
        </p>
        <p>
          <span className="text-offgrid-green/55">Payment:</span> {paymentStatus.replace(/_/g, " ")}
        </p>
        {paymentMethod ? (
          <p>
            <span className="text-offgrid-green/55">Method:</span> {formatPaymentMethodLabel(paymentMethod)}
          </p>
        ) : null}
      </section>

      {(() => {
        const isPickup = Boolean(
          orderId.startsWith("PRE-") ||
            (shippingInfo &&
              (shippingInfo.fulfillmentType === "pickup" || Boolean(shippingInfo.pickupVenue))),
        );
        const venueLabel =
          (shippingInfo?.pickupVenueLabel as string) ||
          (shippingInfo?.address as string) ||
          "Designated Pickup Partner";
        const availableDate =
          (shippingInfo?.pickupAvailableDate as string) || "Starting October 15, 2026";
        const mapsUrl = (shippingInfo?.pickupMapsUrl as string) || null;
        const isClaimed = Boolean(shippingInfo?.claimed);
        const claimedAt = (shippingInfo?.claimedAt as string) || null;
        const claimedBy = (shippingInfo?.claimedBy as string) || null;
        const claimantName = (shippingInfo?.claimantName as string) || null;
        const claimNotes = (shippingInfo?.claimNotes as string) || null;

        if (!isPickup) return null;

        const origin = typeof window !== "undefined" ? window.location.origin : "https://www.oglifestyleph.com";
        const claimValidationUrl = `${origin}/portal/ops/orders/${encodeURIComponent(orderId)}`;
        const claimQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(claimValidationUrl)}`;

        if (isClaimed) {
          return (
            <section className="mt-5 rounded-2xl border-2 border-emerald-500/35 bg-emerald-50/70 p-5 text-emerald-950 text-left">
              <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-xs">
                    ✓
                  </span>
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-emerald-900">
                    Pre-Order Claimed & Redeemed
                  </span>
                </div>
                <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                  Redeemed
                </span>
              </div>

              <p className="mt-3 text-xs text-emerald-900/80 leading-relaxed">
                This order was verified and handed over at the pickup partner venue. It cannot be redeemed again.
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-xl bg-white/70 p-3 text-xs border border-emerald-200/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800/60">Claimed At</span>
                  <p className="font-semibold text-emerald-950 mt-0.5">
                    {claimedAt ? formatOrderTimestamp(claimedAt) : "Verified in person"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800/60">Pickup Partner</span>
                  <p className="font-semibold text-emerald-950 mt-0.5">{venueLabel}</p>
                </div>
                {claimedBy && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800/60">Verified By Staff</span>
                    <p className="font-semibold text-emerald-950 mt-0.5">{claimedBy}</p>
                  </div>
                )}
                {claimantName && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800/60">Claimed By (Claimant)</span>
                    <p className="font-semibold text-emerald-950 mt-0.5">{claimantName}</p>
                  </div>
                )}
                {claimNotes && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800/60">Verification Notes</span>
                    <p className="font-semibold text-emerald-950 mt-0.5">{claimNotes}</p>
                  </div>
                )}
              </div>
            </section>
          );
        }

        return (
          <section className="mt-5 rounded-2xl border-2 border-offgrid-green/20 bg-white p-5 text-sm text-offgrid-green shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-offgrid-green/10 pb-3">
              <div>
                <span className="rounded-full bg-offgrid-lime/20 text-offgrid-green px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest">
                  Official Digital Pass
                </span>
                <h3 className="font-display font-black text-lg tracking-tight text-offgrid-green mt-1">
                  Pre-Order Claim Pass
                </h3>
              </div>
              <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider">
                Ready for Pickup
              </span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
              {/* Dynamic QR code for staff scanning */}
              <div className="flex flex-col items-center rounded-xl border border-offgrid-green/15 bg-offgrid-cream/35 p-3 shrink-0 text-center">
                <img
                  src={claimQrImageUrl}
                  alt={`Claim QR code for order ${orderId}`}
                  className="h-32 w-32 rounded-lg bg-white p-1.5 shadow-xs"
                  loading="lazy"
                />
                <span className="mt-2 font-mono text-[9px] font-bold uppercase tracking-wider text-offgrid-green/70">
                  Staff Scan to Validate
                </span>
              </div>

              {/* Venue details and claiming requirements */}
              <div className="flex-1 space-y-2 text-xs text-left">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-offgrid-green/50">
                    Pickup Partner Venue
                  </p>
                  <p className="text-sm font-bold text-offgrid-green">{venueLabel}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-offgrid-green/50">
                    Claiming Schedule
                  </p>
                  <p className="font-medium text-offgrid-green">{availableDate}</p>
                </div>
                <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-2.5 text-[11px] text-amber-900 leading-relaxed">
                  <strong>Verification Requirement:</strong> Present this Claim Pass on your phone alongside a valid ID matching <strong>{customerName}</strong>. If a representative is claiming, provide them with an authorization letter/note.
                </div>
                {mapsUrl ? (
                  <div className="pt-1">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-offgrid-green underline hover:text-offgrid-green/80"
                    >
                      Open location on Google Maps ↗
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        );
      })()}

      {orderType === "retail" ? (
        <section className="mt-6">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/50">Items</h2>
          <ul className="mt-2 divide-y divide-offgrid-green/8 text-sm">
            {lineItems.map((line) => (
              <li key={line.lineItemId} className="flex justify-between gap-3 py-2">
                <span>
                  {line.name} × {line.quantity}
                </span>
                <span className="tabular-nums">{formatMoney(line.priceSnapshot)}</span>
              </li>
            ))}
          </ul>
          {(() => {
            const isPickup = Boolean(
              orderId.startsWith("PRE-") ||
                (shippingInfo &&
                  (shippingInfo.fulfillmentType === "pickup" || Boolean(shippingInfo.pickupVenue))),
            );
            const displayTotal = isPickup && subtotal ? subtotal : total;

            return (
              <dl className="mt-4 space-y-1 border-t border-offgrid-green/10 pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-offgrid-green/60">Subtotal</dt>
                  <dd className="tabular-nums">{moneyOrDash(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-offgrid-green/60">Shipping</dt>
                  <dd className="tabular-nums">
                    {isPickup ? (
                      <span className="font-semibold text-emerald-700">FREE (In-Person Pickup) — ₱0</span>
                    ) : (
                      moneyOrDash(shipping)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-offgrid-green/60">Tax</dt>
                  <dd className="tabular-nums">{moneyOrDash(tax)}</dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{moneyOrDash(displayTotal)}</dd>
                </div>
              </dl>
            );
          })()}
        </section>
      ) : (
        <section className="mt-6 space-y-3 text-sm">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/50">
            Custom order summary
          </h2>
          {typeof payload.teamOrOrg === "string" && payload.teamOrOrg ? (
            <p>
              <span className="text-offgrid-green/55">Team:</span> {payload.teamOrOrg}
            </p>
          ) : null}
          {typeof payload.quantity === "number" ? (
            <p>
              <span className="text-offgrid-green/55">Quantity:</span> {payload.quantity} pcs
            </p>
          ) : null}
          {designFiles.length > 0 ? (
            <div>
              <p className="text-offgrid-green/55">Design files</p>
              <ul className="mt-1 list-disc pl-5">
                {designFiles.map((f) => (
                  <li key={f.key}>{f.name}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <dl className="space-y-1 border-t border-offgrid-green/10 pt-3">
            <div className="flex justify-between">
              <dt className="text-offgrid-green/60">Est. total</dt>
              <dd className="tabular-nums">{moneyOrDash(estimatedTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-offgrid-green/60">Est. deposit</dt>
              <dd className="tabular-nums">{moneyOrDash(depositRequired)}</dd>
            </div>
            {officialTotal ? (
              <>
                <div className="flex justify-between font-semibold">
                  <dt>Official total</dt>
                  <dd className="tabular-nums">{formatMoney(officialTotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-offgrid-green/60">Official deposit</dt>
                  <dd className="tabular-nums">{moneyOrDash(officialDeposit)}</dd>
                </div>
              </>
            ) : null}
            {typeof payload.quoteCustomerNotes === "string" && payload.quoteCustomerNotes.trim() ? (
              <p className="whitespace-pre-wrap pt-2 text-sm text-offgrid-green/80">{payload.quoteCustomerNotes}</p>
            ) : null}
          </dl>
        </section>
      )}

      <footer className="mt-8 border-t border-offgrid-green/10 pt-4 text-xs text-offgrid-green/50">
        <p>Thank you for ordering with OFFGRID Lifestyle.</p>
        <p className="mt-1">Questions? Contact us at offgrid-lifestyle.com/contact</p>
      </footer>
    </article>
  );
}
