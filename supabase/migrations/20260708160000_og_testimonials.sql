-- Testimonials wall CMS (admin CRUD, public read published rows)
CREATE TABLE IF NOT EXISTS public.og_testimonials (
  id text PRIMARY KEY,
  quote text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT '',
  handle text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  rating smallint NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  published boolean NOT NULL DEFAULT true,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_og_testimonials_published_sort
  ON public.og_testimonials (published, sort_order);

ALTER TABLE public.og_testimonials ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS og_testimonials_updated_at ON public.og_testimonials;
CREATE TRIGGER og_testimonials_updated_at
  BEFORE UPDATE ON public.og_testimonials
  FOR EACH ROW EXECUTE FUNCTION public.og_set_updated_at();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'og_testimonials' AND policyname = 'og_testimonials_public_read'
  ) THEN
    CREATE POLICY og_testimonials_public_read ON public.og_testimonials
      FOR SELECT TO anon, authenticated
      USING (published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'og_testimonials' AND policyname = 'og_testimonials_admin_read'
  ) THEN
    CREATE POLICY og_testimonials_admin_read ON public.og_testimonials
      FOR SELECT TO authenticated
      USING (public.og_portal_role() = 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'og_testimonials' AND policyname = 'og_testimonials_admin_write'
  ) THEN
    CREATE POLICY og_testimonials_admin_write ON public.og_testimonials
      FOR ALL TO authenticated
      USING (public.og_portal_role() = 'admin')
      WITH CHECK (public.og_portal_role() = 'admin');
  END IF;
END $$;

INSERT INTO public.og_testimonials (
  id, quote, author, handle, location, tag, outcome, image, featured, rating, published, sort_order
) VALUES
  (
    'tm-carlos-pickle',
    'The custom team kit looked premium and held up in weekend matches. Breathability and fit were exactly what we asked for.',
    'Carlos Tolentino', '@carlos.plays', 'Quezon City', 'Pickleball',
    'Team reorder after first batch', '/images/community/community-ultimate-catch.jpg',
    true, 5, true, 0
  ),
  (
    'tm-camille-fairway',
    'The Fairway Tee is lightweight but still feels substantial. It worked for both course play and casual wear after game day.',
    'Camille Reyes', '@cam.onthefairway', 'BGC, Taguig', 'Golf',
    'Higher event-day sell-through', '/images/community/community-pilipinas-portrait.jpg',
    false, 5, true, 1
  ),
  (
    'tm-enzo-lifestyle',
    'OG Pilipinas pieces gave us a clean athletic look without feeling generic. The design process was simple and fast.',
    'Enzo Dela Cruz', '@enzo.dc', 'Makati', 'Lifestyle',
    'Repeat custom inquiry in 2 weeks', '/images/community/product-og-backpack.jpg',
    false, 5, true, 2
  ),
  (
    'tm-jeri-running',
    'From template download to order submission, the flow was straightforward. No confusion, and sizing recommendations were accurate.',
    'Jeri Lim', '@jeri.runs', 'Pasig', 'Running',
    'Zero size-exchange issues', '/images/community/community-laces.jpg',
    false, 5, true, 3
  ),
  (
    'tm-maya-bulk',
    'As a team manager, I liked that statuses were transparent and delivery expectations were clear. It felt reliable from day one.',
    'Maya Santos', '@maya.teamops', 'Cebu', 'Team Orders',
    'Scaled from 30 to 90 pcs', '/images/community/product-pilipinas-duffel.jpg',
    false, 5, true, 4
  ),
  (
    'tm-paolo-events',
    'The product quality and brand storytelling helped us present better at events. Customers noticed the premium vibe immediately.',
    'Paolo Navarro', '@paolo.events', 'Davao', 'Events',
    'Stronger booth conversion', '/images/community/community-towels-walk.jpg',
    false, 5, true, 5
  )
ON CONFLICT (id) DO NOTHING;
