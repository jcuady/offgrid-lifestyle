-- Web Push subscription endpoints for VAPID notifications
create table if not exists public.og_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.og_portal_users (id) on delete cascade,
  endpoint text not null unique,
  keys_p256dh text not null,
  keys_auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists og_push_subscriptions_user_id_idx on public.og_push_subscriptions (user_id);

alter table public.og_push_subscriptions enable row level security;

create policy "og_push_subscriptions_user_manage_own"
  on public.og_push_subscriptions
  for all
  to authenticated
  using (user_id = (
    select id from public.og_portal_users where auth_user_id = auth.uid() limit 1
  ))
  with check (user_id = (
    select id from public.og_portal_users where auth_user_id = auth.uid() limit 1
  ));

create policy "og_push_subscriptions_admin_read"
  on public.og_push_subscriptions
  for select
  to authenticated
  using (public.og_portal_role() = 'admin');

comment on table public.og_push_subscriptions is 'Web Push subscription endpoints for VAPID notifications.';
