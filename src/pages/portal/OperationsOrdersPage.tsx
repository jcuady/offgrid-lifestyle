import { useState } from "react";
import type { OrderStatus, PaymentStatus } from "@/src/types/commerce";
import { cn } from "@/src/lib/utils";
import {
  formatOrderStatus,
  formatPaymentStatus,
  orderStatusClass,
  paymentStatusClass,
} from "@/src/lib/portal";
import { usePortalStore, type UserRole } from "@/src/store/usePortalStore";

interface OperationsOrdersPageProps {
  role: UserRole;
}

const ORDER_TRANSITIONS: OrderStatus[] = [
  "pending_deposit",
  "confirmed",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_TRANSITIONS: PaymentStatus[] = ["unpaid", "deposit_paid", "fully_paid", "refunded"];
const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending_deposit", "cancelled"],
  pending_deposit: ["confirmed", "cancelled"],
  confirmed: ["in_production", "cancelled"],
  in_production: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

function canTransitionStatus(current: OrderStatus, next: OrderStatus): boolean {
  return current === next || STATUS_FLOW[current].includes(next);
}

export function OperationsOrdersPage({ role }: OperationsOrdersPageProps) {
  const isAdmin = role === "admin";
  const canUpdateStatus = role === "admin" || role === "staff";
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);
  const updateRetailOrderStatus = usePortalStore((state) => state.updateRetailOrderStatus);
  const updateRetailPaymentStatus = usePortalStore((state) => state.updateRetailPaymentStatus);
  const updateCustomOrderStatus = usePortalStore((state) => state.updateCustomOrderStatus);
  const updateCustomPaymentStatus = usePortalStore((state) => state.updateCustomPaymentStatus);
  const [feedback, setFeedback] = useState<string | null>(null);

  const rows = [...retailOrders.map((entry) => ({ kind: "retail" as const, entry })), ...customOrders.map((entry) => ({ kind: "custom" as const, entry }))]
    .sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        {isAdmin ? "Admin Order Management" : "Staff Order Management"}
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">Orders Board</h1>
      <p className="mt-2 text-sm text-offgrid-green/60">
        {isAdmin
          ? "Process retail and custom orders through each stage."
          : "Staff can update order statuses while payment and catalog controls remain admin-managed."}
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white">
        {feedback && (
          <div className="border-b border-offgrid-green/10 bg-offgrid-green/[0.04] px-4 py-2 text-xs text-offgrid-green/75">
            {feedback}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-offgrid-green/10 text-left">
            <thead className="bg-offgrid-green/5">
              <tr className="text-[10px] uppercase tracking-[0.15em] text-offgrid-green/50">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-offgrid-green/10 text-sm text-offgrid-green">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-offgrid-green/50">
                    No orders yet. Place a retail or custom order from the customer side.
                  </td>
                </tr>
              )}

              {rows.map((row) => {
                const status = row.entry.status;
                const payment = row.entry.paymentStatus;
                const id = row.entry.id;
                const customer = row.kind === "retail" ? row.entry.customerName : row.entry.customerName;

                return (
                  <tr key={`${row.kind}-${id}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-offgrid-green/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                        {row.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3">{customer}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                          orderStatusClass(status),
                        )}
                      >
                        {formatOrderStatus(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                          paymentStatusClass(payment),
                        )}
                      >
                        {formatPaymentStatus(payment)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canUpdateStatus ? (
                        <div className="flex flex-wrap gap-2">
                          <select
                            value={status}
                            onChange={(event) => {
                              const next = event.target.value as OrderStatus;
                              if (!canTransitionStatus(status, next)) {
                                setFeedback(
                                  `Invalid transition: ${formatOrderStatus(status)} → ${formatOrderStatus(next)}.`,
                                );
                                return;
                              }
                              setFeedback(`Order ${id} updated to ${formatOrderStatus(next)}.`);
                              if (row.kind === "retail") {
                                updateRetailOrderStatus(id, next);
                              } else {
                                updateCustomOrderStatus(id, next);
                              }
                            }}
                            className="rounded-lg border border-offgrid-green/20 px-2 py-1 text-xs"
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
                                const next = event.target.value as PaymentStatus;
                                setFeedback(`Payment for ${id} updated to ${formatPaymentStatus(next)}.`);
                                if (row.kind === "retail") {
                                  updateRetailPaymentStatus(id, next);
                                } else {
                                  updateCustomPaymentStatus(id, next);
                                }
                              }}
                              className="rounded-lg border border-offgrid-green/20 px-2 py-1 text-xs"
                            >
                              {PAYMENT_TRANSITIONS.map((entry) => (
                                <option key={entry} value={entry}>
                                  {formatPaymentStatus(entry)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center rounded-lg border border-offgrid-green/15 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-offgrid-green/50">
                              Payment: admin only
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-offgrid-green/50">
                          Staff view-only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
