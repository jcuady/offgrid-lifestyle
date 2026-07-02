-- Transactional hardening: retail order validation, status transitions, spotlight trigger fix.

-- ---------------------------------------------------------------------------
-- Retail order server-side validation (prices, products, totals)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_validate_retail_order_insert()
RETURNS trigger
LANGUAGE plpgsql
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

    SELECT id, price, status, variants INTO prod
    FROM public.og_products
    WHERE id = line->>'productId';

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

DROP TRIGGER IF EXISTS og_orders_validate_retail_insert ON public.og_orders;
CREATE TRIGGER og_orders_validate_retail_insert
  BEFORE INSERT ON public.og_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.og_validate_retail_order_insert();

-- ---------------------------------------------------------------------------
-- Enforce fulfillment status transitions (mirrors client STATUS_FLOW)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_validate_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft' AND NEW.status IN ('pending_deposit', 'cancelled'))
    OR (OLD.status = 'pending_deposit' AND NEW.status IN ('confirmed', 'cancelled'))
    OR (OLD.status = 'confirmed' AND NEW.status IN ('in_production', 'cancelled'))
    OR (OLD.status = 'in_production' AND NEW.status IN ('shipped', 'cancelled'))
    OR (OLD.status = 'shipped' AND NEW.status IN ('delivered', 'cancelled'))
    OR (OLD.status = 'delivered' AND NEW.status = 'delivered')
    OR (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
  ) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS og_orders_validate_status_transition ON public.og_orders;
CREATE TRIGGER og_orders_validate_status_transition
  BEFORE UPDATE OF status ON public.og_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.og_validate_order_status_transition();

-- ---------------------------------------------------------------------------
-- Featured spotlight updated_at trigger (was broken set_updated_at reference)
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS og_site_featured_spotlight_updated_at ON public.og_site_featured_spotlight;
CREATE TRIGGER og_site_featured_spotlight_updated_at
  BEFORE UPDATE ON public.og_site_featured_spotlight
  FOR EACH ROW
  EXECUTE FUNCTION public.og_set_updated_at();
