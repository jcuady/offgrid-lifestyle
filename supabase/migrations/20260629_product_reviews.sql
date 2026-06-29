CREATE TABLE IF NOT EXISTS og_product_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text NOT NULL,
  product_name text NOT NULL,
  order_id text NOT NULL,
  customer_id text NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE og_product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_approved" ON og_product_reviews
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "authenticated_insert" ON og_product_reviews
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_read_own" ON og_product_reviews
  FOR SELECT TO authenticated
  USING (customer_email = (auth.jwt() ->> 'email'));

CREATE POLICY "admin_update_delete" ON og_product_reviews
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM og_portal_users
      WHERE email = (auth.jwt() ->> 'email')
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM og_portal_users
      WHERE email = (auth.jwt() ->> 'email')
      AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_og_product_reviews_product_id ON og_product_reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_og_product_reviews_status ON og_product_reviews (status);
CREATE INDEX IF NOT EXISTS idx_og_product_reviews_order_id ON og_product_reviews (order_id);
