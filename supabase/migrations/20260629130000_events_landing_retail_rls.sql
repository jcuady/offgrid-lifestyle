-- Retail checkout insert (guests + customers)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'og_orders' AND policyname = 'og_orders_insert_retail'
  ) THEN
    CREATE POLICY og_orders_insert_retail ON public.og_orders
    FOR INSERT TO anon, authenticated
    WITH CHECK (order_type = 'retail');
  END IF;
END $$;

-- Events CMS table
CREATE TABLE IF NOT EXISTS public.og_events (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  event_date text NOT NULL DEFAULT '',
  event_time text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'community',
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past', 'cancelled')),
  featured boolean NOT NULL DEFAULT false,
  price text NOT NULL DEFAULT '',
  capacity integer,
  registered integer,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_og_events_status_sort ON public.og_events (status, sort_order);

ALTER TABLE public.og_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'og_events' AND policyname = 'og_events_public_read') THEN
    CREATE POLICY og_events_public_read ON public.og_events FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'og_events' AND policyname = 'og_events_admin_write') THEN
    CREATE POLICY og_events_admin_write ON public.og_events FOR ALL TO authenticated
    USING (public.og_portal_role() = 'admin') WITH CHECK (public.og_portal_role() = 'admin');
  END IF;
END $$;

-- Landing page scope for homepage CMS JSON
ALTER TABLE public.og_site_custom_pages DROP CONSTRAINT IF EXISTS og_site_custom_pages_scope_check;
ALTER TABLE public.og_site_custom_pages ADD CONSTRAINT og_site_custom_pages_scope_check
  CHECK (scope IN ('hub', 'order_hero', 'wizard', 'templates_page', 'landing'));
