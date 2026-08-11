-- security-: trigger functions are not RPCs — revoke public EXECUTE
-- query-: covering indexes for unindexed FKs on hot write/audit tables

REVOKE ALL ON FUNCTION public.og_enforce_event_capacity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.og_orders_advance_on_payment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.og_validate_order_status_transition() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.og_set_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.og_enforce_event_capacity() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.og_orders_advance_on_payment() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.og_validate_order_status_transition() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.og_set_updated_at() TO postgres, service_role;

CREATE INDEX IF NOT EXISTS og_audit_logs_actor_id_idx
  ON public.og_audit_logs (actor_id);

CREATE INDEX IF NOT EXISTS og_order_quote_internal_notes_updated_by_idx
  ON public.og_order_quote_internal_notes (updated_by);

CREATE INDEX IF NOT EXISTS og_portal_users_created_by_idx
  ON public.og_portal_users (created_by);
