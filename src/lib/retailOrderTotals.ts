/**
 * Retail money math shared by checkout payload + PayMongo charge expectations.
 * Always uses catalog selling price (product.price), never basePrice / list price.
 * Mirrors DB trigger og_apply_live_retail_prices (centavos + free shipping ≥ ₱2000).
 */

export const FREE_SHIPPING_SUBTOTAL_CENTAVOS = 200_000;
export const STANDARD_SHIPPING_CENTAVOS = 15_000;

export function retailOrderTotalsCentavos(
  lines: { sellingPricePesos: number; quantity: number }[],
): { subtotalCentavos: number; shippingCentavos: number; totalCentavos: number } {
  const subtotalCentavos = lines.reduce((sum, line) => {
    const unit = Math.round(line.sellingPricePesos * 100);
    return sum + unit * line.quantity;
  }, 0);
  const shippingCentavos =
    subtotalCentavos >= FREE_SHIPPING_SUBTOTAL_CENTAVOS ? 0 : STANDARD_SHIPPING_CENTAVOS;
  return {
    subtotalCentavos,
    shippingCentavos,
    totalCentavos: subtotalCentavos + shippingCentavos,
  };
}

/** PayMongo QR Ph retail charge = persisted order total (already post-discount). */
export function retailPayMongoChargeCentavos(totalCentavos: number | null | undefined): number {
  return totalCentavos ?? 0;
}
