import { logger } from "@/src/lib/logger";
import { buildEdgeFunctionHeaders, readEdgeFunctionError } from "@/src/lib/edgeRequest";
import { supabase } from "@/src/lib/supabase";

export type CustomerOrderEmailEvent =
  | "order_confirmed"
  | "in_production"
  | "payment_confirmed"
  | "quote_ready"
  | "shipped"
  | "delivered";

export type OrderEmailEvent = CustomerOrderEmailEvent | "order_receipt_retail" | "order_receipt_custom";

export async function submitContactForm(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const resp = await fetch(`${supabaseUrl}/functions/v1/submit-contact`, {
    method: "POST",
    headers: buildEdgeFunctionHeaders(),
    body: JSON.stringify(input),
  });

  if (!resp.ok) {
    throw new Error(await readEdgeFunctionError(resp));
  }
}

export async function sendOrderEmail(input: {
  event: OrderEmailEvent;
  orderId: string;
  email?: string;
}): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const session = (await supabase.auth.getSession()).data.session;
  const isReceipt = input.event === "order_receipt_retail" || input.event === "order_receipt_custom";

  const resp = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
    method: "POST",
    headers: buildEdgeFunctionHeaders(session?.access_token, isReceipt),
    body: JSON.stringify({
      event: input.event,
      order_id: input.orderId,
      email: input.email,
    }),
  });

  if (!resp.ok) {
    throw new Error(await readEdgeFunctionError(resp));
  }
}

export async function sendOrderReceiptEmail(input: {
  orderId: string;
  email: string;
  orderType: "retail" | "custom";
}): Promise<void> {
  if (!input.email || input.email.endsWith("@offgrid.local")) return;

  try {
    await sendOrderEmail({
      event: input.orderType === "retail" ? "order_receipt_retail" : "order_receipt_custom",
      orderId: input.orderId,
      email: input.email,
    });
    logger.info("Order receipt email sent", {
      operation: "sendOrderReceiptEmail",
      orderId: input.orderId,
      orderType: input.orderType,
    });
  } catch (err) {
    logger.warn("Order receipt email failed", {
      operation: "sendOrderReceiptEmail",
      orderId: input.orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function sendOrderUpdateEmail(input: {
  orderId: string;
  event: CustomerOrderEmailEvent;
}): Promise<void> {
  try {
    await sendOrderEmail({ event: input.event, orderId: input.orderId });
    logger.info("Order update email sent", {
      operation: "sendOrderUpdateEmail",
      orderId: input.orderId,
      event: input.event,
    });
  } catch (err) {
    logger.warn("Order update email failed", {
      operation: "sendOrderUpdateEmail",
      orderId: input.orderId,
      event: input.event,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
