import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePortalStore, type ManagedCustomOrder } from "@/src/store/usePortalStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import {
  headwearOptionLabel,
  isTowelHeadwearType,
  resolveHeadwearOptions,
} from "@/src/data/customHeadwearOptions";
import { formatMoney, php } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import {
  formatCityProvinceZipLine,
  formatEnumLabel,
  formatOrderStatus,
  formatOrderTimestamp,
  formatPaymentMethodLabel,
  formatPaymentStatus,
  hasOfficialCustomQuote,
  orderStatusClass,
  paymentStatusClass,
} from "@/src/lib/portal";
import {
  ORDER_TRANSITIONS,
  PAYMENT_TRANSITIONS,
  canTransitionStatus,
} from "@/src/lib/operationsOrderFlow";
import { Button } from "@/src/components/ui/Button";
import { CustomOrderFileButton } from "@/src/components/custom-order/CustomOrderFileButton";
import { localOrderService } from "@/src/services";

function AdminQuoteEditor({
  order,
  onSave,
  onClear,
}: {
  order: ManagedCustomOrder;
  onSave: (payload: {
    officialTotal: { amount: number; currency: string } | null;
    officialDeposit: { amount: number; currency: string } | null;
    quoteCustomerNotes: string;
    quoteInternalNotes: string;
  }) => void;
  onClear: () => void;
}) {
  const [totalInput, setTotalInput] = useState("");
  const [depositInput, setDepositInput] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    setTotalInput(order.officialTotal?.amount ? String(order.officialTotal.amount) : "");
    setDepositInput(order.officialDeposit?.amount ? String(order.officialDeposit.amount) : "");
    setCustomerNotes(order.quoteCustomerNotes);
    setInternalNotes(order.quoteInternalNotes);
  }, [
    order.id,
    order.officialTotal?.amount,
    order.officialDeposit?.amount,
    order.quoteCustomerNotes,
    order.quoteInternalNotes,
    order.quotedAt,
  ]);

  const applySixty = () => {
    const total = Number(totalInput.replace(/,/g, ""));
    if (!Number.isFinite(total) || total <= 0) {
      window.alert("Enter a valid official total first.");
      return;
    }
    setDepositInput(String(Math.round(total * 0.6)));
  };

  const handleSave = () => {
    const total = Number(totalInput.replace(/,/g, ""));
    if (!Number.isFinite(total) || total <= 0) {
      window.alert("Enter an official total greater than zero, or use Clear official quote.");
      return;
    }
    const depRaw = depositInput.trim() === "" ? NaN : Number(depositInput.replace(/,/g, ""));
    const depositAmount = Number.isFinite(depRaw) && depRaw > 0 ? Math.round(depRaw) : Math.round(total * 0.6);
    onSave({
      officialTotal: php(Math.round(total)),
      officialDeposit: php(depositAmount),
      quoteCustomerNotes: customerNotes.trim(),
      quoteInternalNotes: internalNotes.trim(),
    });
  };

  return (
    <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-display font-bold text-offgrid-green">Official quote (admin)</h2>
      <p className="mt-1 text-xs text-offgrid-green/55">
        Customer keeps the wizard estimate for reference; official totals appear in My Orders once saved.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
            Official total (PHP)
          </label>
          <input
            value={totalInput}
            onChange={(e) => setTotalInput(e.target.value)}
            inputMode="decimal"
            className="mt-1.5 w-full rounded-xl border border-offgrid-green/20 px-3 py-2.5 text-sm text-offgrid-green"
            placeholder="e.g. 125000"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
            Official deposit (PHP)
          </label>
          <input
            value={depositInput}
            onChange={(e) => setDepositInput(e.target.value)}
            inputMode="decimal"
            className="mt-1.5 w-full rounded-xl border border-offgrid-green/20 px-3 py-2.5 text-sm text-offgrid-green"
            placeholder="Leave blank for 60% of total"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={applySixty}>
          Apply 60% deposit
        </Button>
      </div>
      <div className="mt-4">
        <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
          Customer-facing note
        </label>
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-offgrid-green/20 px-3 py-2.5 text-sm text-offgrid-green"
          placeholder="Shown on the customer order page with the official quote."
        />
      </div>
      <div className="mt-4">
        <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
          Internal notes (admin only)
        </label>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-offgrid-green/20 px-3 py-2.5 text-sm text-offgrid-green"
          placeholder="Not visible to customers or staff."
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" size="lg" onClick={handleSave}>
          Save official quote
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onClear}>
          Clear official quote
        </Button>
      </div>
    </div>
  );
}

export function OperationsOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/portal/admin");
  const basePath = isAdmin ? "/portal/admin" : "/portal/staff";

  const retail = usePortalStore((s) => s.retailOrders.find((o) => o.id === orderId));
  const custom = usePortalStore((s) => s.customOrders.find((o) => o.id === orderId));

  const updateRetailOrderStatus = usePortalStore((s) => s.updateRetailOrderStatus);
  const updateRetailPaymentStatus = usePortalStore((s) => s.updateRetailPaymentStatus);
  const updateCustomOrderStatus = usePortalStore((s) => s.updateCustomOrderStatus);
  const updateCustomPaymentStatus = usePortalStore((s) => s.updateCustomPaymentStatus);
  const updateCustomOrderQuote = usePortalStore((s) => s.updateCustomOrderQuote);
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const headwearOptions = resolveHeadwearOptions(useSiteContentStore((s) => s.customHeadwearOptions));

  const [feedback, setFeedback] = useState<string | null>(null);

  const found = useMemo(() => !!(retail || custom), [retail, custom]);
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

  if (!orderId || !found) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <Link
          to={`${basePath}/orders`}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60 hover:text-offgrid-green"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to orders
        </Link>
        <h1 className="mt-4 text-3xl font-display font-black text-offgrid-green">Order not found</h1>
        <p className="mt-2 text-sm text-offgrid-green/60">No order matches this ID.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <Link
        to={`${basePath}/orders`}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60 hover:text-offgrid-green"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to orders
      </Link>

      {feedback ? (
        <div className="mt-4 rounded-xl border border-offgrid-green/15 bg-offgrid-green/[0.04] px-4 py-2 text-xs text-offgrid-green/80">
          {feedback}
        </div>
      ) : null}

      {retail ? (
        <div className="mt-6 space-y-8">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Retail order</p>
            <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">{retail.id}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", orderStatusClass(retail.status))}>
                Fulfillment: {formatOrderStatus(retail.status)}
              </span>
              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", paymentStatusClass(retail.paymentStatus))}>
                Payment: {formatPaymentStatus(retail.paymentStatus)}
              </span>
            </div>
            <p className="mt-3 text-xs text-offgrid-green/55">
              Placed {formatOrderTimestamp(retail.createdAt)}
              {retail.updatedAt !== retail.createdAt ? ` · Updated ${formatOrderTimestamp(retail.updatedAt)}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">Fulfillment status</label>
              <select
                value={retail.status}
                onChange={(e) => {
                  const next = e.target.value as (typeof retail)["status"];
                  if (!canTransitionStatus(retail.status, next)) {
                    setFeedback(`Invalid transition: ${formatOrderStatus(retail.status)} → ${formatOrderStatus(next)}.`);
                    return;
                  }
                  setFeedback(`Order ${retail.id} → ${formatOrderStatus(next)}.`);
                  updateRetailOrderStatus(retail.id, next);
                  localOrderService.updateOrderField(retail.id, { status: next });
                }}
                className="mt-1 block rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              >
                {ORDER_TRANSITIONS.map((s) => (
                  <option key={s} value={s}>
                    {formatOrderStatus(s)}
                  </option>
                ))}
              </select>
            </div>
            {isAdmin ? (
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">Payment status</label>
                <select
                  value={retail.paymentStatus}
                  onChange={(e) => {
                    const next = e.target.value as (typeof retail)["paymentStatus"];
                    setFeedback(`Payment → ${formatPaymentStatus(next)}.`);
                    updateRetailPaymentStatus(retail.id, next);
                    localOrderService.updateOrderField(retail.id, { payment_status: next });
                  }}
                  className="mt-1 block rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                >
                  {PAYMENT_TRANSITIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatPaymentStatus(s)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="self-end text-xs text-offgrid-green/50">Payment updates: admin only</p>
            )}
          </div>
          <p className="text-xs text-offgrid-green/55">
            Fulfillment status and payment status are tracked separately.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Delivery details</h2>
              {retail.shippingInfo ? (
                <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Recipient</dt>
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
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Address</dt>
                    <dd>{retail.shippingInfo.address}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">City / province</dt>
                    <dd>{formatCityProvinceZipLine(retail.shippingInfo)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-sm text-offgrid-green/55">No shipping address.</p>
              )}
            </div>
            <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Payment</h2>
              <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Method</dt>
                  <dd className="font-medium text-offgrid-green">{formatPaymentMethodLabel(retail.paymentMethod)}</dd>
                </div>
                {retail.paymentProvider ? (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Provider</dt>
                    <dd className="font-medium text-offgrid-green capitalize">{retail.paymentProvider}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Payment status</dt>
                  <dd>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                        paymentStatusClass(retail.paymentStatus),
                      )}
                    >
                      {formatPaymentStatus(retail.paymentStatus)}
                    </span>
                  </dd>
                </div>
                {retail.paymentProviderRef ? (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Reference</dt>
                    <dd className="font-mono text-xs">{retail.paymentProviderRef}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Customer</dt>
                  <dd>
                    {retail.customerName} · {retail.customerEmail}
                  </dd>
                </div>
              </dl>
              {retail.paymentMethod?.toLowerCase() === "gcash" ? (
                <div className="mt-4 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/45 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                    GCash QR (global)
                  </p>
                  <img
                    src={paymentSettings.gcashQrImageUrl}
                    alt="Configured GCash QR"
                    className="mt-2 h-28 w-28 rounded-lg border border-offgrid-green/10 bg-white object-contain"
                  />
                  <p className="mt-2 text-xs text-offgrid-green/60">{paymentSettings.gcashInstructions}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Items</h2>
            <div className="mt-4 space-y-3">
              {retail.lines.map((line) => (
                <div key={line.lineItemId} className="flex items-center justify-between gap-3 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={line.image} alt="" className="h-14 w-14 rounded-lg border border-offgrid-green/10 bg-white object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-offgrid-green">{line.name}</p>
                      <p className="text-xs text-offgrid-green/55">
                        {line.size} · {line.color} · Qty {line.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-offgrid-green">
                    {formatMoney({ amount: line.priceSnapshot.amount * line.quantity, currency: line.priceSnapshot.currency })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Summary</h2>
            <div className="mt-4 space-y-2 text-sm text-offgrid-green/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(retail.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatMoney(retail.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-offgrid-green/10 pt-3 text-lg font-display font-bold text-offgrid-green">
                <span>Total</span>
                <span>{formatMoney(retail.total)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {custom ? (
        <div className="mt-6 space-y-8">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Custom order</p>
            <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">{custom.id}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", orderStatusClass(custom.status))}>
                {formatOrderStatus(custom.status)}
              </span>
              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", paymentStatusClass(custom.paymentStatus))}>
                {formatPaymentStatus(custom.paymentStatus)}
              </span>
              <span
                className={cn(
                  "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  hasOfficialCustomQuote(custom.officialTotal)
                    ? "border-offgrid-green/25 bg-offgrid-lime/25 text-offgrid-green"
                    : "border-offgrid-green/15 bg-offgrid-cream text-offgrid-green/70",
                )}
              >
                {hasOfficialCustomQuote(custom.officialTotal) ? "Official quote saved" : "Quote pending"}
              </span>
            </div>
            <p className="mt-3 text-xs text-offgrid-green/55">
              Submitted {formatOrderTimestamp(custom.createdAt)}
              {custom.updatedAt !== custom.createdAt ? ` · Updated ${formatOrderTimestamp(custom.updatedAt)}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">Fulfillment status</label>
              <select
                value={custom.status}
                onChange={(e) => {
                  const next = e.target.value as (typeof custom)["status"];
                  if (!canTransitionStatus(custom.status, next)) {
                    setFeedback(`Invalid transition: ${formatOrderStatus(custom.status)} → ${formatOrderStatus(next)}.`);
                    return;
                  }
                  setFeedback(`Order ${custom.id} → ${formatOrderStatus(next)}.`);
                  updateCustomOrderStatus(custom.id, next);
                  localOrderService.updateOrderField(custom.id, { status: next });
                }}
                className="mt-1 block rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
              >
                {ORDER_TRANSITIONS.map((s) => (
                  <option key={s} value={s}>
                    {formatOrderStatus(s)}
                  </option>
                ))}
              </select>
            </div>
            {isAdmin ? (
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">Payment status</label>
                <select
                  value={custom.paymentStatus}
                  onChange={(e) => {
                    const next = e.target.value as (typeof custom)["paymentStatus"];
                    setFeedback(`Payment → ${formatPaymentStatus(next)}.`);
                    updateCustomPaymentStatus(custom.id, next);
                    localOrderService.updateOrderField(custom.id, { payment_status: next });
                  }}
                  className="mt-1 block rounded-xl border border-offgrid-green/20 px-3 py-2 text-sm"
                >
                  {PAYMENT_TRANSITIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatPaymentStatus(s)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="self-end text-xs text-offgrid-green/50">Payment updates: admin only</p>
            )}
          </div>
          <p className="text-xs text-offgrid-green/55">
            Fulfillment status and payment status are tracked separately.
          </p>

          {isAdmin ? (
            <AdminQuoteEditor
              order={custom}
              onSave={(payload) => {
                updateCustomOrderQuote(custom.id, payload);
                setFeedback("Official quote saved.");
              }}
              onClear={() => {
                updateCustomOrderQuote(custom.id, {
                  officialTotal: null,
                  officialDeposit: null,
                  quoteCustomerNotes: "",
                  quoteInternalNotes: "",
                });
                setFeedback("Official quote cleared.");
              }}
            />
          ) : (
            <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-display font-bold text-offgrid-green">Official quote</h2>
              {hasOfficialCustomQuote(custom.officialTotal) ? (
                <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Total</dt>
                    <dd className="font-semibold">{formatMoney(custom.officialTotal!)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Deposit</dt>
                    <dd className="font-semibold">{custom.officialDeposit ? formatMoney(custom.officialDeposit) : "—"}</dd>
                  </div>
                  {custom.quoteCustomerNotes.trim() ? (
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Customer note</dt>
                      <dd className="whitespace-pre-wrap">{custom.quoteCustomerNotes}</dd>
                    </div>
                  ) : null}
                  {custom.quotedAt ? (
                    <p className="text-xs text-offgrid-green/50">Quoted {formatOrderTimestamp(custom.quotedAt)}</p>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-offgrid-green/60">Awaiting admin official quote.</p>
              )}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Contact</h2>
              <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Name</dt>
                  <dd className="font-medium">{custom.customerName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Email</dt>
                  <dd>{custom.customerEmail}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Phone</dt>
                  <dd>{custom.customerPhone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Team / org</dt>
                  <dd>{custom.teamOrOrg || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Linked customer id</dt>
                  <dd className="font-mono text-xs">{custom.customerId ?? "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-display font-bold text-offgrid-green">Pricing snapshot</h2>
              <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Wizard estimate</dt>
                  <dd className="font-medium">{formatMoney(custom.estimatedTotal ?? php(0))}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Est. deposit</dt>
                  <dd className="font-medium">
                    {custom.depositRequired ? formatMoney(custom.depositRequired) : "—"}
                  </dd>
                </div>
                {hasOfficialCustomQuote(custom.officialTotal) ? (
                  <>
                    <div className="border-t border-offgrid-green/10 pt-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-lime">Official total</dt>
                      <dd className="font-semibold text-offgrid-green">{formatMoney(custom.officialTotal!)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-lime">Official deposit</dt>
                      <dd className="font-semibold text-offgrid-green">
                        {custom.officialDeposit ? formatMoney(custom.officialDeposit) : "—"}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
            </div>
          </div>

          <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Production specs</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Design file</p>
                <div className="mt-2">
                  <CustomOrderFileButton fileKey={custom.designFileKey} fileName={custom.designFileName} />
                </div>
              </div>
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Order sheet</p>
                <div className="mt-2">
                  <CustomOrderFileButton fileKey={custom.orderSheetFileKey} fileName={custom.orderSheetFileName} />
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
                        <p className="mt-1 text-sm font-semibold text-offgrid-green">{formatEnumLabel(custom.material ?? "")}</p>
                      </div>
                    </>
                  )}
                  <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3 sm:col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Print method</p>
                    <p className="mt-1 text-sm font-semibold text-offgrid-green">{formatEnumLabel(custom.printMethod ?? "")}</p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3 sm:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Order format</p>
                  <p className="mt-1 text-sm font-semibold text-offgrid-green">Team order kit workflow</p>
                </div>
              )}
              <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 p-3 sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">Design notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-offgrid-green/85">{custom.designNotes?.trim() ? custom.designNotes : "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Timeline</h2>
            <ul className="mt-4 space-y-3 text-sm text-offgrid-green/80">
              <li className="flex justify-between gap-4 border-b border-offgrid-green/8 pb-2">
                <span className="text-offgrid-green/55">Submitted</span>
                <span className="font-medium">{formatOrderTimestamp(custom.createdAt)}</span>
              </li>
              {custom.quotedAt ? (
                <li className="flex justify-between gap-4 border-b border-offgrid-green/8 pb-2">
                  <span className="text-offgrid-green/55">Official quote</span>
                  <span className="font-medium">{formatOrderTimestamp(custom.quotedAt)}</span>
                </li>
              ) : null}
              <li className="flex justify-between gap-4">
                <span className="text-offgrid-green/55">Last updated</span>
                <span className="font-medium">{formatOrderTimestamp(custom.updatedAt)}</span>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
