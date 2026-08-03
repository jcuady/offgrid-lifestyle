-- Revision note integrity + ops queue locality for revision_requested.
-- security-: trust-boundary validation on SECURITY DEFINER RPC
-- query-: partial index for the revision queue (status already indexed; narrow this for ops list)

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

  IF char_length(note) < 3 THEN
    RAISE EXCEPTION 'Revision note must be at least 3 characters';
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

-- Ops queue: custom orders waiting on revision resolution
CREATE INDEX IF NOT EXISTS og_orders_custom_revision_queue_idx
  ON public.og_orders (updated_at DESC)
  WHERE order_type = 'custom' AND status = 'revision_requested';
