-- Internal notification trigger helpers should not be callable through PostgREST.
-- The order triggers can still execute these functions as their owner.

REVOKE EXECUTE ON FUNCTION public.og_notify_staff_for_order(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.og_orders_staff_notify_on_insert() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.og_orders_staff_notify_on_proof() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.og_notify_staff_for_order(text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.og_orders_staff_notify_on_insert() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.og_orders_staff_notify_on_proof() FROM anon, authenticated;

-- These RPCs should not be available to anonymous callers. The app no longer
-- needs direct client access to staff/admin ids; payment proof submission is
-- only used from signed-in account pages.
REVOKE EXECUTE ON FUNCTION public.og_staff_admin_user_ids() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.og_submit_payment_proof(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.og_submit_payment_proof(text, text) TO authenticated;
