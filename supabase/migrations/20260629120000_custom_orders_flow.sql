-- Custom order submissions + file storage + list indexes

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'og_orders' AND schemaname = 'public'
      AND policyname = 'og_orders_insert_custom'
  ) THEN
    CREATE POLICY og_orders_insert_custom
    ON public.og_orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (order_type = 'custom');
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-order-files', 'custom-order-files', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage'
      AND policyname='custom_order_files_insert'
  ) THEN
    CREATE POLICY custom_order_files_insert ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'custom-order-files');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage'
      AND policyname='custom_order_files_select'
  ) THEN
    CREATE POLICY custom_order_files_select ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'custom-order-files');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_og_orders_type_created
  ON public.og_orders (order_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_og_orders_customer_email
  ON public.og_orders (customer_email)
  WHERE customer_email IS NOT NULL;
