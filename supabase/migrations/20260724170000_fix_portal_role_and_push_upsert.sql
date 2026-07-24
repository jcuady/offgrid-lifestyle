-- Source of truth for portal role: og_portal_users (JWT app_metadata as fallback).
-- Fixes audit insert RLS when JWT lacks portal_role but DB role is admin/staff.
CREATE OR REPLACE FUNCTION public.og_portal_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT coalesce(
    (
      SELECT u.role
      FROM public.og_portal_users u
      WHERE u.auth_user_id = (SELECT auth.uid())
        AND u.status = 'active'
      LIMIT 1
    ),
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'portal_role'),
    'customer'
  );
$$;

COMMENT ON FUNCTION public.og_portal_role() IS
  'Active portal role for auth.uid(); falls back to JWT app_metadata.portal_role, else customer.';

-- Claim/upsert push endpoint for the signed-in portal user (bypasses ON CONFLICT RLS traps).
CREATE OR REPLACE FUNCTION public.og_upsert_my_push_subscription(
  p_endpoint text,
  p_keys_p256dh text,
  p_keys_auth text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_id uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_user_id
  FROM public.og_portal_users
  WHERE auth_user_id = (SELECT auth.uid())
    AND status = 'active'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No portal user for this session';
  END IF;

  INSERT INTO public.og_push_subscriptions (endpoint, keys_p256dh, keys_auth, user_id)
  VALUES (p_endpoint, p_keys_p256dh, p_keys_auth, v_user_id)
  ON CONFLICT (endpoint) DO UPDATE
    SET keys_p256dh = EXCLUDED.keys_p256dh,
        keys_auth = EXCLUDED.keys_auth,
        user_id = v_user_id
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.og_upsert_my_push_subscription(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.og_upsert_my_push_subscription(text, text, text) TO authenticated;

COMMENT ON FUNCTION public.og_upsert_my_push_subscription(text, text, text) IS
  'Upsert Web Push subscription for the caller; reassigns endpoint ownership to their portal user.';
