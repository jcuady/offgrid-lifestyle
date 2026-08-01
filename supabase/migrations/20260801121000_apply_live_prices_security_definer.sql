-- Sibling hardening: og_apply_live_retail_prices is trigger-only (EXECUTE revoked from
-- clients) but was SECURITY INVOKER. Mark DEFINER + locked search_path so catalog
-- reads during checkout never depend on the inserting role's RLS.

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
  NEW.shipping_centavos := CASE WHEN subtotal_value >= 200000 THEN 0 ELSE 15000 END;
  NEW.tax_centavos := 0;
  NEW.total_centavos := NEW.subtotal_centavos + NEW.shipping_centavos;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.og_apply_live_retail_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.og_apply_live_retail_prices() TO postgres, service_role;

COMMENT ON FUNCTION public.og_apply_live_retail_prices IS
  'SECURITY DEFINER: replaces client retail prices with active catalog prices and recalculates totals before insert.';
