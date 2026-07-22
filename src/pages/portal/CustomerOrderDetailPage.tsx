import { type Attributes, type ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QrCode, Star, Upload } from "lucide-react";
import { usePortalStore, type PortalUser } from "@/src/store/usePortalStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { reviewService } from "@/src/services/reviewService";
import { localOrderService } from "@/src/services";
import { useOrderDetail } from "@/src/hooks/useOrderDetail";
import { supabase } from "@/src/lib/supabase";
import type { RetailOrderLine } from "@/src/types/commerce";
import {
  headwearOptionLabel,
  isTowelHeadwearType,
  resolveHeadwearOptions,
} from "@/src/data/customHeadwearOptions";
import { formatMoney, php } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import { notifyStaffOrderEvent } from "@/src/lib/notifications";
import { fileAcceptAttribute, validateUploadedFile } from "@/src/lib/fileValidation";
import { resolveStorageReference, toStorageReference } from "@/src/lib/storageAccess";
import {
  createPayMongoCheckoutSession,
  redirectToPayMongoCheckout,
} from "@/src/lib/paymongo";
import { isPayMongoCheckoutAvailable } from "@/src/types/payments";
import { AccountLayout } from "@/src/components/account/AccountLayout";
import { OrderTracker } from "@/src/components/account/OrderTracker";
import { CustomOrderFileButton } from "@/src/components/custom-order/CustomOrderFileButton";
import { CustomOrderTimeline } from "@/src/components/custom-order/CustomOrderTimeline";
import { OrderDeliveryDetails } from "@/src/components/portal/OrderDeliveryDetails";
import {
  formatCityProvinceZipLine,
  formatEnumLabel,
  formatOrderStatus,
  formatOrderTimestamp,
  formatPaymentMethodLabel,
  formatPaymentStatus,
  orderStatusClassCustomer,
  paymentStatusClassCustomer,
  hasOfficialCustomQuote,
} from "@/src/lib/portal";

const inputCls =
  "w-full rounded-xl border border-offgrid-green/20 bg-white px-3.5 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime/60 focus:ring-2 focus:ring-offgrid-lime/20";

function PayMongoPayButton({
  orderId,
  paymentKind,
  label,
  email,
}: {
  orderId: string;
  paymentKind: "full" | "deposit" | "balance";
  label: string;
  email?: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onPay = async () => {
    setBusy(true);
    setError(null);
    try {
      const session = await createPayMongoCheckoutSession({
        orderId,
        paymentKind,
        email: email ?? undefined,
      });
      if (session.alreadyPaid) {
        navigate(`/checkout/paymongo/complete?order_id=${encodeURIComponent(orderId)}`);
        return;
      }
      if (!session.checkoutUrl) {
        throw new Error("PayMongo did not return a checkout URL.");
      }
      redirectToPayMongoCheckout(session.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start PayMongo checkout.");
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void onPay()}
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-offgrid-lime px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-offgrid-gold disabled:opacity-60 sm:w-auto"
      >
        <QrCode className="h-3.5 w-3.5" />
        {busy ? "Starting QR Ph…" : label}
      </button>
      <p className="text-[11px] text-offgrid-green/55">
        PayMongo QR Ph — OFFGRID absorbs the processing fee.
      </p>
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <Star
            className={cn("h-7 w-7 transition-colors", n <= (hovered || value) ? "fill-offgrid-lime text-offgrid-lime" : "fill-none text-offgrid-green/25")}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({
  line,
  orderId,
  user,
}: Attributes & {
  line: RetailOrderLine;
  orderId: string;
  user: PortalUser | null;
}) {
  const [checked, setChecked] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    reviewService.hasReviewed(orderId, line.productId, user.email).then((has) => {
      setAlreadyReviewed(has);
      setChecked(true);
    });
  }, [orderId, line.productId, user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both the title and review.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await reviewService.submit({
      productId: line.productId,
      productName: line.name,
      orderId,
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      rating,
      title,
      body,
    });
    setSubmitting(false);
    if (result.ok) {
      setSubmitted(true);
    } else {
      setError(result.message ?? "Could not submit review.");
    }
  };

  if (!checked) return null;

  if (alreadyReviewed || submitted) {
    return (
      <div className="rounded-2xl border border-offgrid-lime/30 bg-offgrid-lime/8 p-5">
        <div className="flex items-center gap-3">
          <img src={line.image} alt={line.name} className="h-12 w-12 rounded-lg border border-offgrid-green/10 bg-white object-cover" />
          <div>
            <p className="text-sm font-semibold text-offgrid-green">{line.name}</p>
            <p className="mt-0.5 text-xs font-semibold text-offgrid-lime">
              {submitted ? "Review submitted — thank you!" : "You've already reviewed this item."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-offgrid-green/12 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <img src={line.image} alt={line.name} className="h-12 w-12 shrink-0 rounded-lg border border-offgrid-green/10 bg-white object-cover" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-offgrid-green">{line.name}</p>
          <p className="text-xs text-offgrid-green/50">{line.size} · {line.color}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Rating</p>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Title</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className={inputCls}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Review</p>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell others what you think about this product…"
            className={cn(inputCls, "resize-y")}
          />
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-offgrid-green px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-offgrid-dark disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </div>
  );
}

function PaymentProofSection({
  orderId,
  paymentMethod,
  paymentStatus,
  forceShow = false,
}: {
  orderId: string;
  paymentMethod: string | null | undefined;
  paymentStatus: string;
  forceShow?: boolean;
}) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isManualPayment = forceShow || paymentMethod === "gcash" || paymentMethod === "bank_transfer";
  const isPaid = paymentStatus === "fully_paid";

  useEffect(() => {
    localOrderService.fetchOrderProofUrl(orderId).then((url) => {
      setProofUrl(url);
      setLoading(false);
    });
  }, [orderId]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    const validation = validateUploadedFile(file, "imageAsset");
    if (validation.ok === false) {
      setUploadError(validation.error);
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${orderId}/${Date.now()}-${safeName}`;
      const { data, error: storageErr } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { upsert: true });
      if (storageErr) throw storageErr;
      const reference = toStorageReference("payment-proofs", data.path);
      await localOrderService.updateOrderField(orderId, { payment_proof_url: reference });
      const displayUrl = await resolveStorageReference(reference);
      setProofUrl(displayUrl);
      void notifyStaffOrderEvent(orderId, "payment_proof");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isManualPayment || loading) return null;

  return (
    <div className="mt-6 min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-display font-bold text-offgrid-green">Payment proof</h2>
          <p className="mt-1 text-xs text-offgrid-green/55">
            {proofUrl
              ? isPaid
                ? "Payment confirmed by OG team."
                : "Screenshot received — our team will confirm payment shortly."
              : "Upload your GCash or bank transfer screenshot so our team can verify your payment."}
          </p>
        </div>
        {!isPaid && (
          <label
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
              uploading
                ? "cursor-not-allowed bg-offgrid-green/20 text-offgrid-green/50"
                : "bg-offgrid-green text-offgrid-cream hover:bg-offgrid-dark",
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : proofUrl ? "Update screenshot" : "Upload screenshot"}
            <input
              type="file"
              accept={fileAcceptAttribute("imageAsset")}
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {uploadError ? (
        <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p>
      ) : null}

      {proofUrl ? (
        <div className="mt-4">
          <img
            src={proofUrl}
            alt="Payment screenshot"
            className="max-h-80 rounded-xl border border-offgrid-green/10 object-contain shadow-sm"
          />
          {isPaid ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-offgrid-lime/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-lime">
              ✓ Payment confirmed
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border-2 border-dashed border-offgrid-green/15 px-4 py-8 text-center text-sm text-offgrid-green/45">
          No screenshot uploaded yet.
        </div>
      )}
    </div>
  );
}

const quoteBadgeLight =
  "rounded-full border border-offgrid-green/25 bg-offgrid-lime/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green";
const quotePendingLight =
  "rounded-full border border-offgrid-green/15 bg-offgrid-cream px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/70";

export function CustomerOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const user = usePortalStore((state) => state.currentUser);
  const { retail: fetchedRetail, custom: fetchedCustom, loading } = useOrderDetail(orderId);

  const retail = fetchedRetail &&
    !!user &&
    (fetchedRetail.customerId === user.id ||
      fetchedRetail.customerEmail.toLowerCase() === user.email.toLowerCase())
    ? fetchedRetail
    : undefined;
  const custom = fetchedCustom &&
    !!user &&
    (fetchedCustom.customerId === user.id ||
      fetchedCustom.customerEmail.toLowerCase() === user.email.toLowerCase())
    ? fetchedCustom
    : undefined;

  const backTo = { to: "/account/orders", label: "Back to my orders" };

  if (loading) {
    return (
      <AccountLayout active="orders" backTo={backTo} title="Loading order" description="">
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white px-6 py-12 text-center text-sm text-offgrid-green/60">
          Loading your order...
        </div>
      </AccountLayout>
    );
  }

  if (!retail && !custom) {
    return (
      <AccountLayout
        active="orders"
        backTo={backTo}
        title="Order not found"
        description="This order does not exist or is not linked to your account."
      >
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white px-6 py-12 text-center text-sm text-offgrid-green/60">
          We couldn't find this order under your account.
        </div>
      </AccountLayout>
    );
  }

  const activeOrder = retail ?? custom!;
  const orderKind = retail ? "Retail order" : "Custom order";
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const headwearOptions = resolveHeadwearOptions(useSiteContentStore((s) => s.customHeadwearOptions));
  const hasLegacyCustomSpecs = Boolean(
    custom && (custom.cut || custom.material || custom.printMethod || custom.category),
  );
  const teamOrderType = custom
    ? custom.category === "apparel"
      ? "Jerseys & shorts"
      : isTowelHeadwearType(custom.headwearType, headwearOptions)
        ? "Towels"
        : "Headwear"
    : "—";

  return (
    <AccountLayout
      active="orders"
      backTo={backTo}
      eyebrow={orderKind}
      title={activeOrder.id}
      titleClassName="font-mono text-2xl font-bold tracking-tight break-all sm:text-3xl"
      headerExtra={
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={orderStatusClassCustomer(activeOrder.status)}>
            {formatOrderStatus(activeOrder.status, retail ? "retail" : "custom")}
          </span>
          <span className={paymentStatusClassCustomer(activeOrder.paymentStatus)}>
            {formatPaymentStatus(activeOrder.paymentStatus)}
          </span>
          {"officialTotal" in activeOrder && hasOfficialCustomQuote(activeOrder.officialTotal) ? (
            <span className={quoteBadgeLight}>Official quote</span>
          ) : null}
          {"officialTotal" in activeOrder && !hasOfficialCustomQuote(activeOrder.officialTotal) && !retail ? (
            <span className={quotePendingLight}>Quote pending</span>
          ) : null}
        </div>
      }
    >
      {retail ? (
        <>
          <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-display font-bold text-offgrid-green">Delivery status</h2>
            <div className="mt-5 rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/40 p-4">
              <OrderTracker status={retail.status} type="retail" />
            </div>
            <p className="mt-4 text-xs text-offgrid-green/55">
              Placed {formatOrderTimestamp(retail.createdAt)}
              {retail.updatedAt !== retail.createdAt ? ` · Updated ${formatOrderTimestamp(retail.updatedAt)}` : ""}
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Delivery details</h2>
              {retail.shippingInfo ? (
                <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                      Recipient
                    </dt>
                    <dd className="font-medium text-offgrid-green">{retail.shippingInfo.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Email</dt>
                    <dd>{retail.shippingInfo.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Phone</dt>
                    <dd>{retail.shippingInfo.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                      Street address
                    </dt>
                    <dd>{retail.shippingInfo.address}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                      City / province
                    </dt>
                    <dd className="mt-1">{formatCityProvinceZipLine(retail.shippingInfo)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-sm text-offgrid-green/55">No delivery address on file for this order.</p>
              )}
            </div>

            <div className="min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Payment</h2>
              <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Method</dt>
                  <dd className="font-medium text-offgrid-green">{formatPaymentMethodLabel(retail.paymentMethod)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                    Payment status
                  </dt>
                  <dd>
                    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]", paymentStatusClassCustomer(retail.paymentStatus))}>
                      {formatPaymentStatus(retail.paymentStatus)}
                    </span>
                  </dd>
                </div>
                {retail.paymentMethod?.toLowerCase() === "gcash" ? (
                  <div className="mt-4 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">GCash QR used at checkout</p>
                    <img
                      src={paymentSettings.gcashQrImageUrl}
                      alt="GCash QR"
                      className="mt-2 h-24 w-24 rounded-lg border border-offgrid-green/10 bg-white object-contain"
                    />
                  </div>
                ) : null}
                {retail.paymentMethod === "paymongo" &&
                retail.paymentStatus === "unpaid" &&
                isPayMongoCheckoutAvailable("paymongo", paymentSettings.paymongo) ? (
                  <PayMongoPayButton
                    orderId={retail.id}
                    paymentKind="full"
                    label="Pay with QR Ph"
                    email={retail.customerEmail}
                  />
                ) : null}
                {retail.paymentProviderRef ? (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                      Reference
                    </dt>
                    <dd className="font-mono text-xs">{retail.paymentProviderRef}</dd>
                  </div>
                ) : (
                  <p className="pt-2 text-xs text-offgrid-green/50">Reference will appear here once payment is confirmed.</p>
                )}
              </dl>
            </div>
          </div>

          <PaymentProofSection
            orderId={retail.id}
            paymentMethod={retail.paymentMethod}
            paymentStatus={retail.paymentStatus}
          />

          <div className="mt-6 min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Items</h2>
            <div className="mt-4 space-y-3">
              {retail.lines.map((line) => (
                <div
                  key={line.lineItemId}
                  className="flex flex-col gap-3 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-14 w-14 rounded-lg border border-offgrid-green/10 bg-white object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-offgrid-green">{line.name}</p>
                      <p className="text-xs text-offgrid-green/55">
                        {line.size} · {line.color} · Qty {line.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-offgrid-green sm:text-right">
                    {formatMoney({
                      amount: line.priceSnapshot.amount * line.quantity,
                      currency: line.priceSnapshot.currency,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm text-offgrid-green/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatMoney(retail.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium">{formatMoney(retail.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-medium">{formatMoney(retail.tax)}</span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-offgrid-green/10 pt-3 font-display text-lg font-bold text-offgrid-green">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(retail.total)}</span>
              </div>
            </div>
          </div>

          {retail.status === "delivered" && retail.lines.length > 0 ? (
            <div className="mt-6 sm:mt-8">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Rate your items</h2>
              <p className="mt-1 text-xs text-offgrid-green/55">
                Your review helps others discover the right OG gear. Reviews appear on product pages after approval.
              </p>
              <div className="mt-4 space-y-4">
                {retail.lines.map((line) => (
                  <ReviewCard key={line.lineItemId} line={line} orderId={retail.id} user={user} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {custom ? (
        <>
          <p className="text-xs text-offgrid-green/55">
            Request submitted {formatOrderTimestamp(custom.createdAt)}
            {custom.updatedAt !== custom.createdAt ? ` · Updated ${formatOrderTimestamp(custom.updatedAt)}` : ""}
          </p>

          <div className="mt-6 min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
            <h2 className="text-lg font-display font-bold text-offgrid-green">Order progress</h2>
            <div className="mt-5">
              <CustomOrderTimeline
                status={custom.status}
                hasOfficialQuote={hasOfficialCustomQuote(custom.officialTotal)}
                paymentStatus={custom.paymentStatus}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Contact</h2>
              <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Name</dt>
                  <dd className="font-medium text-offgrid-green">{custom.customerName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Email</dt>
                  <dd className="break-all">{custom.customerEmail}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Phone</dt>
                  <dd>{custom.customerPhone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                    Team / org
                  </dt>
                  <dd>{custom.teamOrOrg || "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Delivery address</h2>
              <OrderDeliveryDetails shippingInfo={custom.shippingInfo} />
            </div>

            <div className="min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Payment & quote</h2>
              {!hasOfficialCustomQuote(custom.officialTotal) ? (
                <p className="mt-3 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50 px-3 py-2 text-xs text-offgrid-green/70">
                  Your wizard estimate is below. When our team finalizes pricing, the official total and deposit will
                  appear here — check back in My orders or wait for our email.
                </p>
              ) : null}
              <dl className="mt-4 space-y-3 text-sm text-offgrid-green/80">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                    Payment status
                  </dt>
                  <dd className="font-medium text-offgrid-green">{formatPaymentStatus(custom.paymentStatus)}</dd>
                </div>
                <div className="border-t border-offgrid-green/8 pt-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                    Initial estimate (wizard)
                  </dt>
                  <dd className="font-medium">{formatMoney(custom.estimatedTotal ?? php(0))}</dd>
                  <p className="mt-1 text-xs text-offgrid-green/50">Non-binding — for reference only.</p>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">
                    Estimated deposit
                  </dt>
                  <dd className="font-medium">
                    {custom.depositRequired ? formatMoney(custom.depositRequired) : "—"}
                  </dd>
                </div>
                {hasOfficialCustomQuote(custom.officialTotal) ? (
                  <div className="border-t border-offgrid-green/10 pt-4">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-lime">
                      Official quote
                    </dt>
                    <dd className="mt-2 space-y-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 font-display text-lg font-bold text-offgrid-green">
                        <span>Total</span>
                        <span className="tabular-nums">{formatMoney(custom.officialTotal!)}</span>
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 font-medium">
                        <span>Deposit due</span>
                        <span className="tabular-nums">{custom.officialDeposit ? formatMoney(custom.officialDeposit) : "—"}</span>
                      </div>
                      {custom.quoteCustomerNotes.trim() ? (
                        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-offgrid-green/[0.04] px-3 py-2 text-sm text-offgrid-green/85">
                          {custom.quoteCustomerNotes}
                        </p>
                      ) : null}
                      {custom.quotedAt ? (
                        <p className="text-xs text-offgrid-green/50">Quoted {formatOrderTimestamp(custom.quotedAt)}</p>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {custom.paymentStatus !== "fully_paid" ? (
                <div className="mt-4 space-y-3">
                  {isPayMongoCheckoutAvailable("paymongo", paymentSettings.paymongo) &&
                  hasOfficialCustomQuote(custom.officialTotal) &&
                  (custom.paymentStatus === "unpaid" || custom.paymentStatus === "deposit_paid") ? (
                    <div className="rounded-xl border border-offgrid-lime/25 bg-offgrid-lime/[0.06] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                        PayMongo QR Ph
                      </p>
                      <PayMongoPayButton
                        orderId={custom.id}
                        paymentKind={custom.paymentStatus === "deposit_paid" ? "balance" : "deposit"}
                        label={
                          custom.paymentStatus === "deposit_paid"
                            ? "Pay remaining balance via QR Ph"
                            : "Pay deposit via QR Ph"
                        }
                        email={custom.customerEmail}
                      />
                    </div>
                  ) : null}
                  <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      Or pay deposit via GCash
                    </p>
                    <p className="mt-1 text-xs text-offgrid-green/60">{paymentSettings.gcashInstructions}</p>
                    <img
                      src={paymentSettings.gcashQrImageUrl}
                      alt="GCash QR"
                      className="mt-2 h-28 w-28 rounded-lg border border-offgrid-green/10 bg-white object-contain"
                    />
                    {hasOfficialCustomQuote(custom.officialTotal) && custom.officialDeposit ? (
                      <p className="mt-2 text-sm font-semibold text-offgrid-green">
                        Amount due now: {formatMoney(custom.officialDeposit)}
                      </p>
                    ) : custom.depositRequired ? (
                      <p className="mt-2 text-sm font-semibold text-offgrid-green">
                        Estimated deposit: {formatMoney(custom.depositRequired)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {custom.paymentStatus !== "fully_paid" && custom.paymentStatus !== "refunded" ? (
            <PaymentProofSection
              orderId={custom.id}
              paymentMethod={null}
              paymentStatus={custom.paymentStatus}
              forceShow
            />
          ) : null}

          <div className="mt-6 min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Production specs</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Design file</p>
                <div className="mt-2">
                  <CustomOrderFileButton
                    fileKey={custom.designFileKey}
                    fileUrl={custom.designFileUrl}
                    fileName={custom.designFileName}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Order sheet</p>
                <div className="mt-2">
                  <CustomOrderFileButton
                    fileKey={custom.orderSheetFileKey}
                    fileUrl={custom.orderSheetFileUrl}
                    fileName={custom.orderSheetFileName}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Quantity</p>
                <p className="mt-1 text-sm font-semibold text-offgrid-green">{custom.quantity}</p>
              </div>
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Team order type</p>
                <p className="mt-1 text-sm font-semibold text-offgrid-green">{teamOrderType}</p>
              </div>
              {hasLegacyCustomSpecs ? (
                <>
                  <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Category</p>
                    <p className="mt-1 text-sm font-semibold text-offgrid-green">
                      {custom.category === "headwear_towels" ? "Headwear & towels" : "Tops & bottoms"}
                    </p>
                  </div>
                  {custom.category === "headwear_towels" ? (
                    <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Headwear type</p>
                      <p className="mt-1 text-sm font-semibold text-offgrid-green">
                        {headwearOptionLabel(custom.headwearType, headwearOptions)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Cut</p>
                        <p className="mt-1 text-sm font-semibold text-offgrid-green">{formatEnumLabel(custom.cut ?? "")}</p>
                      </div>
                      <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Material</p>
                        <p className="mt-1 text-sm font-semibold text-offgrid-green">
                          {formatEnumLabel(custom.material ?? "")}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3 sm:col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">
                      Print method
                    </p>
                    <p className="mt-1 text-sm font-semibold text-offgrid-green">
                      {formatEnumLabel(custom.printMethod ?? "")}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3 sm:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Order format</p>
                  <p className="mt-1 text-sm font-semibold text-offgrid-green">Team order kit workflow</p>
                </div>
              )}
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3 sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">
                  Design notes
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-offgrid-green/85">
                  {custom.designNotes?.trim() ? custom.designNotes : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 min-w-0 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Key dates</h2>
            <ul className="mt-4 space-y-3 text-sm text-offgrid-green/80">
              <li className="flex flex-col gap-1 border-b border-offgrid-green/8 pb-2 sm:flex-row sm:justify-between sm:gap-4">
                <span className="text-offgrid-green/55">Submitted</span>
                <span className="font-medium">{formatOrderTimestamp(custom.createdAt)}</span>
              </li>
              {custom.quotedAt ? (
                <li className="flex flex-col gap-1 border-b border-offgrid-green/8 pb-2 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="text-offgrid-green/55">Official quote</span>
                  <span className="font-medium">{formatOrderTimestamp(custom.quotedAt)}</span>
                </li>
              ) : null}
              <li className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                <span className="text-offgrid-green/55">Last updated</span>
                <span className="font-medium">{formatOrderTimestamp(custom.updatedAt)}</span>
              </li>
            </ul>
          </div>
        </>
      ) : null}
    </AccountLayout>
  );
}
