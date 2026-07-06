-- Seed canonical template slots when the table is empty.
INSERT INTO public.og_custom_template_slots (
  id, category, name, description, file_name, file_url, storage_kind, format, preview_image_url, is_published
)
SELECT * FROM (VALUES
  ('tpl-ogl-shirt', 'jerseys', 'Shirt template', 'Short sleeve layout — safe zones and bleed for production.', 'oglifestyle-template-shirt.ai', '/templates/og-client/oglifestyle-template-shirt.ai', 'static', 'AI', NULL, true),
  ('tpl-ogl-banner', 'jerseys', 'Banner template', 'Wide banner artwork guides.', 'oglifestyle-template-banner.ai', '/templates/og-client/oglifestyle-template-banner.ai', 'static', 'AI', NULL, true),
  ('tpl-og-roundneck', 'jerseys', 'Round neck shirt template', 'Round neck silhouette — placement and margins.', 'og-roundneck-shirt-template.ai', '/templates/og-client/og-roundneck-shirt-template.ai', 'static', 'AI', NULL, true),
  ('tpl-ogl-singlet', 'jerseys', 'Singlet template', 'Singlet panels and print zones.', 'oglifestyle-template-singlet.ai', '/templates/og-client/oglifestyle-template-singlet.ai', 'static', 'AI', NULL, true),
  ('tpl-ogl-longsleeves', 'jerseys', 'Long sleeves template', 'Long sleeve layout — sleeves and torso guides.', 'oglifestyle-template-longsleeves.ai', '/templates/og-client/oglifestyle-template-longsleeves.ai', 'static', 'AI', NULL, true),
  ('tpl-ogl-longsleeves-hoodie', 'jerseys', 'Long sleeves hoodie template', 'Hoodie silhouette — hood, body, and sleeve zones.', 'oglifestyle-template-longsleeves-hoodie.ai', '/templates/og-client/oglifestyle-template-longsleeves-hoodie.ai', 'static', 'AI', NULL, true),
  ('tpl-ogl-shorts', 'shorts', 'Shorts template', 'Shorts panels — waist, legs, and trim.', 'oglifestyle-template-shorts.ai', '/templates/og-client/oglifestyle-template-shorts.ai', 'static', 'AI', NULL, true),
  ('tpl-headwear-cap', 'headwear', 'Cap template (upload required)', 'Placeholder slot for custom cap layout file.', 'offgrid-cap-template.ai', '#', 'static', 'AI', NULL, false),
  ('tpl-headwear-bucket', 'headwear', 'Bucket hat template (upload required)', 'Placeholder slot for bucket hat panel guide.', 'offgrid-bucket-hat-template.ai', '#', 'static', 'AI', NULL, false),
  ('tpl-facetowel-ai', 'towels', 'Face towel template (Illustrator)', 'Vector towel layout — use with JPG reference if needed.', 'facetowel-template.ai', '/templates/og-client/facetowel-template.ai', 'static', 'AI', '/templates/og-client/facetowel-template.jpg', true),
  ('tpl-facetowel-jpg', 'towels', 'Face towel reference (JPG)', 'Raster reference for face towel artwork.', 'facetowel-template.jpg', '/templates/og-client/facetowel-template.jpg', 'static', 'JPG', '/templates/og-client/facetowel-template.jpg', true),
  ('tpl-handtowel-ai', 'towels', 'Hand towel template (Illustrator)', 'Vector towel layout — pair with JPG reference.', 'handtowel-template.ai', '/templates/og-client/handtowel-template.ai', 'static', 'AI', '/templates/og-client/handtowel-template.jpg', true),
  ('tpl-handtowel-jpg', 'towels', 'Hand towel reference (JPG)', 'Raster reference for hand towel artwork.', 'handtowel-template.jpg', '/templates/og-client/handtowel-template.jpg', 'static', 'JPG', '/templates/og-client/handtowel-template.jpg', true)
) AS seed (
  id, category, name, description, file_name, file_url, storage_kind, format, preview_image_url, is_published
)
WHERE NOT EXISTS (SELECT 1 FROM public.og_custom_template_slots LIMIT 1);
