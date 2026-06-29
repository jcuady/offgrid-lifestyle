-- Tighten storage access: private buckets, scoped insert/select policies.

UPDATE storage.buckets SET public = false WHERE id IN ('payment-proofs', 'custom-order-files');

DROP POLICY IF EXISTS payment_proofs_insert ON storage.objects;
DROP POLICY IF EXISTS payment_proofs_select ON storage.objects;
DROP POLICY IF EXISTS custom_order_files_insert ON storage.objects;
DROP POLICY IF EXISTS custom_order_files_select ON storage.objects;

-- Payment proof: customer on own order, staff/admin on any.
CREATE POLICY payment_proofs_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (
    public.og_portal_role() IN ('admin', 'staff')
    OR EXISTS (
      SELECT 1 FROM public.og_orders o
      JOIN public.og_portal_users u ON u.auth_user_id = auth.uid()
      WHERE o.id = (storage.foldername(name))[1]
        AND (o.customer_id = u.id OR lower(o.customer_email) = lower(u.email))
    )
  )
);

CREATE POLICY payment_proofs_select ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (
    public.og_portal_role() IN ('admin', 'staff')
    OR EXISTS (
      SELECT 1 FROM public.og_orders o
      JOIN public.og_portal_users u ON u.auth_user_id = auth.uid()
      WHERE o.id = (storage.foldername(name))[1]
        AND (o.customer_id = u.id OR lower(o.customer_email) = lower(u.email))
    )
  )
);

-- Custom order files: guest/customer on order folder, staff/admin read all.
CREATE POLICY custom_order_files_insert ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'custom-order-files'
  AND EXISTS (
    SELECT 1 FROM public.og_orders o
    WHERE o.id = (storage.foldername(name))[1]
      AND o.order_type = 'custom'
      AND o.created_at > now() - interval '24 hours'
  )
);

CREATE POLICY custom_order_files_select ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'custom-order-files'
  AND (
    public.og_portal_role() IN ('admin', 'staff')
    OR EXISTS (
      SELECT 1 FROM public.og_orders o
      JOIN public.og_portal_users u ON u.auth_user_id = auth.uid()
      WHERE o.id = (storage.foldername(name))[1]
        AND (o.customer_id = u.id OR lower(o.customer_email) = lower(u.email))
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_og_orders_customer_id ON public.og_orders (customer_id)
  WHERE customer_id IS NOT NULL;
