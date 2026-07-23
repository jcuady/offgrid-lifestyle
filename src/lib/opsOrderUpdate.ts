import type { CustomOrderDraft, OrderStatus, PaymentStatus } from "@/src/types/commerce";
import { supabaseOrderService } from "@/src/services/orderService";
import { notifyCustomerOrderEvent } from "@/src/lib/customerNotifications";
import {
  customerEventForFulfillmentStatus,
  customerEventForPaymentStatus,
  fulfillmentAfterPaymentSettle,
} from "@/src/lib/customerNotifyEvents";

export { CUSTOM_ORDER_SUBMIT_PHASES, mergeCustomOrderDraftWithFiles } from "@/src/lib/customOrderSubmit";

/**
 * Persist fulfillment status, then notify the customer.
 * Actor-agnostic: admin and staff share this path; notify runs only after durable write.
 */
export async function persistOrderStatusUpdate(params: {
  orderId: string;
  previousStatus: OrderStatus;
  next: OrderStatus;
  customerId?: string | null;
  applyStore: (status: OrderStatus) => void;
}): Promise<void> {
  params.applyStore(params.next);
  try {
    await supabaseOrderService.updateOrderField(params.orderId, { status: params.next });
  } catch (err) {
    params.applyStore(params.previousStatus);
    throw err;
  }

  if (params.previousStatus === params.next) return;
  const event = customerEventForFulfillmentStatus(params.next);
  if (event) {
    void notifyCustomerOrderEvent(params.customerId, params.orderId, event);
  }
}

/**
 * Persist payment status, mirror DB advance-on-payment in the store, then notify.
 */
export async function persistOrderPaymentUpdate(params: {
  orderId: string;
  previousStatus: PaymentStatus;
  next: PaymentStatus;
  customerId?: string | null;
  previousFulfillmentStatus?: OrderStatus;
  applyStore: (status: PaymentStatus) => void;
  applyFulfillmentStore?: (status: OrderStatus) => void;
}): Promise<void> {
  const advanced =
    params.previousFulfillmentStatus != null
      ? fulfillmentAfterPaymentSettle(
          params.previousFulfillmentStatus,
          params.previousStatus,
          params.next,
        )
      : null;

  params.applyStore(params.next);
  if (advanced && params.applyFulfillmentStore) {
    params.applyFulfillmentStore(advanced);
  }

  try {
    await supabaseOrderService.updateOrderField(params.orderId, { payment_status: params.next });
  } catch (err) {
    params.applyStore(params.previousStatus);
    if (advanced && params.applyFulfillmentStore && params.previousFulfillmentStatus) {
      params.applyFulfillmentStore(params.previousFulfillmentStatus);
    }
    throw err;
  }

  if (params.previousStatus === params.next) return;

  const payEvent = customerEventForPaymentStatus(params.next);
  if (payEvent) {
    void notifyCustomerOrderEvent(params.customerId, params.orderId, payEvent);
  }
  if (advanced) {
    void notifyCustomerOrderEvent(params.customerId, params.orderId, "order_confirmed");
  }
}
