-- Allow collection kind in rename/delete catalog term RPCs (parity with 20260918120000).
CREATE OR REPLACE FUNCTION public.og_rename_catalog_term(p_kind text, p_from_label text, p_to_label text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_from text := trim(both from coalesce(p_from_label, ''));
  v_to text := trim(both from coalesce(p_to_label, ''));
  v_slug text;
  v_id uuid;
BEGIN
  IF public.og_portal_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Admin only';
  END IF;
  IF p_kind NOT IN ('tag', 'sport', 'collection') THEN
    RAISE EXCEPTION 'Invalid kind';
  END IF;
  IF v_from = '' OR v_to = '' THEN
    RAISE EXCEPTION 'Both labels are required';
  END IF;
  IF char_length(v_to) > 40 THEN
    RAISE EXCEPTION 'Label must be 40 characters or fewer';
  END IF;

  v_slug := lower(regexp_replace(regexp_replace(v_to, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'));
  IF v_slug = '' THEN v_slug := 'label'; END IF;

  SELECT id INTO v_id FROM public.og_catalog_terms
   WHERE kind = p_kind AND lower(label) = lower(v_from)
   LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.og_catalog_terms (kind, label, slug)
    VALUES (p_kind, v_to, v_slug)
    ON CONFLICT (kind, slug) DO UPDATE SET label = excluded.label, updated_at = now();
  ELSE
    UPDATE public.og_catalog_terms
       SET label = v_to, slug = v_slug, updated_at = now()
     WHERE id = v_id;
  END IF;

  IF p_kind = 'tag' THEN
    UPDATE public.og_products
       SET tags = (
         SELECT coalesce(array_agg(CASE WHEN lower(t) = lower(v_from) THEN v_to ELSE t END), '{}')
         FROM unnest(coalesce(tags, '{}')) AS t
       ),
           updated_at = now()
     WHERE tags IS NOT NULL AND EXISTS (
       SELECT 1 FROM unnest(tags) AS t WHERE lower(t) = lower(v_from)
     );
  ELSIF p_kind = 'sport' THEN
    UPDATE public.og_products
       SET sports = (
         SELECT coalesce(array_agg(CASE WHEN lower(t) = lower(v_from) THEN v_to ELSE t END), '{}')
         FROM unnest(coalesce(sports, '{}')) AS t
       ),
           updated_at = now()
     WHERE sports IS NOT NULL AND EXISTS (
       SELECT 1 FROM unnest(sports) AS t WHERE lower(t) = lower(v_from)
     );
  ELSIF p_kind = 'collection' THEN
    UPDATE public.og_products
       SET collection_ids = (
         SELECT coalesce(array_agg(
           CASE WHEN lower(cid) = lower(regexp_replace(regexp_replace(v_from, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
                THEN v_slug ELSE cid END
         ), '{}')
         FROM unnest(coalesce(collection_ids, '{}')) AS cid
       ),
           updated_at = now()
     WHERE collection_ids IS NOT NULL;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.og_delete_catalog_term(p_kind text, p_label text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_label text := trim(both from coalesce(p_label, ''));
  v_slug text;
BEGIN
  IF public.og_portal_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Admin only';
  END IF;
  IF p_kind NOT IN ('tag', 'sport', 'collection') THEN
    RAISE EXCEPTION 'Invalid kind';
  END IF;
  IF v_label = '' THEN
    RAISE EXCEPTION 'Label is required';
  END IF;

  v_slug := lower(regexp_replace(regexp_replace(v_label, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'));

  DELETE FROM public.og_catalog_terms
   WHERE kind = p_kind AND lower(label) = lower(v_label);

  IF p_kind = 'tag' THEN
    UPDATE public.og_products
       SET tags = array_remove(tags, v_label),
           updated_at = now()
     WHERE tags IS NOT NULL AND v_label = ANY(tags);
  ELSIF p_kind = 'sport' THEN
    UPDATE public.og_products
       SET sports = array_remove(sports, v_label),
           updated_at = now()
     WHERE sports IS NOT NULL AND v_label = ANY(sports);
  ELSIF p_kind = 'collection' THEN
    UPDATE public.og_products
       SET collection_ids = array_remove(collection_ids, v_slug),
           updated_at = now()
     WHERE collection_ids IS NOT NULL AND v_slug = ANY(collection_ids);
  END IF;
END;
$function$;
