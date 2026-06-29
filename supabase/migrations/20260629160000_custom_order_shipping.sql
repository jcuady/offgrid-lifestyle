-- Require valid Philippines shipping_info on new custom orders (legacy rows exempt via NOT VALID).
ALTER TABLE public.og_orders
  DROP CONSTRAINT IF EXISTS og_orders_custom_shipping_valid_chk;

ALTER TABLE public.og_orders
  ADD CONSTRAINT og_orders_custom_shipping_valid_chk
  CHECK (
    order_type <> 'custom'
    OR shipping_info IS NULL
    OR public.og_retail_shipping_valid(shipping_info)
  )
  NOT VALID;
