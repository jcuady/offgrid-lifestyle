-- Public event signups for community events (og_events).
-- Anon/authenticated insert; admin/staff read. Optional counter bump on insert.

create table if not exists public.og_event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.og_events (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  skill_level text not null default 'beginner'
    check (skill_level in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz not null default now(),
  constraint og_event_registrations_name_len_chk check (char_length(trim(name)) between 2 and 120),
  constraint og_event_registrations_email_len_chk check (char_length(trim(email)) between 3 and 254)
);

create index if not exists og_event_registrations_event_created_idx
  on public.og_event_registrations (event_id, created_at desc);

create unique index if not exists og_event_registrations_event_email_uidx
  on public.og_event_registrations (event_id, lower(email));

alter table public.og_event_registrations enable row level security;

drop policy if exists og_event_registrations_public_insert on public.og_event_registrations;
create policy og_event_registrations_public_insert
  on public.og_event_registrations for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.og_events e
      where e.id = event_id
        and e.status = 'upcoming'
    )
  );

drop policy if exists og_event_registrations_portal_read on public.og_event_registrations;
create policy og_event_registrations_portal_read
  on public.og_event_registrations for select
  to authenticated
  using (public.og_portal_role() = any (array['admin'::text, 'staff'::text]));

drop policy if exists og_event_registrations_admin_delete on public.og_event_registrations;
create policy og_event_registrations_admin_delete
  on public.og_event_registrations for delete
  to authenticated
  using (public.og_portal_role() = 'admin');

comment on table public.og_event_registrations is
  'Public community event signups. One registration per email per event.';

-- Keep denormalized registered count in sync for storefront display.
create or replace function public.og_bump_event_registered()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.og_events
     set registered = coalesce(registered, 0) + 1,
         updated_at = now()
   where id = new.event_id;
  return new;
end;
$$;

drop trigger if exists og_event_registrations_bump on public.og_event_registrations;
create trigger og_event_registrations_bump
  after insert on public.og_event_registrations
  for each row execute function public.og_bump_event_registered();

revoke all on function public.og_bump_event_registered() from public;
