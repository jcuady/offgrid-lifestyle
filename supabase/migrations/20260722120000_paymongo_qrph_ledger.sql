-- PayMongo QR Ph: webhook idempotency + unique checkout session index

create table if not exists public.og_paymongo_webhook_events (
  event_id text primary key,
  event_type text not null,
  order_id text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

create index if not exists og_paymongo_webhook_events_order_id_idx
  on public.og_paymongo_webhook_events (order_id)
  where order_id is not null;

alter table public.og_paymongo_webhook_events enable row level security;

drop policy if exists og_paymongo_webhook_events_admin_read on public.og_paymongo_webhook_events;
create policy og_paymongo_webhook_events_admin_read
  on public.og_paymongo_webhook_events
  for select
  to authenticated
  using (public.og_portal_role() = 'admin');

create unique index if not exists og_payment_transactions_session_uidx
  on public.og_payment_transactions (provider_checkout_session_id)
  where provider_checkout_session_id is not null;

comment on table public.og_paymongo_webhook_events is 'Idempotency ledger for PayMongo webhook deliveries.';
