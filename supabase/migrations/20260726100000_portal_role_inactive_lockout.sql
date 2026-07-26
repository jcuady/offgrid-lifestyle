-- Inactive portal users must not inherit staff/admin via JWT app_metadata fallback.
-- If a portal row exists but is inactive, return NULL (fails role checks).
-- JWT fallback only applies when no portal row exists yet (bootstrap race).

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
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM public.og_portal_users u
        WHERE u.auth_user_id = (SELECT auth.uid())
      ) THEN NULL
      ELSE ((SELECT auth.jwt()) -> 'app_metadata' ->> 'portal_role')
    END,
    'customer'
  );
$$;

COMMENT ON FUNCTION public.og_portal_role() IS
  'Active portal role for auth.uid(); JWT fallback only when no portal row exists; inactive rows get no elevated role.';
