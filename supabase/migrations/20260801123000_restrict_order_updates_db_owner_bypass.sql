-- Sibling: og_restrict_customer_order_column_updates blocked postgres/SQL-editor
-- updates when auth.jwt() is empty (treated as customer). Staff JWT and
-- service_role were fine; dashboard/ops SQL was not — same class of
-- invoker/context mismatch as the retail validate FOR UPDATE bug.
-- Also keep stock-restore path workable for privileged DB roles.

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
  bypass_rls boolean := false;
BEGIN
  SELECT coalesce(r.rolbypassrls, false) INTO bypass_rls
  FROM pg_roles r
  WHERE r.rolname = current_user;

  IF jwt_role = 'service_role'
     OR portal_role IN ('admin', 'staff')
     OR current_user IN ('postgres', 'supabase_admin')
     OR bypass_rls THEN
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

COMMENT ON FUNCTION public.og_restrict_customer_order_column_updates IS
  'Blocks customer/anon money/status edits; allows admin/staff/service_role and DB owner/bypassrls roles.';
