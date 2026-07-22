-- Speed admin/staff user lists: filter by role (+ status) and sort by newest.
CREATE INDEX IF NOT EXISTS og_portal_users_role_created_at_idx
  ON public.og_portal_users (role, created_at DESC);

CREATE INDEX IF NOT EXISTS og_portal_users_role_status_created_at_idx
  ON public.og_portal_users (role, status, created_at DESC);

-- Catalog admin / hydrate ordering.
CREATE INDEX IF NOT EXISTS og_products_created_at_idx
  ON public.og_products (created_at DESC);
