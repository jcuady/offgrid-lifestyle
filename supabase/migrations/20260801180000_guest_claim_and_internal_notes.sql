-- Guest claim RPC + staff-only quote internal notes (SELECT locality).
-- Apply via: npx supabase db query --linked -f <this file>
-- then: npx supabase migration repair --status applied 20260801180000

-- ---------------------------------------------------------------------------
-- Staff-only internal notes (never in customer-readable custom_payload)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.og_order_quote_internal_notes (
  order_id text PRIMARY KEY REFERENCES public.og_orders (id) ON DELETE CASCADE,
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.og_portal_users (id) ON DELETE SET NULL
);

COMMENT ON TABLE public.og_order_quote_internal_notes IS
  'Staff/admin-only quote internal notes — not exposed via og_orders.custom_payload SELECT.';

ALTER TABLE public.og_order_quote_internal_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS og_order_quote_internal_notes_staff_all ON public.og_order_quote_internal_notes;
CREATE POLICY og_order_quote_internal_notes_staff_all
  ON public.og_order_quote_internal_notes
  FOR ALL
  TO authenticated
  USING (public.og_portal_role() IN ('admin', 'staff'))
  WITH CHECK (public.og_portal_role() IN ('admin', 'staff'));

-- Migrate existing payload notes, then strip the key so customers cannot SELECT them.
INSERT INTO public.og_order_quote_internal_notes (order_id, notes, updated_at)
SELECT
  o.id,
  coalesce(o.custom_payload->>'quoteInternalNotes', ''),
  now()
FROM public.og_orders o
WHERE o.order_type = 'custom'
  AND nullif(btrim(coalesce(o.custom_payload->>'quoteInternalNotes', '')), '') IS NOT NULL
ON CONFLICT (order_id) DO UPDATE
  SET notes = EXCLUDED.notes,
      updated_at = now();

UPDATE public.og_orders
SET custom_payload = coalesce(custom_payload, '{}'::jsonb) - 'quoteInternalNotes'
WHERE custom_payload ? 'quoteInternalNotes';

-- Always strip quoteInternalNotes from payload on UPDATE (defense in depth).
CREATE OR REPLACE FUNCTION public.og_restrict_customer_order_column_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
  portal_role text := public.og_portal_role();
  old_payload jsonb := coalesce(OLD.custom_payload, '{}'::jsonb);
  bypass_rls boolean := false;
BEGIN
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

  -- quoteInternalNotes already stripped above for all roles.

  IF old_payload ? 'quoteCustomerNotes' THEN
    NEW.custom_payload := jsonb_set(NEW.custom_payload, '{quoteCustomerNotes}', old_payload->'quoteCustomerNotes', true);
  ELSE
    NEW.custom_payload := NEW.custom_payload - 'quoteCustomerNotes';
  END IF;

  IF old_payload ? 'quotedAt' THEN
    NEW.custom_payload := jsonb_set(NEW.custom_payload, '{quotedAt}', old_payload->'quotedAt', true);
  ELSE
    NEW.custom_payload := NEW.custom_payload - 'quotedAt';
  END IF;

  IF old_payload ? 'quotedBy' THEN
    NEW.custom_payload := jsonb_set(NEW.custom_payload, '{quotedBy}', old_payload->'quotedBy', true);
  ELSE
    NEW.custom_payload := NEW.custom_payload - 'quotedBy';
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.og_restrict_customer_order_column_updates IS
  'Blocks customer/anon money/status edits; locks official quote keys; strips quoteInternalNotes from payload.';

-- ---------------------------------------------------------------------------
-- Claim guest orders (email match) → set customer_id under money-lock bypass
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_claim_my_guest_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  portal_id uuid;
  portal_email text;
  jwt_email text := lower(nullif(btrim(coalesce(auth.jwt() ->> 'email', '')), ''));
  claimed integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT u.id, lower(u.email)
  INTO portal_id, portal_email
  FROM public.og_portal_users u
  WHERE u.auth_user_id = auth.uid()
    AND u.role = 'customer'
    AND u.status = 'active'
  LIMIT 1;

  IF portal_id IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.og_orders o
  SET
    customer_id = portal_id,
    updated_at = now()
  WHERE o.customer_id IS NULL
    AND o.customer_email IS NOT NULL
    AND (
      lower(o.customer_email) = portal_email
      OR (jwt_email IS NOT NULL AND lower(o.customer_email) = jwt_email)
    );

  GET DIAGNOSTICS claimed = ROW_COUNT;
  RETURN claimed;
END;
$function$;

COMMENT ON FUNCTION public.og_claim_my_guest_orders IS
  'Attaches null-customer_id orders to the signed-in customer when emails match.';

REVOKE ALL ON FUNCTION public.og_claim_my_guest_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.og_claim_my_guest_orders() TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Admin override: set order payment + append manual ledger row
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_admin_override_order_payment(
  p_order_id text,
  p_payment_status text,
  p_fulfillment_status text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ord record;
  tx_status text;
  amount bigint;
BEGIN
  IF public.og_portal_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  IF p_payment_status IS NULL OR p_payment_status NOT IN ('unpaid', 'deposit_paid', 'fully_paid', 'refunded') THEN
    RAISE EXCEPTION 'Invalid payment status';
  END IF;

  IF p_fulfillment_status IS NOT NULL
     AND p_fulfillment_status NOT IN (
       'draft', 'pending_deposit', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'
     ) THEN
    RAISE EXCEPTION 'Invalid fulfillment status';
  END IF;

  SELECT * INTO ord FROM public.og_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  UPDATE public.og_orders
  SET
    payment_status = p_payment_status,
    status = coalesce(p_fulfillment_status, status),
    updated_at = now()
  WHERE id = p_order_id;

  tx_status := CASE p_payment_status
    WHEN 'unpaid' THEN 'cancelled'
    WHEN 'deposit_paid' THEN 'succeeded'
    WHEN 'fully_paid' THEN 'succeeded'
    WHEN 'refunded' THEN 'refunded'
    ELSE 'cancelled'
  END;

  amount := CASE
    WHEN p_payment_status = 'deposit_paid' THEN greatest(coalesce(ord.total_centavos, 0) * 60 / 100, 0)
    WHEN p_payment_status IN ('fully_paid', 'refunded') THEN coalesce(ord.total_centavos, 0)
    ELSE 0
  END;

  INSERT INTO public.og_payment_transactions (
    order_id,
    order_type,
    provider,
    amount_centavos,
    currency,
    status,
    payment_method,
    metadata
  ) VALUES (
    p_order_id,
    ord.order_type,
    'manual',
    amount,
    coalesce(ord.currency, 'PHP'),
    tx_status,
    'admin_override',
    jsonb_build_object(
      'source', 'og_admin_override_order_payment',
      'payment_status', p_payment_status,
      'at', now()
    )
  );
END;
$function$;

COMMENT ON FUNCTION public.og_admin_override_order_payment IS
  'Admin-only: set order payment (optional fulfillment) and append a manual ledger row.';

REVOKE ALL ON FUNCTION public.og_admin_override_order_payment(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.og_admin_override_order_payment(text, text, text) TO authenticated, service_role;
