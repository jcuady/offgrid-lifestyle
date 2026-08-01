-- Consolidate og_portal_users to one policy per role+action.

drop policy if exists og_portal_users_admin_all on public.og_portal_users;
drop policy if exists og_portal_users_customer_insert on public.og_portal_users;
drop policy if exists og_portal_users_customer_read_self on public.og_portal_users;
drop policy if exists og_portal_users_staff_read_self on public.og_portal_users;
drop policy if exists og_portal_users_customer_update_self on public.og_portal_users;
drop policy if exists og_portal_users_staff_update_self on public.og_portal_users;
drop policy if exists og_portal_users_authenticated_select on public.og_portal_users;
drop policy if exists og_portal_users_authenticated_insert on public.og_portal_users;
drop policy if exists og_portal_users_authenticated_update on public.og_portal_users;
drop policy if exists og_portal_users_admin_delete on public.og_portal_users;

create policy og_portal_users_authenticated_select
  on public.og_portal_users for select to authenticated
  using (
    public.og_portal_role() = 'admin'
    or auth_user_id = (select auth.uid())
  );

create policy og_portal_users_authenticated_insert
  on public.og_portal_users for insert to authenticated
  with check (
    public.og_portal_role() = 'admin'
    or (
      auth_user_id = (select auth.uid())
      and role = 'customer'
      and status = 'active'
    )
  );

create policy og_portal_users_authenticated_update
  on public.og_portal_users for update to authenticated
  using (
    public.og_portal_role() = 'admin'
    or (
      public.og_portal_role() = 'customer'
      and auth_user_id = (select auth.uid())
    )
    or (
      public.og_portal_role() = 'staff'
      and auth_user_id = (select auth.uid())
    )
  )
  with check (
    public.og_portal_role() = 'admin'
    or (
      public.og_portal_role() = 'customer'
      and auth_user_id = (select auth.uid())
      and role = 'customer'
      and status = 'active'
    )
    or (
      public.og_portal_role() = 'staff'
      and auth_user_id = (select auth.uid())
      and role = 'staff'
      and status = 'active'
    )
  );

create policy og_portal_users_admin_delete
  on public.og_portal_users for delete to authenticated
  using (public.og_portal_role() = 'admin');
