-- Saved customer shipping address for checkout autofill.
-- NULL = not set yet; when present must pass the same PH shipping validator as orders.

ALTER TABLE public.og_portal_users
  ADD COLUMN IF NOT EXISTS shipping_info jsonb;

COMMENT ON COLUMN public.og_portal_users.shipping_info IS
  'Customer default Philippines shipping address (ShippingInfo JSON). Autofills checkout.';

ALTER TABLE public.og_portal_users
  DROP CONSTRAINT IF EXISTS og_portal_users_shipping_info_valid_chk;

ALTER TABLE public.og_portal_users
  ADD CONSTRAINT og_portal_users_shipping_info_valid_chk
  CHECK (
    shipping_info IS NULL
    OR public.og_retail_shipping_valid(shipping_info)
  );
