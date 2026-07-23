/** Checkout modal UI predicates (kept pure for unit tests). */

export function shouldShowEmptyCartGate(input: {
  cartLength: number;
  checkoutStep: number;
  orderId: string | null;
  placingOrder: boolean;
}): boolean {
  return input.cartLength === 0 && input.checkoutStep < 3 && !input.orderId && !input.placingOrder;
}

/** Compact mobile summary label: "1 item" / "3 items". */
export function checkoutCartItemLabel(itemCount: number): string {
  const n = Math.max(0, Math.floor(itemCount));
  return n === 1 ? "1 item" : `${n} items`;
}

/** Line count for summary (each cart line, not summed qty). */
export function checkoutCartLineCount(lines: ReadonlyArray<{ quantity: number }>): number {
  return lines.reduce((sum, line) => sum + Math.max(0, line.quantity), 0);
}
