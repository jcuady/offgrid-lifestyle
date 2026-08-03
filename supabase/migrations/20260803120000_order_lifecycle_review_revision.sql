-- Order lifecycle: under_review + revision_requested, admin DB bypass,
-- customer cancel / revision RPCs, invoice advances under_review → pending_deposit.
-- Apply: npx supabase db query --linked -f <this> then migration repair --status applied 20260803120000

-- ---------------------------------------------------------------------------
-- Status transition: staff flow + admin / service_role unrestricted
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_validate_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
  portal_role text := public.og_portal_role();
  bypass_rls boolean := false;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(r.rolbypassrls, false) INTO bypass_rls
  FROM pg_roles r
  WHERE r.rolname = current_user;

  IF jwt_role = 'service_role'
     OR portal_role = 'admin'
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
    OR (OLD.status = 'pending_deposit' AND NEW.status IN ('confirmed', 'under_review', 'revision_requested', 'cancelled'))
    OR (OLD.status = 'revision_requested' AND NEW.status IN ('under_review', 'pending_deposit', 'confirmed', 'in_production', 'cancelled'))
    OR (OLD.status = 'confirmed' AND NEW.status IN ('in_production', 'revision_requested', 'cancelled'))
    OR (OLD.status = 'in_production' AND NEW.status IN ('shipped', 'revision_requested', 'cancelled'))
    OR (OLD.status = 'shipped' AND NEW.status IN ('delivered', 'cancelled'))
    OR (OLD.status = 'delivered' AND NEW.status = 'delivered')
    OR (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
  ) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.og_validate_order_status_transition IS
  'Staff follow STATUS_FLOW; admin/service_role may set any durable fulfillment status.';

-- Payment settle also advances under_review → confirmed
CREATE OR REPLACE FUNCTION public.og_orders_advance_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     AND NEW.payment_status IN ('deposit_paid', 'fully_paid')
     AND NEW.status IN ('draft', 'under_review', 'pending_deposit')
  THEN
    NEW.status := 'confirmed';
  END IF;
  RETURN NEW;
END;
$function$;

-- Custom inserts start under review (not inventing confirmed)
CREATE OR REPLACE FUNCTION public.og_force_safe_order_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
  portal_role text := public.og_portal_role();
BEGIN
  IF jwt_role = 'service_role' OR portal_role IN ('admin', 'staff') THEN
    RETURN NEW;
  END IF;

  NEW.payment_status := 'unpaid';

  IF NEW.order_type = 'retail' THEN
    IF NEW.status IS NULL OR NEW.status IN (
      'confirmed', 'in_production', 'quality_check', 'ready', 'shipped', 'delivered',
      'under_review', 'revision_requested'
    ) THEN
      NEW.status := 'pending_deposit';
    END IF;
  ELSIF NEW.order_type = 'custom' THEN
    IF NEW.status IS NULL OR NEW.status NOT IN ('draft', 'under_review', 'pending_deposit', 'cancelled') THEN
      NEW.status := 'under_review';
    END IF;
    IF NEW.status IN ('draft', 'pending_deposit') THEN
      NEW.status := 'under_review';
    END IF;
  END IF;

  NEW.payment_provider_ref := NULL;
  RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------------
-- Customer cancel (unpaid + pre-production)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_customer_cancel_order(p_order_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  portal_id uuid;
  portal_email text;
  jwt_email text := lower(nullif(btrim(coalesce(auth.jwt() ->> 'email', '')), ''));
  ord record;
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
    RAISE EXCEPTION 'Customer profile required';
  END IF;

  SELECT * INTO ord FROM public.og_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF NOT (
    ord.customer_id = portal_id
    OR (ord.customer_email IS NOT NULL AND lower(ord.customer_email) IN (portal_email, jwt_email))
  ) THEN
    RAISE EXCEPTION 'Not your order';
  END IF;

  IF ord.payment_status IS DISTINCT FROM 'unpaid' THEN
    RAISE EXCEPTION 'Paid orders cannot be cancelled by the customer — contact OFFGRID';
  END IF;

  IF ord.status NOT IN ('draft', 'under_review', 'pending_deposit', 'revision_requested') THEN
    RAISE EXCEPTION 'This order can no longer be cancelled online';
  END IF;

  UPDATE public.og_orders
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_order_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.og_customer_cancel_order(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.og_customer_cancel_order(text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Customer request revision
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_customer_request_revision(
  p_order_id text,
  p_note text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  portal_id uuid;
  portal_email text;
  jwt_email text := lower(nullif(btrim(coalesce(auth.jwt() ->> 'email', '')), ''));
  ord record;
  note text := left(btrim(coalesce(p_note, '')), 2000);
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
    RAISE EXCEPTION 'Customer profile required';
  END IF;

  SELECT * INTO ord FROM public.og_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF ord.order_type IS DISTINCT FROM 'custom' THEN
    RAISE EXCEPTION 'Revisions apply to custom orders only';
  END IF;

  IF NOT (
    ord.customer_id = portal_id
    OR (ord.customer_email IS NOT NULL AND lower(ord.customer_email) IN (portal_email, jwt_email))
  ) THEN
    RAISE EXCEPTION 'Not your order';
  END IF;

  IF ord.status NOT IN (
    'under_review', 'pending_deposit', 'confirmed', 'in_production', 'revision_requested'
  ) THEN
    RAISE EXCEPTION 'Revisions are not available after shipping';
  END IF;

  UPDATE public.og_orders
  SET
    status = 'revision_requested',
    custom_payload = jsonb_set(
      coalesce(custom_payload, '{}'::jsonb) - 'quoteInternalNotes',
      '{customerRevisionNote}',
      to_jsonb(note),
      true
    ),
    updated_at = now()
  WHERE id = p_order_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.og_customer_request_revision(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.og_customer_request_revision(text, text) TO authenticated, service_role;

-- Admin override RPC: allow new statuses
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
       'draft', 'under_review', 'pending_deposit', 'revision_requested',
       'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'
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
    order_id, order_type, provider, amount_centavos, currency, status, payment_method, metadata
  ) VALUES (
    p_order_id,
    ord.order_type,
    'manual',
    amount,
    coalesce(ord.currency, 'PHP'),
    tx_status,
    'admin_override',
    jsonb_build_object('source', 'og_admin_override_order_payment', 'payment_status', p_payment_status, 'at', now())
  );
END;
$function$;
