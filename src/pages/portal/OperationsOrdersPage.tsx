import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { OrderStatus, PaymentStatus } from "@/src/types/commerce";
import {
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  formatPaymentMethodLabel,
  formatOrderStatus,
  formatOrderTimestamp,
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
import { usePortalStore, type ManagedCustomOrder, type ManagedRetailOrder, type UserRole } from "@/src/store/usePortalStore";
import { localOrderService } from "@/src/services";
import { persistOrderPaymentUpdate, persistOrderStatusUpdate } from "@/src/lib/opsOrderUpdate";
import { Button } from "@/src/components/ui/Button";
import { useEnsureOrdersLoaded } from "@/src/hooks/useEnsureOrdersLoaded";

interface OperationsOrdersPageProps {
  role: UserRole;
}

type OrderKind = "retail" | "custom";
type TypeFilter = "all" | OrderKind;
type QuoteFilter = "all" | "official" | "pending";

type Row = { kind: "retail"; entry: ManagedRetailOrder } | { kind: "custom"; entry: ManagedCustomOrder };

function OrderFilterToggle({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-offgrid-green bg-offgrid-green text-offgrid-cream shadow-sm"
          : "border-offgrid-green/15 bg-white text-offgrid-green/70 hover:border-offgrid-lime/60 hover:text-offgrid-green",
      )}
    >
      {children}
    </button>
  );
}

export function OperationsOrdersPage({ role }: OperationsOrdersPageProps) {
  useEnsureOrdersLoaded();
  const isAdmin = role === "admin";
  const ordersBase = role === "admin" ? "/portal/admin/orders" : "/portal/staff/orders";
  const canUpdateStatus = role === "admin" || role === "staff";
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);
  const updateRetailOrderStatus = usePortalStore((state) => state.updateRetailOrderStatus);
  const updateRetailPaymentStatus = usePortalStore((state) => state.updateRetailPaymentStatus);
  const updateCustomOrderStatus = usePortalStore((state) => state.updateCustomOrderStatus);
  const updateCustomPaymentStatus = usePortalStore((state) => state.updateCustomPaymentStatus);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");
  const [quoteFilter, setQuoteFilter] = useState<QuoteFilter>("all");
  const [view, setView] = useState<"table" | "cards">(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? "cards" : "table",
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      if (mq.matches) setView("cards");
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const allRows = useMemo(() => {
    const list: Row[] = [
      ...retailOrders.map((entry) => ({ kind: "retail" as const, entry })),
      ...customOrders.map((entry) => ({ kind: "custom" as const, entry })),
    ];
    return list.sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());
  }, [retailOrders, customOrders]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (typeFilter !== "all" && row.kind !== typeFilter) return false;
      if (statusFilter !== "all" && row.entry.status !== statusFilter) return false;
      if (paymentFilter !== "all" && row.entry.paymentStatus !== paymentFilter) return false;

      if (quoteFilter === "official") {
        if (row.kind !== "custom" || !hasOfficialCustomQuote(row.entry.officialTotal)) return false;
      }
      if (quoteFilter === "pending") {
        if (row.kind !== "custom" || hasOfficialCustomQuote(row.entry.officialTotal)) return false;
      }

      if (q) {
        const id = row.entry.id.toLowerCase();
        const name = row.entry.customerName.toLowerCase();
        const email = row.entry.customerEmail.toLowerCase();
        if (!id.includes(q) && !name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [allRows, query, typeFilter, statusFilter, paymentFilter, quoteFilter]);

  const hasActiveFilters =
    query.trim() !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    quoteFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setPaymentFilter("all");
    setQuoteFilter("all");
  };

  const detailHref = (id: string) => `${ordersBase}/${encodeURIComponent(id)}`;

  const renderRowActions = (row: Row) => {
    const id = row.entry.id;
    const status = row.entry.status;
    const payment = row.entry.paymentStatus;
    if (!canUpdateStatus) {
      return <span className="text-xs text-offgrid-green/50">View only</span>;
    }
    return (
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(event) => {
            void (async () => {
              const next = event.target.value as OrderStatus;
              if (!canTransitionStatus(status, next, isAdmin ? { unrestricted: true } : undefined)) {
                setFeedback(`Invalid transition: ${formatOrderStatus(status)} → ${formatOrderStatus(next)}.`);
                return;
              }
              try {
                await persistOrderStatusUpdate({
                  orderId: id,
                  previousStatus: status,
                  next,
                  applyStore: (value) => {
                    if (row.kind === "retail") updateRetailOrderStatus(id, value);
                    else updateCustomOrderStatus(id, value);
                  },
                });
                setFeedback(`Order ${id} → ${formatOrderStatus(next)}.`);
              } catch (err) {
                setFeedback(err instanceof Error ? err.message : "Could not update order status.");
              }
            })();
          }}
          className="max-w-[10.5rem] rounded-xl border border-offgrid-green/18 bg-offgrid-cream/30 px-2.5 py-2 text-xs text-offgrid-green shadow-sm focus:border-offgrid-lime focus:outline-none focus:ring-2 focus:ring-offgrid-lime/35"
        >
          {ORDER_TRANSITIONS.map((entry) => (
            <option key={entry} value={entry}>
              {formatOrderStatus(entry)}
            </option>
          ))}
        </select>
        {isAdmin ? (
          <select
            value={payment}
            onChange={(event) => {
              void (async () => {
                const next = event.target.value as PaymentStatus;
                try {
                  await persistOrderPaymentUpdate({
                    orderId: id,
                    previousStatus: payment,
                    next,
                    applyStore: (value) => {
                      if (row.kind === "retail") updateRetailPaymentStatus(id, value);
                      else updateCustomPaymentStatus(id, value);
                    },
                  });
                  setFeedback(`Payment → ${formatPaymentStatus(next)}.`);
                } catch (err) {
                  setFeedback(err instanceof Error ? err.message : "Could not update payment status.");
                }
              })();
            }}
            className="max-w-[9.5rem] rounded-xl border border-offgrid-green/18 bg-offgrid-cream/30 px-2.5 py-2 text-xs text-offgrid-green shadow-sm focus:border-offgrid-lime focus:outline-none focus:ring-2 focus:ring-offgrid-lime/35"
          >
            {PAYMENT_TRANSITIONS.map((entry) => (
              <option key={entry} value={entry}>
                {formatPaymentStatus(entry)}
              </option>
            ))}
          </select>
        ) : (
          <span className="inline-flex items-center rounded-xl border border-offgrid-green/12 bg-offgrid-cream/40 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-offgrid-green/50">
            Payment: admin
          </span>
        )}
      </div>
    );
  };

  const fulfillmentBadge = (row: Row) => (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        orderStatusClass(row.entry.status),
      )}
    >
      {formatOrderStatus(row.entry.status)}
    </span>
  );

  const paymentBadge = (row: Row) => (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        paymentStatusClass(row.entry.paymentStatus),
      )}
    >
      {formatPaymentStatus(row.entry.paymentStatus)}
    </span>
  );

  const quoteBadge = (row: Row) => {
    if (row.kind !== "custom") {
      return <span className="text-xs font-medium text-offgrid-green/35">—</span>;
    }
    const ready = hasOfficialCustomQuote(row.entry.officialTotal);
    return (
      <span
        className={cn(
          "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]",
          ready
            ? "border-offgrid-green/25 bg-offgrid-lime/25 text-offgrid-green"
            : "border-offgrid-green/15 bg-offgrid-cream text-offgrid-green/70",
        )}
      >
        {ready ? "Official" : "Pending"}
      </span>
    );
  };

  const typeBadge = (kind: OrderKind) => (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
        kind === "custom"
          ? "border-offgrid-green/30 bg-offgrid-green text-offgrid-cream"
          : "border-offgrid-green/12 bg-white text-offgrid-green",
      )}
    >
      {kind}
    </span>
  );

  return (
    <div className="min-h-full min-w-0 overflow-x-hidden">
      <section className="border-b border-offgrid-green/10 bg-offgrid-green/[0.06] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-offgrid-green/45">
          {isAdmin ? "Admin · Order management" : "Staff · Operations"}
        </p>
        <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-lime">Est. Manila, PH</p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-offgrid-green sm:text-5xl">Orders</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-offgrid-green/65">
          {isAdmin
            ? "Search by order ID, name, or email. Filter by pipeline stage, then open any row for full details, specs, and official custom quotes."
            : "Search and filter the queue. Open an order for context; status updates are available here and on the detail page."}
        </p>
      </section>

      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8 lg:space-y-8 lg:px-10 lg:py-10">
        <div className="rounded-2xl border border-offgrid-green/[0.09] bg-white p-4 shadow-[0_2px_28px_-8px_rgba(0,0,0,0.08)] ring-1 ring-offgrid-green/[0.05] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/35"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order ID, customer name, or email…"
                className="w-full rounded-xl border border-offgrid-green/15 bg-offgrid-cream/40 py-3 pl-10 pr-10 text-sm text-offgrid-green placeholder:text-offgrid-green/40 shadow-inner focus:border-offgrid-lime focus:bg-white focus:outline-none focus:ring-2 focus:ring-offgrid-lime/30"
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-offgrid-green/45 hover:bg-offgrid-green/5 hover:text-offgrid-green"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/30 p-1">
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                  view === "table"
                    ? "bg-offgrid-green text-offgrid-cream shadow-sm"
                    : "text-offgrid-green/60 hover:text-offgrid-green",
                )}
              >
                <List className="h-4 w-4" />
                Table
              </button>
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                  view === "cards"
                    ? "bg-offgrid-green text-offgrid-cream shadow-sm"
                    : "text-offgrid-green/60 hover:text-offgrid-green",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Cards
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-offgrid-green/[0.07] pt-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-offgrid-green/40" aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">Filters</span>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-lime hover:text-offgrid-green"
                >
                  <Filter className="h-3 w-3" />
                  Reset all
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/40">Type</p>
                <div className="flex flex-wrap gap-2">
                  {(["all", "retail", "custom"] as const).map((t) => (
                    <Fragment key={t}>
                      <OrderFilterToggle active={typeFilter === t} onClick={() => setTypeFilter(t)}>
                        {t === "all" ? "All types" : t}
                      </OrderFilterToggle>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/40">Fulfillment</p>
                <div className="flex max-w-full flex-wrap gap-2">
                  <OrderFilterToggle active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                    All stages
                  </OrderFilterToggle>
                  {ORDER_TRANSITIONS.map((s) => (
                    <Fragment key={s}>
                      <OrderFilterToggle active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                        {formatOrderStatus(s)}
                      </OrderFilterToggle>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/40">Payment</p>
                <div className="flex flex-wrap gap-2">
                  <OrderFilterToggle active={paymentFilter === "all"} onClick={() => setPaymentFilter("all")}>
                    All payments
                  </OrderFilterToggle>
                  {PAYMENT_TRANSITIONS.map((p) => (
                    <Fragment key={p}>
                      <OrderFilterToggle active={paymentFilter === p} onClick={() => setPaymentFilter(p)}>
                        {formatPaymentStatus(p)}
                      </OrderFilterToggle>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/40">
                  Custom quote
                </p>
                <div className="flex flex-wrap gap-2">
                  <OrderFilterToggle active={quoteFilter === "all"} onClick={() => setQuoteFilter("all")}>
                    All quotes
                  </OrderFilterToggle>
                  <OrderFilterToggle active={quoteFilter === "official"} onClick={() => setQuoteFilter("official")}>
                    Official saved
                  </OrderFilterToggle>
                  <OrderFilterToggle active={quoteFilter === "pending"} onClick={() => setQuoteFilter("pending")}>
                    Awaiting quote
                  </OrderFilterToggle>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-offgrid-green/55">
            Showing <span className="font-semibold text-offgrid-green">{filteredRows.length}</span> of{" "}
            <span className="font-semibold text-offgrid-green">{allRows.length}</span> orders
          </p>
        </div>

        {feedback ? (
          <div className="rounded-xl border border-offgrid-green/12 bg-offgrid-lime/10 px-4 py-3 text-sm text-offgrid-green">
            {feedback}
          </div>
        ) : null}

        {filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white px-8 py-16 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-offgrid-green">
              {allRows.length === 0 ? "No orders yet" : "No matches"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-offgrid-green/60">
              {allRows.length === 0
                ? "Retail checkouts and custom requests will appear here for your team."
                : "Try clearing filters or broadening your search."}
            </p>
            {hasActiveFilters && allRows.length > 0 ? (
              <Button variant="outline" className="mt-6" onClick={clearFilters}>
                Reset filters
              </Button>
            ) : null}
          </div>
        ) : view === "table" ? (
          <div className="overflow-hidden rounded-2xl border border-offgrid-green/[0.09] bg-white shadow-[0_2px_28px_-8px_rgba(0,0,0,0.08)] ring-1 ring-offgrid-green/[0.05]">
            <div className="overflow-x-auto">
              <table className="min-w-[880px] w-full text-left">
                <thead>
                  <tr className="border-b border-offgrid-green/[0.08] bg-offgrid-green/[0.04] text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/50">
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Order</th>
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Customer</th>
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Type</th>
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Fulfillment</th>
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Payment</th>
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Method</th>
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Quote</th>
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Placed</th>
                    <th className="px-4 py-3.5 font-semibold sm:px-5">Actions</th>
                    <th className="px-4 py-3.5 pr-5 font-semibold sm:px-5"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-offgrid-green/[0.06] text-sm text-offgrid-green">
                  {filteredRows.map((row) => {
                    const id = row.entry.id;
                    const href = detailHref(id);
                    return (
                      <tr
                        key={`${row.kind}-${id}`}
                        className="group transition-colors hover:bg-offgrid-cream/50"
                      >
                        <td className="px-4 py-3.5 align-top sm:px-5">
                          <Link
                            to={href}
                            className="inline-flex flex-col gap-0.5 rounded-lg font-mono text-sm font-semibold text-offgrid-green underline decoration-offgrid-lime/50 decoration-2 underline-offset-2 transition-colors hover:decoration-offgrid-lime"
                          >
                            {id}
                            <span className="font-sans text-[10px] font-normal uppercase tracking-[0.14em] text-offgrid-green/45 no-underline">
                              Open details
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 align-top sm:px-5">
                          <p className="font-medium text-offgrid-green">{row.entry.customerName}</p>
                          <p className="mt-0.5 text-xs text-offgrid-green/55">{row.entry.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3.5 align-top sm:px-5">{typeBadge(row.kind)}</td>
                        <td className="px-4 py-3.5 align-top sm:px-5">{fulfillmentBadge(row)}</td>
                        <td className="px-4 py-3.5 align-top sm:px-5">{paymentBadge(row)}</td>
                        <td className="px-4 py-3.5 align-top text-xs text-offgrid-green/75 sm:px-5">
                          {row.kind === "retail" ? formatPaymentMethodLabel(row.entry.paymentMethod) : "Custom flow"}
                        </td>
                        <td className="px-4 py-3.5 align-top sm:px-5">{quoteBadge(row)}</td>
                        <td className="px-4 py-3.5 align-top text-xs text-offgrid-green/65 sm:px-5">
                          {formatOrderTimestamp(row.entry.createdAt)}
                        </td>
                        <td className="px-4 py-3.5 align-top sm:px-5">{renderRowActions(row)}</td>
                        <td className="px-4 py-3.5 pr-5 align-top sm:px-5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap border-offgrid-green/25 bg-white text-offgrid-green hover:border-offgrid-lime hover:bg-offgrid-lime/15"
                            asChild
                          >
                            <Link to={href} className="inline-flex items-center gap-1">
                              View
                              <ChevronRight className="h-3.5 w-3.5 text-offgrid-lime" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRows.map((row) => {
              const id = row.entry.id;
              const href = detailHref(id);
              return (
                <div
                  key={`${row.kind}-${id}`}
                  className="flex flex-col rounded-2xl border border-offgrid-green/[0.09] bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.04]"
                >
                  <Link to={href} className="group min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all font-mono text-sm font-bold text-offgrid-green">{id}</p>
                        <p className="mt-2 text-sm font-semibold text-offgrid-green">{row.entry.customerName}</p>
                        <p className="mt-0.5 truncate text-xs text-offgrid-green/55">{row.entry.customerEmail}</p>
                      </div>
                      {typeBadge(row.kind)}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {fulfillmentBadge(row)}
                      {paymentBadge(row)}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-offgrid-green/[0.07] pt-3">
                      <div>{quoteBadge(row)}</div>
                      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-offgrid-green/45">
                        {formatOrderTimestamp(row.entry.createdAt)}
                      </span>
                    </div>
                  </Link>
                  {canUpdateStatus ? (
                    <div className="mt-4 border-t border-offgrid-green/[0.07] pt-4">{renderRowActions(row)}</div>
                  ) : null}
                  <Link
                    to={href}
                    className="mt-3 inline-flex min-h-11 items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-lime"
                  >
                    View order
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
