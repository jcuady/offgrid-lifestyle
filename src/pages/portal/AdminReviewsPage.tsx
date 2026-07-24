import { useCallback, useEffect, useState } from "react";
import { Check, Star, Trash2, X, MessageSquare } from "lucide-react";
import { reviewService, type ProductReview, type ReviewStatus } from "@/src/services/reviewService";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { cn } from "@/src/lib/utils";

type StatusFilter = "all" | ReviewStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-offgrid-lime/40 bg-offgrid-lime/15 text-offgrid-green",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("h-3.5 w-3.5", n <= rating ? "fill-offgrid-lime text-offgrid-lime" : "fill-none text-offgrid-green/20")} />
      ))}
    </div>
  );
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await reviewService.listAll();
    setReviews(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  const filtered = statusFilter === "all" ? reviews : reviews.filter((r) => r.status === statusFilter);

  const setStatus = async (id: string, status: ReviewStatus) => {
    await reviewService.setStatus(id, status);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this review permanently?")) return;
    await reviewService.remove(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <PortalPageHeader
        eyebrow="Admin"
        title="Customer Reviews"
        description="Moderate reviews before they appear on product pages. Approved reviews are visible to all shoppers."
      />

      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
              statusFilter === tab.id
                ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                : "border-offgrid-green/15 bg-white text-offgrid-green/70 hover:border-offgrid-lime/50 hover:text-offgrid-green",
            )}
          >
            {tab.label}
            <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[9px] font-bold tabular-nums">
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white/60 p-12 text-center">
          <p className="text-sm text-offgrid-green/55">Loading reviews…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white/60 p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-offgrid-green/30" />
          <p className="mt-3 text-sm text-offgrid-green/60">
            {statusFilter === "pending" ? "No pending reviews to moderate." : `No ${statusFilter} reviews.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-offgrid-green">{review.productName}</p>
                    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]", STATUS_BADGE[review.status])}>
                      {review.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-offgrid-green/50">
                    Order {review.orderId} · {review.customerName} ({review.customerEmail})
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {review.status !== "approved" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(review.id, "approved")}
                      title="Approve"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-offgrid-lime/40 bg-offgrid-lime/10 px-3 py-1.5 text-xs font-semibold text-offgrid-green transition-colors hover:bg-offgrid-lime/20"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                  ) : null}
                  {review.status !== "rejected" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(review.id, "rejected")}
                      title="Reject"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => remove(review.id)}
                    title="Delete permanently"
                    className="inline-flex items-center justify-center rounded-lg border border-offgrid-green/15 p-1.5 text-offgrid-green/50 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <StarDisplay rating={review.rating} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/40">
                  {review.rating}/5
                </span>
              </div>
              <p className="mt-2 font-semibold text-sm text-offgrid-green">{review.title}</p>
              <p className="mt-1 text-sm text-offgrid-green/70 leading-relaxed">{review.body}</p>
              {review.imageUrl ? (
                <img
                  src={review.imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="mt-3 max-h-56 max-w-full rounded-xl border border-offgrid-green/10 object-contain"
                />
              ) : null}
              <p className="mt-3 text-[10px] text-offgrid-green/40">
                Submitted {new Date(review.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
