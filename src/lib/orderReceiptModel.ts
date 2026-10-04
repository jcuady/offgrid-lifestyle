import type { OrderReceiptViewProps } from "@/src/components/orders/OrderReceiptView";
import { customPayloadFromManaged } from "@/src/lib/customOrderPayload";
import type { ManagedCustomOrder, ManagedRetailOrder } from "@/src/store/usePortalStore";

export function receiptPropsFromRetail(retail: ManagedRetailOrder): OrderReceiptViewProps {
  return {
    orderId: retail.id,
    orderType: "retail",
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
    shippingInfo: retail.shippingInfo as unknown as Record<string, unknown>,
    customPayload: null,
  };
}

export function receiptPropsFromCustom(custom: ManagedCustomOrder): OrderReceiptViewProps {
  return {
    orderId: custom.id,
    orderType: "custom",
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
