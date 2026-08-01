-- Wave 4: advisor hygiene — DEFINER execute surface, storage listing, CMS write/select split,
-- orders customer-update initplan.

-- ---------------------------------------------------------------------------
-- 1) SECURITY DEFINER execute surface
-- ---------------------------------------------------------------------------
revoke all on function public.og_bump_event_registered() from public;
revoke all on function public.og_bump_event_registered() from anon, authenticated;

revoke all on function public.og_portal_role() from public;
revoke all on function public.og_portal_role() from anon;
grant execute on function public.og_portal_role() to authenticated;

revoke all on function public.og_rename_catalog_term(text, text, text) from public;
revoke all on function public.og_rename_catalog_term(text, text, text) from anon;
grant execute on function public.og_rename_catalog_term(text, text, text) to authenticated;

revoke all on function public.og_delete_catalog_term(text, text) from public;
revoke all on function public.og_delete_catalog_term(text, text) from anon;
grant execute on function public.og_delete_catalog_term(text, text) to authenticated;

revoke all on function public.og_upsert_my_push_subscription(text, text, text) from public;
revoke all on function public.og_upsert_my_push_subscription(text, text, text) from anon;
grant execute on function public.og_upsert_my_push_subscription(text, text, text) to authenticated;

revoke all on function public.og_submit_payment_proof(text, text) from public;
revoke all on function public.og_submit_payment_proof(text, text) from anon;
grant execute on function public.og_submit_payment_proof(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Public buckets: drop broad SELECT listing policies (public object URLs still work)
-- ---------------------------------------------------------------------------
drop policy if exists payment_assets_public_read on storage.objects;
drop policy if exists review_images_public_select on storage.objects;
drop policy if exists site_cms_public_read on storage.objects;

-- ---------------------------------------------------------------------------
-- 3) CMS: one SELECT policy per role; admin writes are INSERT/UPDATE/DELETE only
-- ---------------------------------------------------------------------------

-- og_catalog_terms (public read = all rows)
drop policy if exists og_catalog_terms_admin_write on public.og_catalog_terms;
drop policy if exists og_catalog_terms_admin_insert on public.og_catalog_terms;
drop policy if exists og_catalog_terms_admin_update on public.og_catalog_terms;
drop policy if exists og_catalog_terms_admin_delete on public.og_catalog_terms;
create policy og_catalog_terms_admin_insert
  on public.og_catalog_terms for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_catalog_terms_admin_update
  on public.og_catalog_terms for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_catalog_terms_admin_delete
  on public.og_catalog_terms for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- Helper pattern for published CMS tables: anon select + authenticated select (published OR admin)
-- og_site_featured_spotlight
drop policy if exists og_site_featured_spotlight_admin_write on public.og_site_featured_spotlight;
drop policy if exists og_site_featured_spotlight_admin_insert on public.og_site_featured_spotlight;
drop policy if exists og_site_featured_spotlight_admin_update on public.og_site_featured_spotlight;
drop policy if exists og_site_featured_spotlight_admin_delete on public.og_site_featured_spotlight;
drop policy if exists og_site_featured_spotlight_public_read on public.og_site_featured_spotlight;
create policy og_site_featured_spotlight_anon_select
  on public.og_site_featured_spotlight for select to anon
  using (true);
create policy og_site_featured_spotlight_authenticated_select
  on public.og_site_featured_spotlight for select to authenticated
  using (true);
create policy og_site_featured_spotlight_admin_insert
  on public.og_site_featured_spotlight for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_site_featured_spotlight_admin_update
  on public.og_site_featured_spotlight for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_site_featured_spotlight_admin_delete
  on public.og_site_featured_spotlight for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- og_site_custom_pages
drop policy if exists og_site_custom_pages_admin_write on public.og_site_custom_pages;
drop policy if exists og_site_custom_pages_admin_insert on public.og_site_custom_pages;
drop policy if exists og_site_custom_pages_admin_update on public.og_site_custom_pages;
drop policy if exists og_site_custom_pages_admin_delete on public.og_site_custom_pages;
drop policy if exists og_site_custom_pages_public_read on public.og_site_custom_pages;
create policy og_site_custom_pages_anon_select
  on public.og_site_custom_pages for select to anon
  using (true);
create policy og_site_custom_pages_authenticated_select
  on public.og_site_custom_pages for select to authenticated
  using (true);
create policy og_site_custom_pages_admin_insert
  on public.og_site_custom_pages for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_site_custom_pages_admin_update
  on public.og_site_custom_pages for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_site_custom_pages_admin_delete
  on public.og_site_custom_pages for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- og_events
drop policy if exists og_events_admin_write on public.og_events;
drop policy if exists og_events_admin_insert on public.og_events;
drop policy if exists og_events_admin_update on public.og_events;
drop policy if exists og_events_admin_delete on public.og_events;
drop policy if exists og_events_public_read on public.og_events;
create policy og_events_anon_select
  on public.og_events for select to anon
  using (true);
create policy og_events_authenticated_select
  on public.og_events for select to authenticated
  using (true);
create policy og_events_admin_insert
  on public.og_events for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_events_admin_update
  on public.og_events for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_events_admin_delete
  on public.og_events for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- og_custom_guide_sections
drop policy if exists og_custom_guide_sections_admin_write on public.og_custom_guide_sections;
drop policy if exists og_custom_guide_sections_admin_read on public.og_custom_guide_sections;
drop policy if exists og_custom_guide_sections_admin_insert on public.og_custom_guide_sections;
drop policy if exists og_custom_guide_sections_admin_update on public.og_custom_guide_sections;
drop policy if exists og_custom_guide_sections_admin_delete on public.og_custom_guide_sections;
drop policy if exists og_custom_guide_sections_admin_select on public.og_custom_guide_sections;
drop policy if exists og_custom_guide_sections_public_read on public.og_custom_guide_sections;
create policy og_custom_guide_sections_anon_select
  on public.og_custom_guide_sections for select to anon
  using (true);
create policy og_custom_guide_sections_authenticated_select
  on public.og_custom_guide_sections for select to authenticated
  using (true);
create policy og_custom_guide_sections_admin_insert
  on public.og_custom_guide_sections for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_custom_guide_sections_admin_update
  on public.og_custom_guide_sections for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_custom_guide_sections_admin_delete
  on public.og_custom_guide_sections for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- og_custom_headwear_options
drop policy if exists og_custom_headwear_options_admin_write on public.og_custom_headwear_options;
drop policy if exists og_custom_headwear_options_admin_read on public.og_custom_headwear_options;
drop policy if exists og_custom_headwear_options_admin_insert on public.og_custom_headwear_options;
drop policy if exists og_custom_headwear_options_admin_update on public.og_custom_headwear_options;
drop policy if exists og_custom_headwear_options_admin_delete on public.og_custom_headwear_options;
drop policy if exists og_custom_headwear_options_admin_select on public.og_custom_headwear_options;
drop policy if exists og_custom_headwear_options_public_read on public.og_custom_headwear_options;
create policy og_custom_headwear_options_anon_select
  on public.og_custom_headwear_options for select to anon
  using (true);
create policy og_custom_headwear_options_authenticated_select
  on public.og_custom_headwear_options for select to authenticated
  using (true);
create policy og_custom_headwear_options_admin_insert
  on public.og_custom_headwear_options for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_custom_headwear_options_admin_update
  on public.og_custom_headwear_options for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_custom_headwear_options_admin_delete
  on public.og_custom_headwear_options for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- og_custom_template_slots
drop policy if exists og_custom_template_slots_admin_write on public.og_custom_template_slots;
drop policy if exists og_custom_template_slots_admin_read on public.og_custom_template_slots;
drop policy if exists og_custom_template_slots_admin_insert on public.og_custom_template_slots;
drop policy if exists og_custom_template_slots_admin_update on public.og_custom_template_slots;
drop policy if exists og_custom_template_slots_admin_delete on public.og_custom_template_slots;
drop policy if exists og_custom_template_slots_admin_select on public.og_custom_template_slots;
drop policy if exists og_custom_template_slots_public_read on public.og_custom_template_slots;
create policy og_custom_template_slots_anon_select
  on public.og_custom_template_slots for select to anon
  using (true);
create policy og_custom_template_slots_authenticated_select
  on public.og_custom_template_slots for select to authenticated
  using (true);
create policy og_custom_template_slots_admin_insert
  on public.og_custom_template_slots for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_custom_template_slots_admin_update
  on public.og_custom_template_slots for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_custom_template_slots_admin_delete
  on public.og_custom_template_slots for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- og_testimonials: public sees published; admin sees all (one policy per role)
drop policy if exists og_testimonials_admin_write on public.og_testimonials;
drop policy if exists og_testimonials_admin_read on public.og_testimonials;
drop policy if exists og_testimonials_admin_insert on public.og_testimonials;
drop policy if exists og_testimonials_admin_update on public.og_testimonials;
drop policy if exists og_testimonials_admin_delete on public.og_testimonials;
drop policy if exists og_testimonials_admin_select on public.og_testimonials;
drop policy if exists og_testimonials_public_read on public.og_testimonials;
create policy og_testimonials_anon_select
  on public.og_testimonials for select to anon
  using (published = true);
create policy og_testimonials_authenticated_select
  on public.og_testimonials for select to authenticated
  using (published = true or public.og_portal_role() = 'admin');
create policy og_testimonials_admin_insert
  on public.og_testimonials for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_testimonials_admin_update
  on public.og_testimonials for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_testimonials_admin_delete
  on public.og_testimonials for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- og_products: public active; admin all
drop policy if exists og_products_admin_write on public.og_products;
drop policy if exists og_products_admin_read on public.og_products;
drop policy if exists og_products_admin_insert on public.og_products;
drop policy if exists og_products_admin_update on public.og_products;
drop policy if exists og_products_admin_delete on public.og_products;
drop policy if exists og_products_admin_select on public.og_products;
drop policy if exists og_products_public_read on public.og_products;
create policy og_products_anon_select
  on public.og_products for select to anon
  using (status = 'active');
create policy og_products_authenticated_select
  on public.og_products for select to authenticated
  using (status = 'active' or public.og_portal_role() = 'admin');
create policy og_products_admin_insert
  on public.og_products for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_products_admin_update
  on public.og_products for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_products_admin_delete
  on public.og_products for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- og_product_reviews: admin write-only (no SELECT in FOR ALL)
drop policy if exists admin_update_delete on public.og_product_reviews;
drop policy if exists og_product_reviews_admin_insert on public.og_product_reviews;
drop policy if exists og_product_reviews_admin_update on public.og_product_reviews;
drop policy if exists og_product_reviews_admin_delete on public.og_product_reviews;
create policy og_product_reviews_admin_insert
  on public.og_product_reviews for insert to authenticated
  with check (
    exists (
      select 1 from public.og_portal_users
      where email = (select auth.jwt()) ->> 'email'
        and role = 'admin'
    )
  );
create policy og_product_reviews_admin_update
  on public.og_product_reviews for update to authenticated
  using (
    exists (
      select 1 from public.og_portal_users
      where email = (select auth.jwt()) ->> 'email'
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.og_portal_users
      where email = (select auth.jwt()) ->> 'email'
        and role = 'admin'
    )
  );
create policy og_product_reviews_admin_delete
  on public.og_product_reviews for delete to authenticated
  using (
    exists (
      select 1 from public.og_portal_users
      where email = (select auth.jwt()) ->> 'email'
        and role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 4) RLS initplan on customer order update
-- ---------------------------------------------------------------------------
drop policy if exists og_orders_customer_update_own on public.og_orders;
create policy og_orders_customer_update_own
  on public.og_orders
  for update
  to authenticated
  using (
    public.og_portal_role() = 'customer'
    and (
      customer_id = (
        select id from public.og_portal_users
        where auth_user_id = (select auth.uid())
        limit 1
      )
      or lower(customer_email) = lower((select auth.jwt()) ->> 'email')
    )
  )
  with check (
    public.og_portal_role() = 'customer'
    and (
      customer_id = (
        select id from public.og_portal_users
        where auth_user_id = (select auth.uid())
        limit 1
      )
      or lower(customer_email) = lower((select auth.jwt()) ->> 'email')
    )
  );
