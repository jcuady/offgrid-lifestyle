-- Idempotent customer email receipts (order placed + payment settled)

create table if not exists public.og_order_email_log (
  order_id text not null references public.og_orders (id) on delete cascade,
  event text not null,
  payment_status text not null default '',
  created_at timestamptz not null default now(),
  primary key (order_id, event, payment_status)
);

create index if not exists og_order_email_log_created_at_idx
  on public.og_order_email_log (created_at desc);

alter table public.og_order_email_log enable row level security;

drop policy if exists og_order_email_log_admin_read on public.og_order_email_log;
create policy og_order_email_log_admin_read
  on public.og_order_email_log
  for select
  to authenticated
  using (public.og_portal_role() = 'admin');

comment on table public.og_order_email_log is
  'Dedupes transactional emails so webhook + sync + staff confirm send once per settlement.';
