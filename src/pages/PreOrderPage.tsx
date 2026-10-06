import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Check,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Wallet,
  Building2,
  Download,
  Copy,
  Upload,
  CheckCircle2,
  QrCode,
  Info,
  PackageCheck,
  FileCheck,
} from "lucide-react";
import { usePageSeo } from "@/src/hooks/usePageSeo";
import { formatPrice } from "@/src/data/products";
import { Button } from "@/src/components/ui/Button";
import { SizeGuideModal } from "@/src/components/SizeGuideModal";
import { usePortalStore } from "@/src/store/usePortalStore";
import {
  PREORDER_DESIGNS,
  PREORDER_END_ISO,
  PREORDER_MAX_SLOTS,
  PREORDER_PRICE,
  PREORDER_PRODUCT_SLUG,
  PREORDER_SIZES,
  PREORDER_SRP,
  PREORDER_START_ISO,
  PREORDER_VENUES,
  PREORDER_PAYMENT_CONFIG,
  type PreorderVenueId,
  type PreorderPaymentMethod,
  isPreorderWindowActive,
  isPreorderWindowClosed,
} from "@/src/lib/preorderConfig";
import {
  fetchPreorderSlotStatus,
  submitPreorder,
  submitPreorderPaymentProof,
  updatePreorderPaymentMethod,
  type PreorderSlotStatus,
} from "@/src/services/preorderService";
import { cn } from "@/src/lib/utils";
import { formatPhilippinePhoneInput } from "@/src/lib/formValidation";

function useCountdown(targetIso: string) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>(() => calculateTimeLeft(targetIso));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetIso));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetIso]);

  return timeLeft;
}

function calculateTimeLeft(targetIso: string) {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isExpired: false };
}

export function PreOrderPage() {
  const navigate = useNavigate();
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const currentUser = usePortalStore((s) => s.currentUser);

  usePageSeo({
    title: "Pre-Order: The Social Club Collection | OFFGRID® Lifestyle",
    description:
      "Pre-order the limited Social Club Collection Boxy Cut Cotton Shirt. 5% off until Oct 9. Strictly limited to 30 pieces worldwide.",
    path: "/pre-order/social-club",
    imagePath: "/images/products/social-club-cover.webp",
  });

  const [slotStatus, setSlotStatus] = useState<PreorderSlotStatus>({
    totalCap: PREORDER_MAX_SLOTS,
    totalReserved: 0,
    remainingSlots: PREORDER_MAX_SLOTS,
    isSoldOut: false,
  });
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Form selections
  const [selectedDesignName, setSelectedDesignName] = useState(PREORDER_DESIGNS[0].name);
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [quantity, setQuantity] = useState(1);
  const [venueId, setVenueId] = useState<PreorderVenueId>("kado_kohi");
  const [paymentMethod, setPaymentMethod] = useState<PreorderPaymentMethod>("gcash");

  // Contact inputs
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");

  // UI state
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  // Post-order payment proof & QR state
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<PreorderPaymentMethod>("gcash");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofRefNumber, setProofRefNumber] = useState<string>("");
  const [proofUploading, setProofUploading] = useState<boolean>(false);
  const [proofUploadSuccess, setProofUploadSuccess] = useState<boolean>(false);
  const [proofUploadError, setProofUploadError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const countdown = useCountdown(PREORDER_END_ISO);
  const isWindowActive = isPreorderWindowActive();
  const isWindowClosed = isPreorderWindowClosed();

  const activeDesign = useMemo(() => {
    return PREORDER_DESIGNS.find((d) => d.name === selectedDesignName) || PREORDER_DESIGNS[0];
  }, [selectedDesignName]);

  const selectedVenue = PREORDER_VENUES[venueId];

  // Refresh slots on mount and periodically
  useEffect(() => {
    let mounted = true;
    const loadSlots = async () => {
      try {
        const res = await fetchPreorderSlotStatus();
        if (mounted) {
          setSlotStatus(res);
          setLoadingSlots(false);
        }
      } catch {
        if (mounted) setLoadingSlots(false);
      }
    };
    void loadSlots();
    const interval = setInterval(loadSlots, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSwitchPaymentMethod = async (newMethod: PreorderPaymentMethod) => {
    if (confirmedPaymentMethod === newMethod) return;
    const previous = confirmedPaymentMethod;
    setConfirmedPaymentMethod(newMethod);
    setProofUploadError(null);
    if (successOrderId) {
      try {
        await updatePreorderPaymentMethod(successOrderId, newMethod);
      } catch (err) {
        setConfirmedPaymentMethod(previous);
        setProofUploadError(err instanceof Error ? err.message : "Could not switch payment method.");
      }
    }
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!successOrderId) return;
    if (!proofFile && !proofRefNumber.trim()) {
      setProofUploadError("Please select a screenshot file or enter your reference number.");
      return;
    }

    try {
      setProofUploading(true);
      setProofUploadError(null);
      const res = await submitPreorderPaymentProof({
        orderId: successOrderId,
        email,
        file: proofFile,
        referenceNumber: proofRefNumber,
      });
      // The preview is the local file picked above; res.proofUrl is a private storage reference.
      if (res.success) setProofUploadSuccess(true);
    } catch (err) {
      setProofUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setProofUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid email address for your order confirmation.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Please enter your contact mobile number.");
      return;
    }
    if (!selectedSize) {
      setFormError("Please select your shirt size.");
      return;
    }

    try {
      setSubmitting(true);
      const orderId = await submitPreorder({
        designName: selectedDesignName,
        size: selectedSize,
        quantity,
        venueId,
        fullName,
        email,
        phone,
        paymentMethod,
      });

      setSuccessOrderId(orderId);
      setConfirmedPaymentMethod(paymentMethod);
      // Refresh slot status
      void fetchPreorderSlotStatus().then(setSlotStatus);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to place pre-order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-offgrid-cream pt-24 pb-20 sm:pt-28 sm:pb-24 text-offgrid-green">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-offgrid-green/60 hover:text-offgrid-lime transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Shop
          </Link>
          <span className="rounded-full bg-offgrid-green/5 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-offgrid-green/70">
            OCT 5 – OCT 9 DROP
          </span>
        </div>

        {/* Success View */}
        {successOrderId ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-2xl rounded-3xl border border-offgrid-green/15 bg-white p-6 sm:p-10 shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-offgrid-lime text-white shadow-lg mb-5">
                <PackageCheck className="h-8 w-8" />
              </div>
              <span className="rounded-full bg-offgrid-lime/20 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-offgrid-green mb-2">
                Pre-Order Confirmed
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-offgrid-green">
                You're in the Social Club!
              </h1>
              <p className="mt-2 text-sm text-offgrid-green/70">
                Order Reference:{" "}
                <span className="font-mono font-bold text-offgrid-green">{successOrderId}</span>
              </p>
            </div>

            <div className="mt-8 space-y-4 rounded-2xl bg-offgrid-cream/60 p-5 text-left text-sm border border-offgrid-green/10">
              <div className="flex justify-between border-b border-offgrid-green/10 pb-3">
                <span className="text-offgrid-green/60">Product</span>
                <span className="font-semibold text-right">
                  {activeDesign.name} ({selectedSize}) × {quantity}
                </span>
              </div>
              <div className="flex justify-between border-b border-offgrid-green/10 pb-3">
                <span className="text-offgrid-green/60">Total Amount</span>
                <span className="font-bold text-offgrid-green">
                  {formatPrice(PREORDER_PRICE * quantity)} (5% Promo Applied)
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-offgrid-green/10 pb-3">
                <span className="text-offgrid-green/60">Claiming Venue</span>
                <span className="font-bold text-offgrid-green">{selectedVenue.name}</span>
                <span className="text-xs text-offgrid-green/70">{selectedVenue.availableDate}</span>
                {selectedVenue.mapsUrl && (
                  <a
                    href={selectedVenue.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-offgrid-lime hover:underline mt-0.5"
                  >
                    View on Google Maps <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-offgrid-green/60">Customer</span>
                <span className="font-semibold">{fullName} ({phone})</span>
              </div>
            </div>

            {/* Payment Section: QR Display, Mobile Download & Copy, and Proof Uploader */}
            {(() => {
              const activeConfig = PREORDER_PAYMENT_CONFIG[confirmedPaymentMethod];
              return (
                <div className="mt-6 rounded-3xl border border-offgrid-green/15 bg-white p-5 sm:p-7 text-left shadow-sm space-y-6">
                  {/* Channel Switcher Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-offgrid-green/70">
                        Payment Channel (Scan QR or Transfer)
                      </span>
                      <span className="text-[11px] text-offgrid-green/50">Instant InstaPay Transfer</span>
                    </div>
                    <div className="flex rounded-xl bg-offgrid-cream p-1 border border-offgrid-green/10">
                      <button
                        type="button"
                        onClick={() => handleSwitchPaymentMethod("gcash")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all",
                          confirmedPaymentMethod === "gcash"
                            ? "bg-white text-offgrid-green shadow-sm ring-1 ring-offgrid-green/10"
                            : "text-offgrid-green/60 hover:text-offgrid-green",
                        )}
                      >
                        <Wallet className="h-4 w-4 text-offgrid-lime" />
                        <span>GCash QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchPaymentMethod("bdo")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all",
                          confirmedPaymentMethod === "bdo"
                            ? "bg-white text-offgrid-green shadow-sm ring-1 ring-offgrid-green/10"
                            : "text-offgrid-green/60 hover:text-offgrid-green",
                        )}
                      >
                        <Building2 className="h-4 w-4 text-offgrid-lime" />
                        <span>BDO QR</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Image and Direct Action Box */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-offgrid-cream/40 p-4 sm:p-5 border border-offgrid-green/10">
                    <div className="relative group shrink-0">
                      <img
                        src={activeConfig.qrImage}
                        alt={`${activeConfig.name} - OFFGRID`}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== activeConfig.fallbackQrImage) {
                            target.src = activeConfig.fallbackQrImage;
                          }
                        }}
                        className="max-h-56 sm:max-h-64 w-auto rounded-xl border border-offgrid-green/15 bg-white shadow-md object-contain"
                      />
                      <div className="mt-2 text-center">
                        <a
                          href={activeConfig.qrImage}
                          download={`OFFGRID-${confirmedPaymentMethod.toUpperCase()}-QR.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-offgrid-lime hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download / Save QR
                        </a>
                      </div>
                    </div>

                    <div className="space-y-3.5 flex-1 min-w-0 w-full">
                      <div>
                        <span className="rounded-full bg-offgrid-lime/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-offgrid-green uppercase">
                          {activeConfig.badge}
                        </span>
                        <h3 className="mt-1 font-display text-lg font-bold text-offgrid-green">
                          Pay {formatPrice(PREORDER_PRICE * quantity)}
                        </h3>
                        <p className="text-xs text-offgrid-green/75 leading-relaxed mt-1">
                          {activeConfig.instructions}
                        </p>
                      </div>

                      {/* Account Details with One-Tap Copy */}
                      <div className="space-y-2 rounded-xl bg-white p-3.5 border border-offgrid-green/10">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-offgrid-green/60 font-medium">Account / Mobile No.</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-offgrid-green">{activeConfig.accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(activeConfig.accountNumber.replace(/\s+/g, ""), "accountNumber")}
                              className="text-offgrid-lime hover:text-offgrid-green transition-colors p-1"
                              title="Copy Number"
                            >
                              {copiedField === "accountNumber" ? (
                                <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-offgrid-green/10">
                          <span className="text-offgrid-green/60 font-medium">Account Name</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-offgrid-green truncate max-w-[170px]">{activeConfig.accountName}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(activeConfig.accountName, "accountName")}
                              className="text-offgrid-lime hover:text-offgrid-green transition-colors p-1"
                              title="Copy Name"
                            >
                              {copiedField === "accountName" ? (
                                <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Important Reference Prompt */}
                      <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-900 flex items-start gap-2">
                        <Info className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                        <div>
                          <p className="font-bold">Required Reference Note:</p>
                          <p className="mt-0.5 text-[11px] text-amber-800">
                            Please type <span className="font-mono font-bold select-all bg-amber-100 px-1 py-0.5 rounded">{successOrderId}</span> in your transfer notes/remarks so we can match your payment instantly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Proof of Payment Submission */}
                  <div className="pt-2 border-t border-offgrid-green/10">
                    {proofUploadSuccess ? (
                      /* Visual Submitted State */
                      <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-5 text-left">
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-display font-bold text-base text-emerald-950">
                                Payment Proof Received!
                              </h4>
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                Pending Verification
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-emerald-900/80 leading-relaxed">
                              Thank you! Our operations team has received your submission and will verify your transfer against order <strong className="font-mono">{successOrderId}</strong> shortly.
                            </p>

                            {proofRefNumber && (
                              <p className="mt-2 text-xs text-emerald-900 font-mono">
                                <strong>Reference:</strong> {proofRefNumber}
                              </p>
                            )}

                            {proofPreviewUrl && (
                              <div className="mt-3">
                                <p className="text-[11px] font-semibold text-emerald-900/70 mb-1">Attached Receipt Preview:</p>
                                <img
                                  src={proofPreviewUrl}
                                  alt="Receipt preview"
                                  className="h-28 w-auto rounded-lg border border-emerald-300 object-cover shadow-xs"
                                />
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setProofUploadSuccess(false);
                                setProofFile(null);
                              }}
                              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950"
                            >
                              Need to upload another screenshot? Click here
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Upload Proof Form */
                      <form onSubmit={handleProofSubmit} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-offgrid-green flex items-center gap-1.5">
                            <Upload className="h-3.5 w-3.5 text-offgrid-lime" />
                            Upload Payment Screenshot
                          </label>
                          <span className="text-[11px] text-offgrid-green/60">Fast-track confirmation</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* File input */}
                          <div className="relative">
                            <input
                              type="file"
                              id="payment-proof-file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setProofFile(file);
                                if (file) {
                                  setProofPreviewUrl(URL.createObjectURL(file));
                                }
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor="payment-proof-file"
                              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-offgrid-green/30 bg-offgrid-cream/30 px-3.5 py-2.5 text-xs font-semibold text-offgrid-green hover:bg-offgrid-cream/70 cursor-pointer transition-colors"
                            >
                              <Upload className="h-4 w-4 text-offgrid-lime" />
                              <span className="truncate">
                                {proofFile ? proofFile.name : "Select Screenshot (JPG/PNG)"}
                              </span>
                            </label>
                          </div>

                          {/* Reference Number input */}
                          <div>
                            <input
                              type="text"
                              value={proofRefNumber}
                              onChange={(e) => setProofRefNumber(e.target.value)}
                              placeholder={activeConfig.referenceHint}
                              className="w-full min-h-11 rounded-xl border border-offgrid-green/20 bg-white px-3.5 py-2.5 text-xs text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
                            />
                          </div>
                        </div>

                        {proofUploadError && (
                          <p className="text-xs text-red-600 font-semibold">{proofUploadError}</p>
                        )}

                        <Button
                          type="submit"
                          disabled={proofUploading || (!proofFile && !proofRefNumber.trim())}
                          className="w-full bg-offgrid-lime font-bold text-white hover:bg-offgrid-lime/90 py-3 text-xs uppercase tracking-wider shadow-sm"
                        >
                          {proofUploading ? (
                            <>
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              Submitting Proof...
                            </>
                          ) : (
                            "Submit Proof of Payment"
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/order-status?id=${encodeURIComponent(successOrderId)}&email=${encodeURIComponent(email)}`}
                className="flex-1 text-center rounded-xl border border-offgrid-green/20 bg-white py-3 font-semibold text-offgrid-green hover:bg-offgrid-cream transition-colors text-sm"
              >
                View Order Status & Receipt
              </Link>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/shop")}
              >
                Return to Shop
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Main Pre-Order Interface */
          <div>
            {/* Top Campaign Banner */}
            <div className="mb-8 rounded-3xl bg-gradient-to-br from-offgrid-green via-offgrid-dark to-offgrid-green p-6 sm:p-8 text-offgrid-cream shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
                <Sparkles className="h-64 w-64 text-offgrid-lime" />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full bg-offgrid-lime px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                      Special Pre-Order Drop
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-offgrid-lime">
                      5% OFF PROMO
                    </span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                    THE SOCIAL CLUB COLLECTION
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-offgrid-cream/80 max-w-xl">
                    100% Heavyweight Cotton boxy cut graphic tee. Designed for everyday athletes, coffee lovers, and off-grid weekends.
                  </p>
                </div>

                {/* Scarcity & Countdown Box */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 backdrop-blur-md">
                  {/* Slots Meter */}
                  <div className="w-full text-left sm:text-right">
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="font-mono text-xs uppercase tracking-wider text-offgrid-cream/70">
                        Remaining Slots
                      </span>
                      <span className="font-mono font-bold text-lg text-offgrid-lime">
                        {loadingSlots ? "..." : slotStatus.remainingSlots} / {PREORDER_MAX_SLOTS}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2 h-2.5 w-full sm:w-48 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-700 rounded-full",
                          slotStatus.remainingSlots <= 5 ? "bg-amber-400" : "bg-offgrid-lime",
                        )}
                        style={{
                          width: `${Math.min(100, ((PREORDER_MAX_SLOTS - slotStatus.remainingSlots) / PREORDER_MAX_SLOTS) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="w-full text-left sm:text-right pt-2 border-t border-white/10">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-offgrid-cream/60 mb-1">
                      Pre-Order Window Closes Oct 9
                    </p>
                    <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                      <Clock className="h-3.5 w-3.5 text-offgrid-lime shrink-0" />
                      <span>
                        {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sold out or Window Closed Banner */}
            {(slotStatus.isSoldOut || isWindowClosed) && (
              <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-600 mb-2" />
                <h3 className="text-xl font-display font-bold text-amber-900">
                  {slotStatus.isSoldOut
                    ? "Pre-Order Sold Out (30/30 Slots Filled)"
                    : "Pre-Order Window Has Ended"}
                </h3>
                <p className="mt-2 text-sm text-amber-800/80 max-w-md mx-auto">
                  Thank you for the overwhelming response! The official collection release starts on October 15 at regular SRP (₱800).
                </p>
                <div className="mt-4">
                  <Button onClick={() => navigate("/shop")}>Explore Other Products</Button>
                </div>
              </div>
            )}

            {/* Two Column Layout: Visuals & Configurator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Visual Showcase */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-offgrid-green/10">
                  <img
                    src={activeDesign.image}
                    alt={activeDesign.name}
                    className="h-full w-full object-cover object-center transition-all duration-500 ease-out"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-offgrid-green/80 backdrop-blur-md px-3.5 py-1 text-xs font-mono font-bold text-offgrid-cream">
                    {activeDesign.name}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-offgrid-cream/95 backdrop-blur-md p-3.5 shadow-sm border border-offgrid-green/10">
                    <p className="font-display font-bold text-sm text-offgrid-green">{activeDesign.name}</p>
                    <p className="text-xs text-offgrid-green/70">{activeDesign.tagline}</p>
                  </div>
                </div>

                {/* Design Thumbnails */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {PREORDER_DESIGNS.map((design) => {
                    const isSelected = selectedDesignName === design.name;
                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => setSelectedDesignName(design.name)}
                        className={cn(
                          "group relative flex flex-col items-center rounded-2xl border-2 p-1.5 transition-all outline-none bg-white",
                          isSelected
                            ? "border-offgrid-lime ring-2 ring-offgrid-lime/20 shadow-md"
                            : "border-offgrid-green/10 hover:border-offgrid-green/30",
                        )}
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-xl bg-offgrid-cream/50">
                          <img
                            src={design.image}
                            alt={design.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <span className="mt-1.5 truncate text-[11px] font-semibold text-offgrid-green w-full text-center">
                          {design.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Garment Highlights */}
                <div className="rounded-2xl border border-offgrid-green/10 bg-white/70 p-5 space-y-2.5 text-xs text-offgrid-green/80">
                  <h4 className="font-display font-bold text-sm text-offgrid-green">Garment Specifications</h4>
                  <ul className="grid grid-cols-2 gap-2 text-xs">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-offgrid-lime shrink-0" />
                      <span>100% Heavyweight Cotton</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-offgrid-lime shrink-0" />
                      <span>Contemporary Boxy Cut</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-offgrid-lime shrink-0" />
                      <span>Durable High-Density Print</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-offgrid-lime shrink-0" />
                      <span>Pre-shrunk Fabric</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Pre-Order Form */}
              <div className="lg:col-span-6">
                <form
                  onSubmit={handleSubmit}
                  className="rounded-3xl border border-offgrid-green/10 bg-white p-6 sm:p-8 shadow-sm space-y-6"
                >
                  {/* Price Block */}
                  <div className="flex items-baseline justify-between border-b border-offgrid-green/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-3xl font-black text-offgrid-green">
                          {formatPrice(PREORDER_PRICE)}
                        </span>
                        <span className="text-sm font-semibold text-offgrid-green/40 line-through">
                          {formatPrice(PREORDER_SRP)}
                        </span>
                        <span className="rounded-full bg-offgrid-lime/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-offgrid-green">
                          -5% OFF
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-offgrid-green/60">
                        Special pre-order price. Regular SRP ₱800 starts October 15.
                      </p>
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-offgrid-green">
                        Select Size
                      </label>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-xs font-semibold text-offgrid-lime hover:underline"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {PREORDER_SIZES.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={cn(
                            "flex h-11 items-center justify-center rounded-xl border text-sm font-bold transition-all outline-none",
                            selectedSize === sz
                              ? "border-offgrid-green bg-offgrid-green text-offgrid-cream shadow-sm"
                              : "border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-green/50",
                          )}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-offgrid-green">
                      Quantity (Max {Math.min(slotStatus.remainingSlots, 5)} per order)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-offgrid-green/20 bg-white p-1">
                        <button
                          type="button"
                          disabled={quantity <= 1}
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-offgrid-green transition-colors hover:bg-offgrid-cream disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-mono font-bold text-base text-offgrid-green">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={quantity >= Math.min(slotStatus.remainingSlots, 5)}
                          onClick={() => setQuantity((q) => Math.min(Math.min(slotStatus.remainingSlots, 5), q + 1))}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-offgrid-green transition-colors hover:bg-offgrid-cream disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-offgrid-green/60">
                        {slotStatus.remainingSlots} slots remaining
                      </span>
                    </div>
                  </div>

                  {/* Claiming Venue Selection */}
                  <div className="space-y-3 pt-2 border-t border-offgrid-green/10">
                    <div>
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-offgrid-green flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-offgrid-lime" />
                        Where will you claim your shirt?
                      </label>
                      <p className="mt-0.5 text-xs text-offgrid-green/60">
                        Free in-person claiming (₱0 shipping fee). Select your pickup partner.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {/* Venue Option 1: Kado Kohi */}
                      <button
                        type="button"
                        onClick={() => setVenueId("kado_kohi")}
                        className={cn(
                          "flex flex-col rounded-2xl border-2 p-4 text-left transition-all outline-none",
                          venueId === "kado_kohi"
                            ? "border-offgrid-green bg-offgrid-green/5 shadow-sm"
                            : "border-offgrid-green/15 bg-white hover:border-offgrid-green/30",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-sm sm:text-base text-offgrid-green">
                            {PREORDER_VENUES.kado_kohi.name}
                          </span>
                          <span className="rounded-full bg-offgrid-lime/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-offgrid-green">
                            Oct 15 Onwards
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-offgrid-green/70">
                          {PREORDER_VENUES.kado_kohi.notes}
                        </p>
                        <a
                          href={PREORDER_VENUES.kado_kohi.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 inline-flex items-center text-xs font-semibold text-offgrid-lime hover:underline"
                        >
                          View Branch on Google Maps <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </button>

                      {/* Venue Option 2: Manila Bloc Fest */}
                      <button
                        type="button"
                        onClick={() => setVenueId("manila_bloc")}
                        className={cn(
                          "flex flex-col rounded-2xl border-2 p-4 text-left transition-all outline-none",
                          venueId === "manila_bloc"
                            ? "border-offgrid-green bg-offgrid-green/5 shadow-sm"
                            : "border-offgrid-green/15 bg-white hover:border-offgrid-green/30",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-sm sm:text-base text-offgrid-green">
                            {PREORDER_VENUES.manila_bloc.name}
                          </span>
                          <span className="rounded-full bg-offgrid-gold/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-offgrid-green">
                            Oct 17 & 18 (Full Duration)
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-offgrid-green/70">
                          {PREORDER_VENUES.manila_bloc.notes}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Customer Contact Details */}
                  <div className="space-y-3 pt-2 border-t border-offgrid-green/10">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-offgrid-green">
                      Claiming Contact Details
                    </label>
                    <div className="space-y-2.5">
                      <div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your Full Name (matches ID upon claiming)"
                          className="w-full rounded-xl border border-offgrid-green/20 bg-white px-3.5 py-2.5 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(formatPhilippinePhoneInput(e.target.value))}
                          placeholder="Mobile Number (e.g. 0917...)"
                          className="w-full rounded-xl border border-offgrid-green/20 bg-white px-3.5 py-2.5 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full rounded-xl border border-offgrid-green/20 bg-white px-3.5 py-2.5 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2.5 pt-2 border-t border-offgrid-green/10">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-offgrid-green flex items-center justify-between">
                      <span>Exclusive Pre-Order Payment</span>
                      <span className="text-[10px] text-offgrid-green/50">Direct QR Transfer</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("gcash")}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all outline-none",
                          paymentMethod === "gcash"
                            ? "border-offgrid-green bg-offgrid-green/5 shadow-sm ring-1 ring-offgrid-lime/40"
                            : "border-offgrid-green/15 bg-white hover:border-offgrid-green/30",
                        )}
                      >
                        <Wallet className="h-5 w-5 text-offgrid-lime shrink-0" />
                        <div>
                          <p className="font-bold text-xs text-offgrid-green">GCash QR</p>
                          <p className="text-[10px] text-offgrid-green/60">InstaPay / GCash</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bdo")}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all outline-none",
                          paymentMethod === "bdo"
                            ? "border-offgrid-green bg-offgrid-green/5 shadow-sm ring-1 ring-offgrid-lime/40"
                            : "border-offgrid-green/15 bg-white hover:border-offgrid-green/30",
                        )}
                      >
                        <Building2 className="h-5 w-5 text-offgrid-lime shrink-0" />
                        <div>
                          <p className="font-bold text-xs text-offgrid-green">BDO QR</p>
                          <p className="text-[10px] text-offgrid-green/60">InstaPay / Bank</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Form Error Alert */}
                  {formError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Summary & Submit */}
                  <div className="pt-2 border-t border-offgrid-green/10 space-y-3">
                    <div className="flex items-center justify-between text-xs text-offgrid-green/70">
                      <span>In-Person Claiming</span>
                      <span className="font-semibold text-offgrid-lime">FREE (₱0)</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-bold text-offgrid-green">
                      <span>Total Due</span>
                      <span className="font-display text-xl">{formatPrice(PREORDER_PRICE * quantity)}</span>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting || slotStatus.isSoldOut || isWindowClosed}
                      className="w-full bg-offgrid-lime font-bold text-white hover:bg-offgrid-lime/90 h-12 shadow-md transition-all text-sm uppercase tracking-wider"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Securing Slot...
                        </>
                      ) : (
                        `Confirm Pre-Order • ${formatPrice(PREORDER_PRICE * quantity)}`
                      )}
                    </Button>
                    <p className="text-center text-[11px] text-offgrid-green/55">
                      By confirming, your piece is reserved from the 30-slot limited batch.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
