import { describe, expect, it } from "vitest";
import { getDiscountPercent, isProductDiscounted, products } from "@/src/data/products";
import { PAYMONGO_PASS_ON_FEES } from "@/src/lib/paymongo";
import { toRetailOrderPayload } from "@/src/types/commerce";
import {
  retailOrderTotalsCentavos,
  retailPayMongoChargeCentavos,
} from "@/src/lib/retailOrderTotals";

const sampleShipping = {
  fullName: "Juan Dela Cruz",
  email: "juan@example.com",
  phone: "+63 917 123 4567",
  address: "123 Test St",
  barangay: "Poblacion",
  city: "Makati",
  province: "Metro Manila",
  region: "NCR",
  zip: "1200",
  regionCode: "130000000",
  provinceCode: "133900000",
  cityCode: "133901000",
  barangayCode: "133901001",
  latitude: null,
  longitude: null,
};

describe("retailOrderTotalsCentavos — discount-safe PayMongo amounts", () => {
  it("keeps pass_on_fees off so OFFGRID absorbs the processing fee", () => {
    // Independent truth: OG-2026-8695 metadata.pass_on_fees=false, fee_centavos=1875, customer paid order total only
    expect(PAYMONGO_PASS_ON_FEES).toBe(false);
  });

  it("matches live OG-2026-8695 (arcade ₱1100 + ₱150 ship = ₱1250)", () => {
    // Independent truth from paid PayMongo session + og_orders.total_centavos
    const totals = retailOrderTotalsCentavos([{ sellingPricePesos: 1100, quantity: 1 }]);
    expect(totals).toEqual({
      subtotalCentavos: 110_000,
      shippingCentavos: 15_000,
      totalCentavos: 125_000,
    });
    expect(retailPayMongoChargeCentavos(totals.totalCentavos)).toBe(125_000);
  });

  it("charges selling price for discounted items, never basePrice", () => {
    const voyager = products.find((p) => p.id === "og-voyager")!;
    expect(isProductDiscounted(voyager)).toBe(true);
    expect(getDiscountPercent(voyager)).toBeGreaterThan(0);
    expect(voyager.basePrice).toBeGreaterThan(voyager.price);

    const withDiscount = retailOrderTotalsCentavos([
      { sellingPricePesos: voyager.price, quantity: 1 },
    ]);
    const ifBasePriceWronglyCharged = retailOrderTotalsCentavos([
      { sellingPricePesos: voyager.basePrice, quantity: 1 },
    ]);

    expect(withDiscount.subtotalCentavos).toBe(Math.round(voyager.price * 100));
    expect(withDiscount.totalCentavos).not.toBe(ifBasePriceWronglyCharged.totalCentavos);
    expect(retailPayMongoChargeCentavos(withDiscount.totalCentavos)).toBe(
      withDiscount.totalCentavos,
    );
  });

  it("sums mixed cart: discounted + full-price lines", () => {
    const voyager = products.find((p) => p.id === "og-voyager")!;
    const arcade = products.find((p) => p.id === "og-arcade")!;
    const totals = retailOrderTotalsCentavos([
      { sellingPricePesos: voyager.price, quantity: 1 },
      { sellingPricePesos: arcade.price, quantity: 2 },
    ]);
    const expectedSub =
      Math.round(voyager.price * 100) + Math.round(arcade.price * 100) * 2;
    expect(totals.subtotalCentavos).toBe(expectedSub);
    expect(totals.shippingCentavos).toBe(expectedSub >= 200_000 ? 0 : 15_000);
    expect(totals.totalCentavos).toBe(expectedSub + totals.shippingCentavos);
  });

  it("toRetailOrderPayload total matches selling-price math (PayMongo input)", () => {
    const voyager = products.find((p) => p.id === "og-voyager")!;
    const order = toRetailOrderPayload(
      [
        {
          productId: voyager.id,
          name: voyager.name,
          image: voyager.image,
          price: voyager.price,
          size: "M",
          color: voyager.colors[0]?.value ?? "black",
          quantity: 1,
        },
      ],
      sampleShipping,
      "paymongo",
      "og-discount-paymongo-1",
    );
    const expected = retailOrderTotalsCentavos([
      { sellingPricePesos: voyager.price, quantity: 1 },
    ]);
    expect(Math.round(order.total.amount * 100)).toBe(expected.totalCentavos);
    expect(Math.round(order.subtotal.amount * 100)).not.toBe(
      Math.round(voyager.basePrice * 100),
    );
  });
});
