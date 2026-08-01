-- Root cause: og_validate_retail_order_insert runs as the inserting role (anon/authenticated).
-- It does SELECT … FOR UPDATE + stock UPDATE on og_products, but public RLS only allows SELECT
-- of active rows — no UPDATE for anon. FOR UPDATE then sees zero rows → false
-- "Invalid or inactive product" even when the product is active.
-- Fix: SECURITY DEFINER + locked search_path; revoke direct EXECUTE from clients.

CREATE OR REPLACE FUNCTION public.og_validate_retail_order_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line jsonb;
  prod record;
  qty int;
  line_price numeric;
  variant_price numeric;
  line_centavos bigint;
  subtotal_centavos bigint := 0;
  expected_shipping_centavos int;
  expected_total_centavos bigint;
  updated int;
BEGIN
  IF NEW.order_type IS DISTINCT FROM 'retail' THEN
    RETURN NEW;
  END IF;

  IF NEW.line_items IS NULL
    OR jsonb_typeof(NEW.line_items) <> 'array'
    OR jsonb_array_length(NEW.line_items) = 0 THEN
    RAISE EXCEPTION 'Retail order must include at least one line item';
  END IF;

  FOR line IN SELECT value FROM jsonb_array_elements(NEW.line_items)
  LOOP
    qty := (line->>'quantity')::int;
    IF qty IS NULL OR qty < 1 OR qty > 100 THEN
      RAISE EXCEPTION 'Invalid line item quantity';
    END IF;

    SELECT id, price, status, variants, stock INTO prod
    FROM public.og_products
    WHERE id = line->>'productId'
    FOR UPDATE;

    IF prod.id IS NULL OR prod.status <> 'active' THEN
      RAISE EXCEPTION 'Invalid or inactive product: %', line->>'productId';
    END IF;

    line_price := (line->'priceSnapshot'->>'amount')::numeric;
    IF line->>'variantSku' IS NOT NULL AND btrim(line->>'variantSku') <> '' THEN
      SELECT (v->>'priceOverride')::numeric INTO variant_price
      FROM jsonb_array_elements(COALESCE(prod.variants, '[]'::jsonb)) AS v
      WHERE v->>'sku' = line->>'variantSku'
        AND COALESCE((v->>'isActive')::boolean, true)
      LIMIT 1;

      IF variant_price IS NOT NULL THEN
        IF line_price IS NULL OR line_price <> variant_price THEN
          RAISE EXCEPTION 'Variant price mismatch for product %', line->>'productId';
        END IF;
      ELSIF line_price IS NULL OR line_price <> prod.price THEN
        RAISE EXCEPTION 'Price mismatch for product %', line->>'productId';
      END IF;
    ELSIF line_price IS NULL OR line_price <> prod.price THEN
      RAISE EXCEPTION 'Price mismatch for product %', line->>'productId';
    END IF;

    IF prod.stock IS NOT NULL THEN
      UPDATE public.og_products
      SET stock = stock - qty
      WHERE id = prod.id
        AND stock IS NOT NULL
        AND stock >= qty;
      GET DIAGNOSTICS updated = ROW_COUNT;
      IF updated <> 1 THEN
        RAISE EXCEPTION 'Insufficient stock for product %', line->>'productId';
      END IF;
    END IF;

    line_centavos := round(line_price * 100)::bigint * qty;
    subtotal_centavos := subtotal_centavos + line_centavos;
  END LOOP;

  IF subtotal_centavos >= 200000 THEN
    expected_shipping_centavos := 0;
  ELSE
    expected_shipping_centavos := 15000;
  END IF;

  expected_total_centavos := subtotal_centavos + expected_shipping_centavos;

  IF NEW.subtotal_centavos IS DISTINCT FROM subtotal_centavos THEN
    RAISE EXCEPTION 'Subtotal mismatch';
  END IF;

  IF COALESCE(NEW.shipping_centavos, 0) IS DISTINCT FROM expected_shipping_centavos THEN
    RAISE EXCEPTION 'Shipping mismatch';
  END IF;

  IF COALESCE(NEW.tax_centavos, 0) <> 0 THEN
    RAISE EXCEPTION 'Tax must be zero for retail orders';
  END IF;

  IF NEW.total_centavos IS DISTINCT FROM expected_total_centavos THEN
    RAISE EXCEPTION 'Total mismatch';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.og_validate_retail_order_insert() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.og_validate_retail_order_insert() TO postgres, service_role;

COMMENT ON FUNCTION public.og_validate_retail_order_insert IS
  'SECURITY DEFINER: validates retail prices/totals and decrements stock (null stock = unlimited). Bypasses product RLS so anon checkout FOR UPDATE works.';
