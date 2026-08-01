-- Wave 5: consolidate remaining multiple_permissive_policies without widening access.

-- ---------------------------------------------------------------------------
-- og_orders: one insert; split admin/staff ALL; one select + one update for authenticated
-- ---------------------------------------------------------------------------
drop policy if exists og_orders_insert_retail on public.og_orders;
drop policy if exists og_orders_insert_custom on public.og_orders;
drop policy if exists og_orders_admin_staff_all on public.og_orders;
drop policy if exists og_orders_customer_read_own on public.og_orders;
drop policy if exists og_orders_customer_update_own on public.og_orders;
drop policy if exists og_orders_public_insert on public.og_orders;
drop policy if exists og_orders_authenticated_select on public.og_orders;
drop policy if exists og_orders_authenticated_update on public.og_orders;
drop policy if exists og_orders_admin_staff_delete on public.og_orders;

create policy og_orders_public_insert
  on public.og_orders for insert
  to anon, authenticated
  with check (order_type = any (array['retail'::text, 'custom'::text]));

create policy og_orders_authenticated_select
  on public.og_orders for select
  to authenticated
  using (
    public.og_portal_role() = any (array['admin'::text, 'staff'::text])
    or (
      public.og_portal_role() = 'customer'
      and (
        lower(customer_email) = lower((select auth.jwt()) ->> 'email')
        or customer_id = (
          select id from public.og_portal_users
          where auth_user_id = (select auth.uid())
          limit 1
        )
      )
    )
  );

create policy og_orders_authenticated_update
  on public.og_orders for update
  to authenticated
  using (
    public.og_portal_role() = any (array['admin'::text, 'staff'::text])
    or (
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
  )
  with check (
    public.og_portal_role() = any (array['admin'::text, 'staff'::text])
    or (
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
  );

create policy og_orders_admin_staff_delete
  on public.og_orders for delete
  to authenticated
  using (public.og_portal_role() = any (array['admin'::text, 'staff'::text]));

-- ---------------------------------------------------------------------------
-- og_audit_logs: actor_insert already covers admin/staff — drop redundant admin_insert
-- ---------------------------------------------------------------------------
drop policy if exists og_audit_logs_admin_insert on public.og_audit_logs;

-- ---------------------------------------------------------------------------
-- og_payment_settings: public select once; admin write-only (no FOR ALL SELECT)
-- ---------------------------------------------------------------------------
drop policy if exists og_payment_settings_admin_all on public.og_payment_settings;
drop policy if exists og_payment_settings_staff_read on public.og_payment_settings;
drop policy if exists og_payment_settings_public_read on public.og_payment_settings;
drop policy if exists og_payment_settings_anon_select on public.og_payment_settings;
drop policy if exists og_payment_settings_authenticated_select on public.og_payment_settings;
drop policy if exists og_payment_settings_admin_insert on public.og_payment_settings;
drop policy if exists og_payment_settings_admin_update on public.og_payment_settings;
drop policy if exists og_payment_settings_admin_delete on public.og_payment_settings;

create policy og_payment_settings_anon_select
  on public.og_payment_settings for select to anon
  using (true);
create policy og_payment_settings_authenticated_select
  on public.og_payment_settings for select to authenticated
  using (true);
create policy og_payment_settings_admin_insert
  on public.og_payment_settings for insert to authenticated
  with check (public.og_portal_role() = 'admin');
create policy og_payment_settings_admin_update
  on public.og_payment_settings for update to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
create policy og_payment_settings_admin_delete
  on public.og_payment_settings for delete to authenticated
  using (public.og_portal_role() = 'admin');

-- ---------------------------------------------------------------------------
-- og_notifications: one authenticated SELECT
-- ---------------------------------------------------------------------------
drop policy if exists og_notifications_admin_read on public.og_notifications;
drop policy if exists og_notifications_read_own on public.og_notifications;
create policy og_notifications_authenticated_select
  on public.og_notifications for select to authenticated
  using (
    public.og_portal_role() = 'admin'
    or user_id = (
      select id from public.og_portal_users
      where auth_user_id = (select auth.uid())
      limit 1
    )
  );

-- ---------------------------------------------------------------------------
-- og_push_subscriptions: write-only own manage + one SELECT (own OR admin)
-- ---------------------------------------------------------------------------
drop policy if exists og_push_subscriptions_user_manage_own on public.og_push_subscriptions;
drop policy if exists og_push_subscriptions_admin_read on public.og_push_subscriptions;
drop policy if exists og_push_subscriptions_authenticated_select on public.og_push_subscriptions;
drop policy if exists og_push_subscriptions_own_insert on public.og_push_subscriptions;
drop policy if exists og_push_subscriptions_own_update on public.og_push_subscriptions;
drop policy if exists og_push_subscriptions_own_delete on public.og_push_subscriptions;

create policy og_push_subscriptions_authenticated_select
  on public.og_push_subscriptions for select to authenticated
  using (
    public.og_portal_role() = 'admin'
    or user_id = (
      select id from public.og_portal_users
      where auth_user_id = (select auth.uid())
      limit 1
    )
  );
create policy og_push_subscriptions_own_insert
  on public.og_push_subscriptions for insert to authenticated
  with check (
    user_id = (
      select id from public.og_portal_users
      where auth_user_id = (select auth.uid())
      limit 1
    )
  );
create policy og_push_subscriptions_own_update
  on public.og_push_subscriptions for update to authenticated
  using (
    user_id = (
      select id from public.og_portal_users
      where auth_user_id = (select auth.uid())
      limit 1
    )
  )
  with check (
    user_id = (
      select id from public.og_portal_users
      where auth_user_id = (select auth.uid())
      limit 1
    )
  );
create policy og_push_subscriptions_own_delete
  on public.og_push_subscriptions for delete to authenticated
  using (
    user_id = (
      select id from public.og_portal_users
      where auth_user_id = (select auth.uid())
      limit 1
    )
  );

-- ---------------------------------------------------------------------------
-- og_product_reviews: one SELECT per role; one authenticated INSERT
-- ---------------------------------------------------------------------------
drop policy if exists public_read_approved on public.og_product_reviews;
drop policy if exists authenticated_read_own on public.og_product_reviews;
drop policy if exists customer_insert_review_delivered on public.og_product_reviews;
drop policy if exists og_product_reviews_admin_insert on public.og_product_reviews;
drop policy if exists og_product_reviews_anon_select on public.og_product_reviews;
drop policy if exists og_product_reviews_authenticated_select on public.og_product_reviews;
drop policy if exists og_product_reviews_authenticated_insert on public.og_product_reviews;

create policy og_product_reviews_anon_select
  on public.og_product_reviews for select to anon
  using (status = 'approved');

create policy og_product_reviews_authenticated_select
  on public.og_product_reviews for select to authenticated
  using (
    status = 'approved'
    or lower(customer_email) = lower((select auth.jwt()) ->> 'email')
    or exists (
      select 1 from public.og_portal_users
      where email = (select auth.jwt()) ->> 'email'
        and role = 'admin'
    )
  );

create policy og_product_reviews_authenticated_insert
  on public.og_product_reviews for insert to authenticated
  with check (
    exists (
      select 1 from public.og_portal_users
      where email = (select auth.jwt()) ->> 'email'
        and role = 'admin'
    )
    or (
      lower(customer_email) = lower((select auth.jwt()) ->> 'email')
      and exists (
        select 1 from public.og_orders o
        where o.id = order_id
          and o.status = 'delivered'
          and o.order_type = 'retail'
          and (
            lower(o.customer_email) = lower((select auth.jwt()) ->> 'email')
            or o.customer_id = (
              select id from public.og_portal_users
              where auth_user_id = (select auth.uid())
              limit 1
            )
          )
      )
    )
  );
