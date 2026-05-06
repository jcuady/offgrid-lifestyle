import { toRetailOrderPayload, type CustomOrderDraft, type ShippingInfo } from "@/src/types/commerce";
import { usePortalStore } from "@/src/store/usePortalStore";

export interface RetailCartLineInput {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface SubmitRetailOrderInput {
  orderId: string;
  cart: RetailCartLineInput[];
  shippingInfo: ShippingInfo;
  paymentMethod: string;
}

export interface OrderService {
  submitRetailOrder: (input: SubmitRetailOrderInput) => string;
  submitCustomOrder: (draft: CustomOrderDraft) => string;
}

export const localOrderService: OrderService = {
  submitRetailOrder: ({ orderId, cart, shippingInfo, paymentMethod }) => {
    const retailOrderPayload = toRetailOrderPayload(cart, shippingInfo, paymentMethod, orderId);
    const currentUser = usePortalStore.getState().currentUser;
    const fallbackName = shippingInfo.fullName || currentUser?.name || "Guest Customer";
    const fallbackEmail = shippingInfo.email || currentUser?.email || "guest@offgrid.local";

    if (currentUser?.role === "customer") {
      retailOrderPayload.customerId = currentUser.id;
    }

    usePortalStore.getState().recordRetailOrder(retailOrderPayload, fallbackName, fallbackEmail);
    return orderId;
  },
  submitCustomOrder: (draft) => usePortalStore.getState().recordCustomOrder(draft),
};
