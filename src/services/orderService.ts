import { toRetailOrderPayload, type CustomOrderDraft, type ShippingInfo } from "@/src/types/commerce";
import { usePortalStore } from "@/src/store/usePortalStore";
import { finalizeCustomOrderFiles } from "@/src/lib/customOrderFiles";
import { validateCustomOrderDraft, validateShippingInfo } from "@/src/lib/formValidation";
import { checkoutPaymentConfigFromSettings, validateRetailPaymentMethod } from "@/src/types/payments";

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
  submitCustomOrder: (draft: CustomOrderDraft) => Promise<string>;
}

/** Persists via `usePortalStore` (localStorage). Production: POST to an API and email admins (e.g. Resend). */
export const localOrderService: OrderService = {
  submitRetailOrder: ({ orderId, cart, shippingInfo, paymentMethod }) => {
    if (!cart.length) {
      throw new Error("Your cart is empty. Add items before checking out.");
    }
    const shippingError = validateShippingInfo(shippingInfo);
    if (shippingError) {
      throw new Error(shippingError);
    }

    const paymentConfig = checkoutPaymentConfigFromSettings(usePortalStore.getState().paymentSettings);
    const paymentError = validateRetailPaymentMethod(paymentMethod, paymentConfig);
    if (paymentError) {
      throw new Error(paymentError);
    }

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
  submitCustomOrder: async (draft) => {
    const validationErrors = validateCustomOrderDraft(draft);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]);
    }

    const orderId =
      draft.id ?? `CO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fileKeys = await finalizeCustomOrderFiles(orderId, draft.designFileKey, draft.orderSheetFileKey);
    const finalDraft: CustomOrderDraft = {
      ...draft,
      id: orderId,
      designFileKey: fileKeys.designFileKey ?? draft.designFileKey,
      orderSheetFileKey: fileKeys.orderSheetFileKey ?? draft.orderSheetFileKey,
    };
    return usePortalStore.getState().recordCustomOrder(finalDraft);
  },
};
