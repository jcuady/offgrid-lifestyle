-- Public CMS image bucket for homepage / landing content (admin upload, public read).
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-cms', 'site-cms', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS site_cms_public_read ON storage.objects;
DROP POLICY IF EXISTS site_cms_admin_insert ON storage.objects;
DROP POLICY IF EXISTS site_cms_admin_update ON storage.objects;
DROP POLICY IF EXISTS site_cms_admin_delete ON storage.objects;

CREATE POLICY site_cms_public_read ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'site-cms');

CREATE POLICY site_cms_admin_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-cms'
  AND public.og_portal_role() = 'admin'
);

CREATE POLICY site_cms_admin_update ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'site-cms'
  AND public.og_portal_role() = 'admin'
)
WITH CHECK (
  bucket_id = 'site-cms'
  AND public.og_portal_role() = 'admin'
);

CREATE POLICY site_cms_admin_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'site-cms'
  AND public.og_portal_role() = 'admin'
);

-- Align featured spotlight admin policy with other CMS tables (og_portal_role).
DROP POLICY IF EXISTS og_site_featured_spotlight_admin_write ON public.og_site_featured_spotlight;

CREATE POLICY og_site_featured_spotlight_admin_write
  ON public.og_site_featured_spotlight FOR ALL
  USING (public.og_portal_role() = 'admin')
  WITH CHECK (public.og_portal_role() = 'admin');
