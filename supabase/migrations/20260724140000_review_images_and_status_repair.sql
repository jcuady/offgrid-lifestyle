-- Review photos for delivered retail buyers + public display on PDP.
-- Also repair legacy QA rows stuck on invalid status `pending_review`.

ALTER TABLE public.og_product_reviews
  ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.og_product_reviews.image_url IS
  'Optional customer photo (public URL or storage reference).';

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS review_images_insert ON storage.objects;
CREATE POLICY review_images_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'review-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS review_images_public_select ON storage.objects;
CREATE POLICY review_images_public_select ON storage.objects
  FOR SELECT
  USING (bucket_id = 'review-images');

DROP POLICY IF EXISTS review_images_owner_update ON storage.objects;
CREATE POLICY review_images_owner_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'review-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'review-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS review_images_owner_delete ON storage.objects;
CREATE POLICY review_images_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'review-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Stuck QA fixtures used a status that is not in STATUS_FLOW / transition trigger.
ALTER TABLE public.og_orders DISABLE TRIGGER og_orders_validate_status_transition;
UPDATE public.og_orders
SET status = 'pending_deposit', updated_at = now()
WHERE status = 'pending_review';
ALTER TABLE public.og_orders ENABLE TRIGGER og_orders_validate_status_transition;
