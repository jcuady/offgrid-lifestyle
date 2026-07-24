-- Restrict customer/anon og_orders UPDATEs to file metadata (+ payment proof).
-- Staff/admin/service_role keep full update rights (status transition trigger still applies).
-- Tighten custom-order-files storage insert to owner / guest-null customer_id.

CREATE OR REPLACE FUNCTION public.og_restrict_customer_order_column_updates()
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

  -- Customers / anon / unknown: only custom_payload, payment_proof_url, updated_at.
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS og_orders_restrict_customer_column_updates ON public.og_orders;
CREATE TRIGGER og_orders_restrict_customer_column_updates
  BEFORE UPDATE ON public.og_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.og_restrict_customer_order_column_updates();

COMMENT ON FUNCTION public.og_restrict_customer_order_column_updates IS
  'Blocks customer/anon from self-marking payment_status/status; allows custom_payload + payment_proof_url.';

-- Storage: authenticated owners or guest (customer_id null) within 24h.
DROP POLICY IF EXISTS custom_order_files_insert ON storage.objects;
CREATE POLICY custom_order_files_insert ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'custom-order-files'
    AND EXISTS (
      SELECT 1
      FROM public.og_orders o
      WHERE o.id = (storage.foldername(name))[1]
        AND o.order_type = 'custom'
        AND o.created_at > (now() - interval '24 hours')
        AND (
          (
            coalesce(auth.jwt() ->> 'role', '') = 'anon'
            AND o.customer_id IS NULL
          )
          OR (
            coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
            AND (
              o.customer_id IS NULL
              OR o.customer_id = (
                SELECT id FROM public.og_portal_users
                WHERE auth_user_id = (SELECT auth.uid())
                LIMIT 1
              )
              OR lower(o.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
            )
          )
        )
    )
  );
