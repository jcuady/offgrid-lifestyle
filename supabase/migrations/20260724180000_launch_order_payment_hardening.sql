-- Launch hardening: force safe order inserts, lock staff quote fields, decrement retail stock.

-- ---------------------------------------------------------------------------
-- Non-staff INSERT cannot invent paid / advanced fulfillment state
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_force_safe_order_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
  portal_role text := public.og_portal_role();
BEGIN
  IF jwt_role = 'service_role' OR portal_role IN ('admin', 'staff') THEN
    RETURN NEW;
  END IF;

  NEW.payment_status := 'unpaid';

  IF NEW.order_type = 'retail' THEN
    -- Retail starts awaiting payment confirmation; never confirmed/paid on insert.
    IF NEW.status IS NULL OR NEW.status IN ('confirmed', 'in_production', 'quality_check', 'ready', 'shipped', 'delivered') THEN
      NEW.status := 'pending_deposit';
    END IF;
  ELSIF NEW.order_type = 'custom' THEN
    IF NEW.status IS NULL OR NEW.status NOT IN ('draft', 'pending_deposit', 'cancelled') THEN
      NEW.status := 'draft';
    END IF;
  END IF;

  NEW.payment_provider_ref := NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS og_orders_force_safe_insert_defaults ON public.og_orders;
CREATE TRIGGER og_orders_force_safe_insert_defaults
  BEFORE INSERT ON public.og_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.og_force_safe_order_insert_defaults();

COMMENT ON FUNCTION public.og_force_safe_order_insert_defaults IS
  'Non-staff inserts are forced unpaid with a safe initial status (blocks fake paid orders).';

-- ---------------------------------------------------------------------------
-- Customers may update custom_payload files, but not staff quote money fields
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_restrict_customer_order_column_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
  portal_role text := public.og_portal_role();
  old_payload jsonb := coalesce(OLD.custom_payload, '{}'::jsonb);
BEGIN
  IF jwt_role = 'service_role' OR portal_role IN ('admin', 'staff') THEN
    RETURN NEW;
  END IF;

  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.total_centavos IS DISTINCT FROM OLD.total_centavos
     OR NEW.subtotal_centavos IS DISTINCT FROM OLD.subtotal_centavos
     OR NEW.shipping_centavos IS DISTINCT FROM OLD.shipping_centavos
     OR NEW.tax_centavos IS DISTINCT FROM OLD.tax_centavos
     OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
     OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
     OR NEW.customer_name IS DISTINCT FROM OLD.customer_name
     OR NEW.customer_phone IS DISTINCT FROM OLD.customer_phone
     OR NEW.payment_method IS DISTINCT FROM OLD.payment_method
     OR NEW.payment_provider IS DISTINCT FROM OLD.payment_provider
     OR NEW.payment_provider_ref IS DISTINCT FROM OLD.payment_provider_ref
     OR NEW.shipping_info IS DISTINCT FROM OLD.shipping_info
     OR NEW.line_items IS DISTINCT FROM OLD.line_items
     OR NEW.order_type IS DISTINCT FROM OLD.order_type
     OR NEW.id IS DISTINCT FROM OLD.id
     OR NEW.currency IS DISTINCT FROM OLD.currency
  THEN
    RAISE EXCEPTION 'Customers may only update custom order file metadata or payment proof';
  END IF;

  -- Preserve staff-owned quote money keys; customers cannot invent or lower them.
  NEW.custom_payload := coalesce(NEW.custom_payload, '{}'::jsonb);
  IF old_payload ? 'officialTotal' THEN
    NEW.custom_payload := jsonb_set(NEW.custom_payload, '{officialTotal}', old_payload->'officialTotal', true);
  ELSE
    NEW.custom_payload := NEW.custom_payload - 'officialTotal';
  END IF;
  IF old_payload ? 'officialDeposit' THEN
    NEW.custom_payload := jsonb_set(NEW.custom_payload, '{officialDeposit}', old_payload->'officialDeposit', true);
  ELSE
    NEW.custom_payload := NEW.custom_payload - 'officialDeposit';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS og_orders_restrict_customer_column_updates ON public.og_orders;
CREATE TRIGGER og_orders_restrict_customer_column_updates
  BEFORE UPDATE ON public.og_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.og_restrict_customer_order_column_updates();

COMMENT ON FUNCTION public.og_restrict_customer_order_column_updates IS
  'Blocks customer/anon money/status edits; locks officialTotal/officialDeposit inside custom_payload.';

-- ---------------------------------------------------------------------------
-- Retail stock: null = unlimited; otherwise decrement atomically on insert
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

COMMENT ON FUNCTION public.og_validate_retail_order_insert IS
  'Validates retail prices/totals and decrements stock when stock is tracked (null = unlimited).';

-- Hygiene: trigger helpers should not be executable as RPCs
REVOKE ALL ON FUNCTION public.og_restrict_customer_order_column_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.og_force_safe_order_insert_defaults() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.og_restrict_customer_order_column_updates() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.og_force_safe_order_insert_defaults() TO postgres, service_role;
