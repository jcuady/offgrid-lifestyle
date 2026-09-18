import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { AccountLayout } from "@/src/components/account/AccountLayout";
import { OrderReceiptView } from "@/src/components/orders/OrderReceiptView";
import { Button } from "@/src/components/ui/Button";
import { useOrderDetail } from "@/src/hooks/useOrderDetail";
import { usePortalStore } from "@/src/store/usePortalStore";
import { customPayloadFromManaged } from "@/src/lib/customOrderPayload";

export function CustomerOrderReceiptPage() {
  const { orderId = "" } = useParams();
  const { retail, custom, loading } = useOrderDetail(orderId);
  const currentUser = usePortalStore((s) => s.currentUser);

  const receiptProps = useMemo(() => {
    if (retail) {
      return {
        orderId: retail.id,
        orderType: "retail" as const,
        customerName: retail.customerName,
        customerEmail: retail.customerEmail,
        status: retail.status,
        paymentStatus: retail.paymentStatus,
        createdAt: retail.createdAt,
        paymentMethod: retail.paymentMethod,
        lineItems: retail.lines,
        subtotal: retail.subtotal,
        shipping: retail.shipping,
        tax: retail.tax,
        total: retail.total,
        customPayload: null,
      };
    }
    if (custom) {
      return {
        orderId: custom.id,
        orderType: "custom" as const,
        customerName: custom.customerName,
        customerEmail: custom.customerEmail,
        status: custom.status,
        paymentStatus: custom.paymentStatus,
        createdAt: custom.createdAt,
        paymentMethod: null,
        lineItems: [],
        subtotal: null,
        shipping: null,
        tax: null,
        total: custom.officialTotal ?? custom.estimatedTotal,
        customPayload: customPayloadFromManaged(custom) as unknown as Record<string, unknown>,
      };
    }
    return null;
  }, [retail, custom]);

  return (
    <AccountLayout
      active="orders"
      title="Order receipt"
      backTo={{ to: `/account/orders/${orderId}`, label: "Back to order" }}
    >
      {loading && !receiptProps ? (
        <p className="text-sm text-offgrid-green/60">Loading receipt…</p>
      ) : null}
      {!loading && !receiptProps ? (
        <p className="text-sm text-offgrid-green/60">
          Order not found.{" "}
          <Link to="/account/orders" className="font-semibold underline">
            Back to orders
          </Link>
        </p>
      ) : null}
      {receiptProps ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button type="button" variant="default" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print receipt
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/account/orders/${orderId}`}>Back to order</Link>
            </Button>
          </div>
          <OrderReceiptView {...receiptProps} />
          {currentUser?.role === "customer" ? (
            <p className="text-xs text-offgrid-green/50 print:hidden">
              Receipt for {currentUser.email}
            </p>
          ) : null}
        </div>
      ) : null}
    </AccountLayout>
  );
}
