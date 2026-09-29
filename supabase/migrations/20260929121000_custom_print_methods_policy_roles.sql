-- anon cannot execute og_portal_role(), so admin policies must be scoped to
-- authenticated or every anonymous read of og_custom_print_methods fails.

drop policy if exists "og_custom_print_methods_public_read" on public.og_custom_print_methods;
create policy "og_custom_print_methods_public_read"
  on public.og_custom_print_methods for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "og_custom_print_methods_admin_read" on public.og_custom_print_methods;
create policy "og_custom_print_methods_admin_read"
  on public.og_custom_print_methods for select
  to authenticated
  using (public.og_portal_role() = 'admin');

drop policy if exists "og_custom_print_methods_admin_write" on public.og_custom_print_methods;
create policy "og_custom_print_methods_admin_write"
  on public.og_custom_print_methods for all
  to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
