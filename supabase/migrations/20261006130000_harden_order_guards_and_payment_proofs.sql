-- Harden order guards + make payment-proof upload work for guests and customers.
-- Verified by supabase/tests/order_security.sql (run it after applying; it must report ALL_PASS).
--
-- 1. Customer/anon column guard and status guard never fired: both were SECURITY DEFINER and tested
--    current_user IN ('postgres', ...), which is always true inside a definer function. They now run as
--    the caller (SECURITY INVOKER) so current_user is the real role; definer RPCs (run as postgres)
--    and service_role/staff/admin still bypass as intended.
-- 2. Shipping can no longer be waived by sending shipping_centavos = 0 or a client-chosen "PRE-" id.
-- 3. Storage RLS: policies compared storage.foldername(u.name) with the portal user's display name
--    (alias shadowing) instead of the object path, so customers could not upload/read their own proof.
--    Guests (anon) can now attach a proof to their own fresh guest order. Open UPDATE/INSERT policies
--    on payment-proofs / payment-assets are removed. payment-proofs gets a size + MIME limit.
-- 4. og_submit_order_payment: one guest- and customer-safe RPC for proof, reference and manual method.

-- 1a. Column guard (customers / anon) ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_restrict_customer_order_column_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
  portal_role text := NULL;
  old_payload jsonb := coalesce(OLD.custom_payload, '{}'::jsonb);
  bypass_rls boolean := false;
  k text;
BEGIN
  -- og_portal_role() is not executable by anon, so only ask for signed-in callers.
  IF jwt_role = 'authenticated' THEN
    portal_role := public.og_portal_role();
  END IF;

  SELECT coalesce(r.rolbypassrls, false) INTO bypass_rls
  FROM pg_roles r
  WHERE r.rolname = current_user;

  NEW.custom_payload := coalesce(NEW.custom_payload, '{}'::jsonb) - 'quoteInternalNotes';

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

  -- Quote fields are staff-owned: keep the stored value (or absence) whatever the client sent.
  FOREACH k IN ARRAY ARRAY['officialTotal', 'officialDeposit', 'quoteCustomerNotes', 'quotedAt', 'quotedBy'] LOOP
    IF old_payload ? k THEN
      NEW.custom_payload := jsonb_set(NEW.custom_payload, ARRAY[k], old_payload -> k, true);
    ELSE
      NEW.custom_payload := NEW.custom_payload - k;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 1b. Status guard -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_validate_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
  portal_role text := NULL;
  bypass_rls boolean := false;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF jwt_role = 'authenticated' THEN
    portal_role := public.og_portal_role();
  END IF;

  SELECT coalesce(r.rolbypassrls, false) INTO bypass_rls
  FROM pg_roles r
  WHERE r.rolname = current_user;

  -- Staff/admin/service/definer RPCs may jump statuses (e.g. venue handover); the status must still be valid.
  IF jwt_role = 'service_role'
     OR portal_role IN ('admin', 'staff')
     OR current_user IN ('postgres', 'supabase_admin')
     OR bypass_rls THEN
    IF NEW.status NOT IN (
      'draft', 'under_review', 'pending_deposit', 'revision_requested',
      'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'
    ) THEN
      RAISE EXCEPTION 'Invalid status %', NEW.status;
    END IF;
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft' AND NEW.status IN ('under_review', 'pending_deposit', 'cancelled'))
    OR (OLD.status = 'under_review' AND NEW.status IN ('pending_deposit', 'revision_requested', 'cancelled'))
    OR (OLD.status = 'pending_deposit' AND NEW.status IN ('under_review', 'revision_requested', 'cancelled'))
    OR (OLD.status = 'revision_requested' AND NEW.status IN ('under_review', 'pending_deposit', 'cancelled'))
    OR (OLD.status = 'confirmed' AND NEW.status IN ('revision_requested', 'cancelled'))
    OR (OLD.status = 'in_production' AND NEW.status IN ('revision_requested', 'cancelled'))
    OR (OLD.status = 'shipped' AND NEW.status IN ('cancelled'))
    OR (OLD.status = 'delivered' AND NEW.status = 'delivered')
    OR (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
  ) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2. Shipping can only be waived for real pickup orders -----------------------------------------
DO $$
DECLARE
  fn text;
  def text;
  newdef text;
BEGIN
  FOREACH fn IN ARRAY ARRAY['public.og_apply_live_retail_prices()', 'public.og_validate_retail_order_insert()'] LOOP
    def := pg_get_functiondef(fn::regprocedure);
    newdef := regexp_replace(def, '\s*OR NEW\.id LIKE ''PRE-%''', '', 'g');
    newdef := regexp_replace(newdef, '\s*OR coalesce\(NEW\.shipping_centavos, -1\) = 0', '', 'g');
    IF newdef <> def THEN
      EXECUTE newdef;
    END IF;
    IF pg_get_functiondef(fn::regprocedure) ~ 'shipping_centavos, -1\) = 0|LIKE ''PRE-%''' THEN
      RAISE EXCEPTION 'shipping waiver clause still present in %', fn;
    END IF;
  END LOOP;
END $$;

-- 3. Storage ---------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS og_private;
GRANT USAGE ON SCHEMA og_private TO anon, authenticated;

-- RLS on og_orders hides orders from anon, so the guest upload policies ask this definer helper
-- (not exposed through PostgREST: schema og_private is not in the API schema list).
CREATE OR REPLACE FUNCTION og_private.order_open_for_guest_upload(p_order_id text, p_order_type text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.og_orders o
    WHERE o.id = p_order_id
      AND o.order_type = p_order_type
      AND o.customer_id IS NULL
      AND o.created_at > now() - interval '24 hours'
      AND o.status NOT IN ('cancelled', 'delivered')
      AND o.payment_status <> 'fully_paid'
  );
$$;
REVOKE ALL ON FUNCTION og_private.order_open_for_guest_upload(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION og_private.order_open_for_guest_upload(text, text) TO anon, authenticated;

DROP POLICY IF EXISTS payment_proofs_insert ON storage.objects;
DROP POLICY IF EXISTS payment_proofs_guest_insert ON storage.objects;
DROP POLICY IF EXISTS payment_proofs_select ON storage.objects;
DROP POLICY IF EXISTS payment_proofs_update ON storage.objects;

CREATE POLICY payment_proofs_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (
      public.og_portal_role() = ANY (ARRAY['admin', 'staff'])
      OR EXISTS (
        SELECT 1
        FROM public.og_orders o
        JOIN public.og_portal_users u ON u.auth_user_id = (SELECT auth.uid())
        WHERE o.id = (storage.foldername(objects.name))[1]
          AND (o.customer_id = u.id OR lower(o.customer_email) = lower(u.email))
      )
    )
  );

CREATE POLICY payment_proofs_guest_insert ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND og_private.order_open_for_guest_upload((storage.foldername(objects.name))[1], 'retail')
  );

CREATE POLICY payment_proofs_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (
      public.og_portal_role() = ANY (ARRAY['admin', 'staff'])
      OR EXISTS (
        SELECT 1
        FROM public.og_orders o
        JOIN public.og_portal_users u ON u.auth_user_id = (SELECT auth.uid())
        WHERE o.id = (storage.foldername(objects.name))[1]
          AND (o.customer_id = u.id OR lower(o.customer_email) = lower(u.email))
      )
    )
  );

-- custom-order-files: same alias bug on SELECT; INSERT never worked for anon (no RLS visibility on og_orders).
DROP POLICY IF EXISTS custom_order_files_select ON storage.objects;
CREATE POLICY custom_order_files_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'custom-order-files'
    AND (
      public.og_portal_role() = ANY (ARRAY['admin', 'staff'])
      OR EXISTS (
        SELECT 1
        FROM public.og_orders o
        JOIN public.og_portal_users u ON u.auth_user_id = (SELECT auth.uid())
        WHERE o.id = (storage.foldername(objects.name))[1]
          AND (o.customer_id = u.id OR lower(o.customer_email) = lower(u.email))
      )
    )
  );

DROP POLICY IF EXISTS custom_order_files_insert ON storage.objects;
CREATE POLICY custom_order_files_insert ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'custom-order-files'
    AND (
      og_private.order_open_for_guest_upload((storage.foldername(objects.name))[1], 'custom')
      OR EXISTS (
        SELECT 1
        FROM public.og_orders o
        WHERE o.id = (storage.foldername(objects.name))[1]
          AND o.order_type = 'custom'
          AND o.created_at > now() - interval '24 hours'
          AND coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
          AND (
            o.customer_id = (SELECT p.id FROM public.og_portal_users p WHERE p.auth_user_id = (SELECT auth.uid()) LIMIT 1)
            OR lower(o.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          )
      )
    )
  );

-- payment-assets (admin-managed QR images): any signed-in user could write. Admin-only policies already exist.
DROP POLICY IF EXISTS payment_assets_insert ON storage.objects;
DROP POLICY IF EXISTS payment_assets_update ON storage.objects;

UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'application/pdf']
WHERE id = 'payment-proofs';

-- 4. Guest- and customer-safe payment step ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_submit_order_payment(
  p_order_id text,
  p_email text,
  p_payment_method text DEFAULT NULL,
  p_proof_ref text DEFAULT NULL,
  p_reference text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  o public.og_orders%ROWTYPE;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_ref text := nullif(btrim(coalesce(p_reference, '')), '');
  v_prefix text := 'payment-proofs:' || p_order_id || '/';
BEGIN
  IF p_payment_method IS NOT NULL AND p_payment_method NOT IN ('gcash', 'bdo') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;
  IF p_proof_ref IS NOT NULL
     AND (left(p_proof_ref, length(v_prefix)) <> v_prefix
          OR length(p_proof_ref) > 300
          OR position('..' IN p_proof_ref) > 0) THEN
    RAISE EXCEPTION 'Invalid proof reference';
  END IF;
  IF v_ref IS NOT NULL AND length(v_ref) > 100 THEN
    RAISE EXCEPTION 'Reference number is too long';
  END IF;

  SELECT * INTO o FROM public.og_orders WHERE id = p_order_id AND order_type = 'retail' FOR UPDATE;
  IF NOT FOUND OR NOT (
    (v_email <> '' AND lower(o.customer_email) = v_email)
    OR (
      auth.uid() IS NOT NULL
      AND o.customer_id IS NOT NULL
      AND o.customer_id = (SELECT p.id FROM public.og_portal_users p WHERE p.auth_user_id = auth.uid() LIMIT 1)
    )
  ) THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;

  IF o.status IN ('cancelled', 'delivered') OR o.payment_status = 'fully_paid' THEN
    RAISE EXCEPTION 'Order is closed';
  END IF;
  IF p_payment_method IS NOT NULL AND o.payment_provider <> 'manual' THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  UPDATE public.og_orders
  SET payment_method = coalesce(p_payment_method, payment_method),
      payment_proof_url = coalesce(p_proof_ref, payment_proof_url),
      payment_provider_ref = coalesce(v_ref, payment_provider_ref),
      updated_at = now()
  WHERE id = o.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.og_submit_order_payment(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.og_submit_order_payment(text, text, text, text, text) TO anon, authenticated, service_role;
