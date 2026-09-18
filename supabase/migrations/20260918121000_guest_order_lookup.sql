-- Guest order lookup: email + order id, returns safe public fields only.
CREATE OR REPLACE FUNCTION public.og_guest_lookup_order(p_order_id text, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row public.og_orders%ROWTYPE;
  v_payload jsonb;
  v_email text := lower(trim(coalesce(p_email, '')));
BEGIN
  IF nullif(btrim(coalesce(p_order_id, '')), '') IS NULL OR v_email = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_row
  FROM public.og_orders
  WHERE id = btrim(p_order_id)
    AND lower(trim(coalesce(customer_email, ''))) = v_email;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_payload := coalesce(v_row.custom_payload, '{}'::jsonb) - 'quoteInternalNotes';

  RETURN jsonb_build_object(
    'id', v_row.id,
    'order_type', v_row.order_type,
    'status', v_row.status,
    'payment_status', v_row.payment_status,
    'customer_name', v_row.customer_name,
    'customer_email', v_row.customer_email,
    'custom_payload', CASE WHEN v_row.order_type = 'custom' THEN v_payload ELSE NULL END,
    'line_items', CASE WHEN v_row.order_type = 'retail' THEN v_row.line_items ELSE NULL END,
    'subtotal_centavos', v_row.subtotal_centavos,
    'shipping_centavos', v_row.shipping_centavos,
    'tax_centavos', v_row.tax_centavos,
    'total_centavos', v_row.total_centavos,
    'shipping_info', v_row.shipping_info,
    'payment_method', v_row.payment_method,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
END;
$function$;

COMMENT ON FUNCTION public.og_guest_lookup_order(text, text) IS
  'Guest-safe order snapshot when order id and customer email match (case-insensitive).';

REVOKE ALL ON FUNCTION public.og_guest_lookup_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.og_guest_lookup_order(text, text) TO anon, authenticated;
