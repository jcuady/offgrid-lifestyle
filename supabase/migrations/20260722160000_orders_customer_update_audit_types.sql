-- Allow customers to UPDATE their own orders (custom file metadata patch after insert).
-- Guests may UPDATE recent unpaid custom orders (same window as storage uploads).

CREATE POLICY og_orders_customer_update_own
  ON public.og_orders
  FOR UPDATE
  TO authenticated
  USING (
    og_portal_role() = 'customer'
    AND (
      customer_id = (
        SELECT id FROM public.og_portal_users
        WHERE auth_user_id = (SELECT auth.uid())
        LIMIT 1
      )
      OR lower(customer_email) = lower((SELECT auth.jwt() ->> 'email'))
    )
  )
  WITH CHECK (
    og_portal_role() = 'customer'
    AND (
      customer_id = (
        SELECT id FROM public.og_portal_users
        WHERE auth_user_id = (SELECT auth.uid())
        LIMIT 1
      )
      OR lower(customer_email) = lower((SELECT auth.jwt() ->> 'email'))
    )
  );

-- ponytail: guest custom-order file patch within 24h; tighten to email claim if abuse appears.
CREATE POLICY og_orders_anon_update_recent_custom
  ON public.og_orders
  FOR UPDATE
  TO anon
  USING (
    order_type = 'custom'
    AND customer_id IS NULL
    AND created_at > (now() - interval '24 hours')
  )
  WITH CHECK (
    order_type = 'custom'
    AND customer_id IS NULL
    AND created_at > (now() - interval '24 hours')
  );

-- FE audit Persist uses product/content/review; widen CHECK so inserts succeed.
ALTER TABLE public.og_audit_logs
  DROP CONSTRAINT IF EXISTS og_audit_logs_target_type_check;

ALTER TABLE public.og_audit_logs
  ADD CONSTRAINT og_audit_logs_target_type_check
  CHECK (
    target_type = ANY (
      ARRAY[
        'user'::text,
        'order'::text,
        'payment'::text,
        'session'::text,
        'product'::text,
        'content'::text,
        'review'::text,
        'settings'::text,
        'staff'::text,
        'event'::text,
        'testimonial'::text,
        'page'::text
      ]
    )
  );
