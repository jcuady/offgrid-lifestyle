-- Ops plan board (idempotent — table may already exist on linked project).

create table if not exists public.og_plan_cards (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'upcoming'
    check (status in ('upcoming', 'in_progress', 'done')),
  title text not null,
  label text not null default '',
  due_date date,
  notes text not null default '',
  sort_order integer not null default 0,
  created_by uuid references public.og_portal_users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint og_plan_cards_title_len_chk check (char_length(trim(title)) between 1 and 200)
);

create index if not exists og_plan_cards_status_sort_idx
  on public.og_plan_cards (status, sort_order);

drop trigger if exists og_plan_cards_updated_at on public.og_plan_cards;
create trigger og_plan_cards_updated_at
  before update on public.og_plan_cards
  for each row execute function public.og_set_updated_at();

alter table public.og_plan_cards enable row level security;

drop policy if exists og_plan_cards_portal_read on public.og_plan_cards;
create policy og_plan_cards_portal_read
  on public.og_plan_cards for select
  to authenticated
  using (public.og_portal_role() = any (array['admin'::text, 'staff'::text]));

drop policy if exists og_plan_cards_admin_insert on public.og_plan_cards;
create policy og_plan_cards_admin_insert
  on public.og_plan_cards for insert
  to authenticated
  with check (public.og_portal_role() = 'admin');

drop policy if exists og_plan_cards_admin_update on public.og_plan_cards;
create policy og_plan_cards_admin_update
  on public.og_plan_cards for update
  to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

drop policy if exists og_plan_cards_admin_delete on public.og_plan_cards;
create policy og_plan_cards_admin_delete
  on public.og_plan_cards for delete
  to authenticated
  using (public.og_portal_role() = 'admin');

comment on table public.og_plan_cards is
  'Admin/staff ops kanban: upcoming → in_progress → done.';
