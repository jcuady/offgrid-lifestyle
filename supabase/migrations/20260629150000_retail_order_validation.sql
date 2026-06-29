-- Enforce retail order payload at the database trust boundary (new rows only).
CREATE OR REPLACE FUNCTION public.og_retail_shipping_valid(info jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    info IS NOT NULL
    AND length(trim(coalesce(info->>'fullName', ''))) > 0
    AND length(trim(coalesce(info->>'email', ''))) > 0
    AND length(trim(coalesce(info->>'phone', ''))) > 0
    AND length(trim(coalesce(info->>'address', ''))) > 0
    AND length(trim(coalesce(info->>'barangay', ''))) > 0
    AND length(trim(coalesce(info->>'city', ''))) > 0
    AND length(trim(coalesce(info->>'province', ''))) > 0
    AND length(trim(coalesce(info->>'region', ''))) > 0
    AND coalesce(info->>'zip', '') ~ '^\d{4}$';
$$;

ALTER TABLE public.og_orders
  DROP CONSTRAINT IF EXISTS og_orders_retail_shipping_valid_chk;

ALTER TABLE public.og_orders
  ADD CONSTRAINT og_orders_retail_shipping_valid_chk
  CHECK (
    order_type <> 'retail'
    OR public.og_retail_shipping_valid(shipping_info)
  )
  NOT VALID;

ALTER TABLE public.og_orders
  DROP CONSTRAINT IF EXISTS og_orders_retail_line_items_chk;

ALTER TABLE public.og_orders
  ADD CONSTRAINT og_orders_retail_line_items_chk
  CHECK (
    order_type <> 'retail'
    OR (
      line_items IS NOT NULL
      AND jsonb_typeof(line_items) = 'array'
      AND jsonb_array_length(line_items) > 0
    )
  )
  NOT VALID;

COMMENT ON FUNCTION public.og_retail_shipping_valid IS
  'Validates Philippines retail shipping_info JSON (PSGC fields + 4-digit ZIP).';
