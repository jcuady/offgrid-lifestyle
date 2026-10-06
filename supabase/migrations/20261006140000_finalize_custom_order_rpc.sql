-- Guests (anon) cannot SELECT og_orders, so the post-insert UPDATE that links uploaded design files
-- (custom_payload) silently touched 0 rows and staff saw orders without artwork.
-- This RPC lets the order's owner (guest by checkout email, or the signed-in owner) write custom_payload
-- for a fresh order. Staff-owned quote fields are re-applied from the stored payload because a definer
-- function bypasses the column guard trigger.
CREATE OR REPLACE FUNCTION public.og_finalize_custom_order(
  p_order_id text,
  p_email text,
  p_payload jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  o public.og_orders%ROWTYPE;
  v_email text := lower(btrim(coalesce(p_email, '')));
  new_payload jsonb;
  old_payload jsonb;
  k text;
BEGIN
  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'Invalid payload';
  END IF;
  IF octet_length(p_payload::text) > 200000 THEN
    RAISE EXCEPTION 'Payload too large';
  END IF;

  SELECT * INTO o FROM public.og_orders WHERE id = p_order_id AND order_type = 'custom' FOR UPDATE;
  IF NOT FOUND
     OR o.created_at < now() - interval '24 hours'
     OR o.status IN ('cancelled', 'delivered')
     OR NOT (
       (o.customer_id IS NULL AND v_email <> '' AND lower(o.customer_email) = v_email)
       OR (
         auth.uid() IS NOT NULL
         AND o.customer_id IS NOT NULL
         AND o.customer_id = (SELECT p.id FROM public.og_portal_users p WHERE p.auth_user_id = auth.uid() LIMIT 1)
       )
     )
  THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;

  new_payload := p_payload - 'quoteInternalNotes';
  old_payload := coalesce(o.custom_payload, '{}'::jsonb);
  FOREACH k IN ARRAY ARRAY['officialTotal', 'officialDeposit', 'quoteCustomerNotes', 'quotedAt', 'quotedBy'] LOOP
    IF old_payload ? k THEN
      new_payload := jsonb_set(new_payload, ARRAY[k], old_payload -> k, true);
    ELSE
      new_payload := new_payload - k;
    END IF;
  END LOOP;

  UPDATE public.og_orders SET custom_payload = new_payload, updated_at = now() WHERE id = o.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.og_finalize_custom_order(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.og_finalize_custom_order(text, text, jsonb) TO anon, authenticated, service_role;
