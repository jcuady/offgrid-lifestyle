-- Staff/customer actions were audited only in-memory: og_audit_logs INSERT was admin-only.
-- Allow signed-in portal actors to append their own rows; admin remains the only SELECT reader.

create policy "og_audit_logs_actor_insert"
  on public.og_audit_logs
  for insert
  to authenticated
  with check (
    public.og_portal_role() in ('admin', 'staff', 'customer')
    and (
      actor_id is null
      or actor_id = (
        select u.id
        from public.og_portal_users u
        where u.auth_user_id = (select auth.uid())
        limit 1
      )
    )
  );

comment on policy "og_audit_logs_actor_insert" on public.og_audit_logs is
  'Portal users may append audit rows only as themselves; admins read via og_audit_logs_admin_select.';
