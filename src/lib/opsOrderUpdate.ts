import type { CustomOrderDraft, OrderStatus, PaymentStatus } from "@/src/types/commerce";
import { supabaseOrderService } from "@/src/services/orderService";

export { CUSTOM_ORDER_SUBMIT_PHASES, mergeCustomOrderDraftWithFiles } from "@/src/lib/customOrderSubmit";

export async function persistOrderStatusUpdate(params: {
  orderId: string;
  previousStatus: OrderStatus;
  next: OrderStatus;
  applyStore: (status: OrderStatus) => void;
}): Promise<void> {
  params.applyStore(params.next);
  try {
    await supabaseOrderService.updateOrderField(params.orderId, { status: params.next });
  } catch (err) {
    params.applyStore(params.previousStatus);
    throw err;
  }
}

export async function persistOrderPaymentUpdate(params: {
  orderId: string;
  previousStatus: PaymentStatus;
  next: PaymentStatus;
  applyStore: (status: PaymentStatus) => void;
}): Promise<void> {
  params.applyStore(params.next);
  try {
    await supabaseOrderService.updateOrderField(params.orderId, { payment_status: params.next });
  } catch (err) {
    params.applyStore(params.previousStatus);
    throw err;
  }
}