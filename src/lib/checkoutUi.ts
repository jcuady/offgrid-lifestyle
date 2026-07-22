/** Checkout modal UI predicates (kept pure for unit tests). */

export function shouldShowEmptyCartGate(input: {
  cartLength: number;
  checkoutStep: number;
  orderId: string | null;
  placingOrder: boolean;
}): boolean {
  return input.cartLength === 0 && input.checkoutStep < 3 && !input.orderId && !input.placingOrder;
}
