import { buildPageNumbers, pageRange } from "@/src/lib/portalPagination";
import { cn } from "@/src/lib/utils";

interface PortalPaginationProps {
  /** 1-based page index */
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PortalPagination({
  page,
  pageSize,
  total,
  disabled = false,
  onPageChange,
  className,
}: PortalPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const { start, end } = pageRange(page, pageSize, total);
  const numbers = buildPageNumbers(page, pageCount);

  if (total === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-offgrid-green/10 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5",
        className,
      )}
    >
      <p className="font-mono text-[11px] text-offgrid-green/55">
        Showing <span className="tabular-nums text-offgrid-green/80">{start}–{end}</span> of{" "}
        <span className="tabular-nums text-offgrid-green/80">{total}</span>
        {pageCount > 1 ? (
          <>
            {" "}
            · Page <span className="tabular-nums">{page}</span> of <span className="tabular-nums">{pageCount}</span>
          </>
        ) : null}
      </p>

      {pageCount > 1 ? (
        <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
          <button
            type="button"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="min-h-11 cursor-pointer rounded-xl border border-offgrid-green/20 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green transition-colors hover:bg-offgrid-green/5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9"
          >
            Previous
          </button>

          <div className="flex flex-wrap items-center gap-1">
            {numbers.map((entry, i) =>
              entry === "ellipsis" ? (
                <span key={`gap-${i}`} className="select-none px-1 font-mono text-sm text-offgrid-green/40" aria-hidden>
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPageChange(entry)}
                  aria-label={`Page ${entry}`}
                  aria-current={page === entry ? "page" : undefined}
                  className={cn(
                    "flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl px-2.5 font-mono text-sm font-bold tabular-nums transition-colors sm:h-9 sm:min-w-9",
                    page === entry
                      ? "bg-offgrid-green text-offgrid-cream"
                      : "border border-offgrid-green/20 bg-white text-offgrid-green hover:bg-offgrid-green/5",
                  )}
                >
                  {entry}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={disabled || page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="min-h-11 cursor-pointer rounded-xl border border-offgrid-green/20 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green transition-colors hover:bg-offgrid-green/5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
