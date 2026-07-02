-- Database advisor fixes: indexes, search_path, RLS initplan caching, payment-assets bucket.

-- ---------------------------------------------------------------------------
-- Order query indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS og_orders_status_idx ON public.og_orders (status);
CREATE INDEX IF NOT EXISTS og_orders_customer_email_lower_idx
  ON public.og_orders (lower(customer_email));

DROP INDEX IF EXISTS public.og_orders_customer_email_idx;

-- ---------------------------------------------------------------------------
-- Pin search_path on helper functions flagged by Supabase linter
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.og_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.og_portal_role()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'portal_role'),
    'customer'
  );
$$;

CREATE OR REPLACE FUNCTION public.og_retail_shipping_valid(info jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT
    info IS NOT NULL
    AND length(trim(coalesce(info->>'fullName', ''))) > 0
    AND length(trim(coalesce(info->>'email', ''))) > 0
    AND length(trim(coalesce(info->>'phone', ''))) > 0
    AND length(trim(coalesce(info->>'address', ''))) > 0
    AND length(trim(coalesce(info->>'barangay', ''))) > 0
    AND length(trim(coalesce(info->>'city', ''))) > 0
    AND length(trim(coalesce(info->>'province', ''))) > 0
    AND length(trim(coalesce(info->>'region', ''))) > 0
    AND coalesce(info->>'zip', '') ~ '^\d{4}$';
$$;

-- ---------------------------------------------------------------------------
-- RLS initplan: wrap auth.uid() / auth.jwt() in (select ...)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS og_portal_users_staff_read_self ON public.og_portal_users;
CREATE POLICY og_portal_users_staff_read_self ON public.og_portal_users
  FOR SELECT TO authenticated
  USING (
    public.og_portal_role() = 'staff'
    AND auth_user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS og_portal_users_staff_update_self ON public.og_portal_users;
CREATE POLICY og_portal_users_staff_update_self ON public.og_portal_users
  FOR UPDATE TO authenticated
  USING (
    public.og_portal_role() = 'staff'
    AND auth_user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    public.og_portal_role() = 'staff'
    AND auth_user_id = (SELECT auth.uid())
    AND role = 'staff'
    AND status = 'active'
  );

DROP POLICY IF EXISTS og_portal_users_customer_insert ON public.og_portal_users;
CREATE POLICY og_portal_users_customer_insert ON public.og_portal_users
  FOR INSERT TO authenticated
  WITH CHECK (
    auth_user_id = (SELECT auth.uid())
    AND role = 'customer'
    AND status = 'active'
  );

DROP POLICY IF EXISTS og_portal_users_customer_read_self ON public.og_portal_users;
CREATE POLICY og_portal_users_customer_read_self ON public.og_portal_users
  FOR SELECT TO authenticated
  USING (auth_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS og_orders_customer_read_own ON public.og_orders;
CREATE POLICY og_orders_customer_read_own ON public.og_orders
  FOR SELECT TO authenticated
  USING (
    public.og_portal_role() = 'customer'
    AND (
      lower(customer_email) = lower((SELECT auth.jwt()) ->> 'email')
      OR customer_id = (
        SELECT id FROM public.og_portal_users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1
      )
    )
  );

DROP POLICY IF EXISTS og_push_subscriptions_user_manage_own ON public.og_push_subscriptions;
CREATE POLICY og_push_subscriptions_user_manage_own ON public.og_push_subscriptions
  FOR ALL TO authenticated
  USING (
    user_id = (
      SELECT id FROM public.og_portal_users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1
    )
  )
  WITH CHECK (
    user_id = (
      SELECT id FROM public.og_portal_users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1
    )
  );

DROP POLICY IF EXISTS og_notifications_read_own ON public.og_notifications;
CREATE POLICY og_notifications_read_own ON public.og_notifications
  FOR SELECT TO authenticated
  USING (
    user_id = (
      SELECT id FROM public.og_portal_users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1
    )
  );

DROP POLICY IF EXISTS og_notifications_update_own ON public.og_notifications;
CREATE POLICY og_notifications_update_own ON public.og_notifications
  FOR UPDATE TO authenticated
  USING (
    user_id = (
      SELECT id FROM public.og_portal_users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1
    )
  )
  WITH CHECK (
    user_id = (
      SELECT id FROM public.og_portal_users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1
    )
  );

DROP POLICY IF EXISTS og_notifications_insert_staff ON public.og_notifications;
CREATE POLICY og_notifications_insert_staff ON public.og_notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.og_portal_role() IN ('admin', 'staff')
    OR user_id = (
      SELECT id FROM public.og_portal_users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1
    )
  );

DROP POLICY IF EXISTS authenticated_read_own ON public.og_product_reviews;
CREATE POLICY authenticated_read_own ON public.og_product_reviews
  FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR lower(customer_email) = lower((SELECT auth.jwt()) ->> 'email')
  );

DROP POLICY IF EXISTS admin_update_delete ON public.og_product_reviews;
CREATE POLICY admin_update_delete ON public.og_product_reviews
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.og_portal_users
      WHERE email = (SELECT auth.jwt()) ->> 'email'
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.og_portal_users
      WHERE email = (SELECT auth.jwt()) ->> 'email'
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS customer_insert_review_delivered ON public.og_product_reviews;
CREATE POLICY customer_insert_review_delivered ON public.og_product_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    lower(customer_email) = lower((SELECT auth.jwt()) ->> 'email')
    AND EXISTS (
      SELECT 1 FROM public.og_orders o
      WHERE o.id = order_id
        AND o.status = 'delivered'
        AND o.order_type = 'retail'
        AND (
          lower(o.customer_email) = lower((SELECT auth.jwt()) ->> 'email')
          OR o.customer_id = (
            SELECT id FROM public.og_portal_users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- payment-assets bucket (GCash QR uploads from admin)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-assets', 'payment-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS payment_assets_public_read ON storage.objects;
DROP POLICY IF EXISTS payment_assets_admin_insert ON storage.objects;
DROP POLICY IF EXISTS payment_assets_admin_update ON storage.objects;
DROP POLICY IF EXISTS payment_assets_admin_delete ON storage.objects;
DROP POLICY IF EXISTS payment_assets_select ON storage.objects;

CREATE POLICY payment_assets_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'payment-assets');

CREATE POLICY payment_assets_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-assets'
    AND public.og_portal_role() = 'admin'
  );

CREATE POLICY payment_assets_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'payment-assets'
    AND public.og_portal_role() = 'admin'
  )
  WITH CHECK (
    bucket_id = 'payment-assets'
    AND public.og_portal_role() = 'admin'
  );

CREATE POLICY payment_assets_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-assets'
    AND public.og_portal_role() = 'admin'
  );
