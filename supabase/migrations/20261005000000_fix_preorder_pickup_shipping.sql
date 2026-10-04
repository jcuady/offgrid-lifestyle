-- Fix for pre-order and in-person pickup shipping calculation.
-- Waive shipping (0 centavos) whenever:
-- 1. shipping_info->>'fulfillmentType' = 'pickup', OR
-- 2. shipping_info->>'pickupVenue' IS NOT NULL, OR
-- 3. order id starts with 'PRE-', OR
-- 4. shipping_centavos is explicitly passed as 0.
-- Standard home delivery orders under 200,000 centavos (₱2,000) retain the 15,000 centavos (₱150) fee.

-- 1. og_apply_live_retail_prices (BEFORE INSERT)
CREATE OR REPLACE FUNCTION public.og_apply_live_retail_prices()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_line jsonb;
  product_row public.og_products%ROWTYPE;
  normalized_lines jsonb := '[]'::jsonb;
  quantity_value integer;
  subtotal_value bigint := 0;
  is_pickup boolean := false;
BEGIN
  IF NEW.order_type <> 'retail' THEN
    RETURN NEW;
  END IF;

  IF NEW.line_items IS NULL
     OR jsonb_typeof(NEW.line_items) <> 'array'
     OR jsonb_array_length(NEW.line_items) = 0 THEN
    RAISE EXCEPTION 'Retail order requires at least one line item.';
  END IF;

  FOR source_line IN SELECT value FROM jsonb_array_elements(NEW.line_items)
  LOOP
    quantity_value := coalesce((source_line->>'quantity')::integer, 0);
    IF quantity_value < 1 OR quantity_value > 100 THEN
      RAISE EXCEPTION 'Retail line quantity must be between 1 and 100.';
    END IF;

    SELECT *
      INTO product_row
      FROM public.og_products
     WHERE id = source_line->>'productId'
       AND status = 'active';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A selected product is unavailable.';
    END IF;

    subtotal_value := subtotal_value + round(product_row.price * 100)::bigint * quantity_value;
    normalized_lines := normalized_lines || jsonb_build_array(
      source_line
      || jsonb_build_object(
        'name', product_row.name,
        'image', product_row.image,
        'priceSnapshot', jsonb_build_object(
          'amount', product_row.price,
          'currency', 'PHP'
        )
      )
    );
  END LOOP;

  NEW.line_items := normalized_lines;
  NEW.subtotal_centavos := subtotal_value;

  -- Determine if order is in-person pickup or pre-order
  is_pickup := coalesce(NEW.shipping_info->>'fulfillmentType', '') = 'pickup'
               OR NEW.shipping_info->>'pickupVenue' IS NOT NULL
               OR NEW.id LIKE 'PRE-%'
               OR coalesce(NEW.shipping_centavos, -1) = 0;

  IF is_pickup THEN
    NEW.shipping_centavos := 0;
  ELSIF subtotal_value >= 200000 THEN
    NEW.shipping_centavos := 0;
  ELSE
    NEW.shipping_centavos := 15000;
  END IF;

  NEW.tax_centavos := 0;
  NEW.total_centavos := NEW.subtotal_centavos + NEW.shipping_centavos;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.og_apply_live_retail_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.og_apply_live_retail_prices() TO postgres, service_role;

COMMENT ON FUNCTION public.og_apply_live_retail_prices IS
  'SECURITY DEFINER: replaces client retail prices with active catalog prices and recalculates totals before insert (waives shipping for pickup and pre-orders).';

-- 2. og_validate_retail_order_insert (BEFORE INSERT)
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
  is_pickup boolean := false;
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

  -- Determine if order is in-person pickup or pre-order
  is_pickup := coalesce(NEW.shipping_info->>'fulfillmentType', '') = 'pickup'
               OR NEW.shipping_info->>'pickupVenue' IS NOT NULL
               OR NEW.id LIKE 'PRE-%'
               OR coalesce(NEW.shipping_centavos, -1) = 0;

  IF is_pickup THEN
    expected_shipping_centavos := 0;
  ELSIF subtotal_centavos >= 200000 THEN
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

  IF NEW.total_centavos IS DISTINCT FROM expected_total_centavos THEN
    RAISE EXCEPTION 'Total mismatch';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.og_validate_retail_order_insert() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.og_validate_retail_order_insert() TO postgres, service_role;

COMMENT ON FUNCTION public.og_validate_retail_order_insert IS
  'SECURITY DEFINER: locks and decrements stock, verifies variant/product price and order totals (waives shipping for pickup and pre-orders).';
