-- Customer auth, order linking, payment proof, checkout settings, review integrity

-- Payment proof on orders
ALTER TABLE public.og_orders
  ADD COLUMN IF NOT EXISTS payment_proof_url text;

COMMENT ON COLUMN public.og_orders.payment_proof_url IS 'Customer-uploaded GCash/bank screenshot URL';

-- payment-proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'payment_proofs_insert'
  ) THEN
    CREATE POLICY payment_proofs_insert ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'payment-proofs');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'payment_proofs_select'
  ) THEN
    CREATE POLICY payment_proofs_select ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'payment-proofs');
  END IF;
END $$;

-- Customer portal user row (sign-up + session resolve)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'og_portal_users' AND policyname = 'og_portal_users_customer_insert'
  ) THEN
    CREATE POLICY og_portal_users_customer_insert ON public.og_portal_users
    FOR INSERT TO authenticated
    WITH CHECK (
      auth_user_id = auth.uid()
      AND role = 'customer'
      AND status = 'active'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'og_portal_users' AND policyname = 'og_portal_users_customer_read_self'
  ) THEN
    CREATE POLICY og_portal_users_customer_read_self ON public.og_portal_users
    FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());
  END IF;
END $$;

-- Customers can read checkout payment settings (GCash QR, COD/PayMongo flags)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'og_payment_settings' AND policyname = 'og_payment_settings_public_read'
  ) THEN
    CREATE POLICY og_payment_settings_public_read ON public.og_payment_settings
    FOR SELECT TO anon, authenticated
    USING (true);
  END IF;
END $$;

-- Customer order read: match email (case-insensitive) OR linked portal user id
DROP POLICY IF EXISTS og_orders_customer_read_own ON public.og_orders;

CREATE POLICY og_orders_customer_read_own ON public.og_orders
FOR SELECT TO authenticated
USING (
  public.og_portal_role() = 'customer'
  AND (
    lower(customer_email) = lower(auth.jwt() ->> 'email')
    OR customer_id = (
      SELECT id FROM public.og_portal_users WHERE auth_user_id = auth.uid() LIMIT 1
    )
  )
);

-- Secure payment proof submit (customers cannot mutate other order fields)
CREATE OR REPLACE FUNCTION public.og_submit_payment_proof(p_order_id text, p_proof_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.og_orders
  SET payment_proof_url = p_proof_url, updated_at = now()
  WHERE id = p_order_id
  AND (
    lower(customer_email) = lower(auth.jwt() ->> 'email')
    OR customer_id = (
      SELECT id FROM public.og_portal_users WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.og_submit_payment_proof(text, text) TO authenticated;

-- Reviews: one per product per order per customer; only on delivered orders
DROP POLICY IF EXISTS authenticated_insert ON public.og_product_reviews;

CREATE UNIQUE INDEX IF NOT EXISTS idx_og_product_reviews_unique_per_order
  ON public.og_product_reviews (order_id, product_id, lower(customer_email));

CREATE POLICY customer_insert_review_delivered ON public.og_product_reviews
FOR INSERT TO authenticated
WITH CHECK (
  lower(customer_email) = lower(auth.jwt() ->> 'email')
  AND EXISTS (
    SELECT 1 FROM public.og_orders o
    WHERE o.id = order_id
    AND o.status = 'delivered'
    AND o.order_type = 'retail'
    AND (
      lower(o.customer_email) = lower(auth.jwt() ->> 'email')
      OR o.customer_id = (
        SELECT id FROM public.og_portal_users WHERE auth_user_id = auth.uid() LIMIT 1
      )
    )
  )
);
