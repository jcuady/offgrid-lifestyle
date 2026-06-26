-- OffGrid portal: staff provisioning + audit trail
-- Apply to a dedicated Supabase project when wiring production auth.

-- ---------------------------------------------------------------------------
-- Portal users (staff/admin profiles linked to auth.users in production)
-- ---------------------------------------------------------------------------
create table if not exists public.og_portal_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'staff', 'customer')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.og_portal_users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create index if not exists og_portal_users_role_idx on public.og_portal_users (role);
create index if not exists og_portal_users_status_idx on public.og_portal_users (status);

-- ---------------------------------------------------------------------------
-- Immutable audit log (append-only in application code)
-- ---------------------------------------------------------------------------
create table if not exists public.og_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor_id uuid references public.og_portal_users (id) on delete set null,
  actor_email text not null,
  actor_role text not null,
  target_type text not null check (target_type in ('user', 'order', 'payment', 'session')),
  target_id text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists og_audit_logs_created_at_idx on public.og_audit_logs (created_at desc);
create index if not exists og_audit_logs_action_idx on public.og_audit_logs (action);
create index if not exists og_audit_logs_actor_email_idx on public.og_audit_logs (actor_email);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.og_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists og_portal_users_updated_at on public.og_portal_users;
create trigger og_portal_users_updated_at
  before update on public.og_portal_users
  for each row execute function public.og_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — admin-only staff + audit management; staff read own row
-- ---------------------------------------------------------------------------
alter table public.og_portal_users enable row level security;
alter table public.og_audit_logs enable row level security;

-- Helper: current user's portal role from app_metadata (never user_metadata).
create or replace function public.og_portal_role()
returns text
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'portal_role'),
    'customer'
  );
$$;

-- Portal users policies
create policy "og_portal_users_admin_all"
  on public.og_portal_users
  for all
  to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

create policy "og_portal_users_staff_read_self"
  on public.og_portal_users
  for select
  to authenticated
  using (
    public.og_portal_role() = 'staff'
    and auth_user_id = auth.uid()
  );

create policy "og_portal_users_staff_update_self"
  on public.og_portal_users
  for update
  to authenticated
  using (
    public.og_portal_role() = 'staff'
    and auth_user_id = auth.uid()
  )
  with check (
    public.og_portal_role() = 'staff'
    and auth_user_id = auth.uid()
    and role = 'staff'
    and status = 'active'
  );

-- Audit logs: admin read + insert (append); no update/delete for tamper resistance
create policy "og_audit_logs_admin_select"
  on public.og_audit_logs
  for select
  to authenticated
  using (public.og_portal_role() = 'admin');

create policy "og_audit_logs_admin_insert"
  on public.og_audit_logs
  for insert
  to authenticated
  with check (public.og_portal_role() in ('admin', 'staff'));

comment on table public.og_portal_users is 'OffGrid portal identities — staff provisioned by admin.';
comment on table public.og_audit_logs is 'Append-only admin audit trail for portal operations.';
