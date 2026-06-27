-- OffGrid: payment settings, orders, and PayMongo transaction ledger
-- Secrets (PAYMONGO_SECRET_KEY, PAYMONGO_WEBHOOK_SECRET) live in server env only — never in this table.

-- ---------------------------------------------------------------------------
-- Global payment settings (singleton row id = 'global')
-- ---------------------------------------------------------------------------
create table if not exists public.og_payment_settings (
  id text primary key default 'global',
  gcash_qr_image_url text not null default '',
  gcash_instructions text not null default '',
  paymongo_enabled boolean not null default false,
  paymongo_mode text not null default 'test' check (paymongo_mode in ('test', 'live')),
  paymongo_public_key text,
  paymongo_checkout_description text not null default 'Pay securely with GCash, Maya, GrabPay, or card via PayMongo.',
  updated_at timestamptz not null default now()
);

insert into public.og_payment_settings (id)
values ('global')
on conflict (id) do nothing;

comment on table public.og_payment_settings is 'Singleton checkout config — GCash QR + PayMongo public settings.';
comment on column public.og_payment_settings.paymongo_public_key is 'Public key only (pk_test_* / pk_live_*). Secret key is PAYMONGO_SECRET_KEY server env.';

-- ---------------------------------------------------------------------------
-- Orders (retail shop + custom) — replaces localStorage og-portal for production
-- ---------------------------------------------------------------------------
create table if not exists public.og_orders (
  id text primary key,
  order_type text not null check (order_type in ('retail', 'custom')),
  status text not null,
  payment_status text not null default 'unpaid',
  payment_method text check (payment_method in ('cod', 'gcash', 'card', 'paymongo')),
  payment_provider text check (payment_provider in ('manual', 'paymongo')),
  payment_provider_ref text,
  customer_id uuid references public.og_portal_users (id) on delete set null,
  customer_email text,
  customer_name text,
  customer_phone text,
  subtotal_centavos bigint,
  shipping_centavos bigint not null default 0,
  tax_centavos bigint not null default 0,
  total_centavos bigint,
  currency text not null default 'PHP',
  shipping_info jsonb,
  line_items jsonb,
  custom_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists og_orders_order_type_idx on public.og_orders (order_type);
create index if not exists og_orders_payment_status_idx on public.og_orders (payment_status);
create index if not exists og_orders_customer_email_idx on public.og_orders (customer_email);
create index if not exists og_orders_created_at_idx on public.og_orders (created_at desc);

comment on column public.og_orders.payment_provider_ref is 'PayMongo checkout_session / payment_intent id, or manual reference.';
comment on column public.og_orders.line_items is 'Retail cart lines JSON array.';
comment on column public.og_orders.custom_payload is 'Custom order draft fields JSON.';

-- ---------------------------------------------------------------------------
-- PayMongo payment ledger (webhook updates this table)
-- ---------------------------------------------------------------------------
create table if not exists public.og_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.og_orders (id) on delete cascade,
  order_type text not null check (order_type in ('retail', 'custom')),
  provider text not null default 'paymongo' check (provider in ('paymongo', 'manual')),
  provider_payment_id text,
  provider_checkout_session_id text,
  amount_centavos bigint not null,
  currency text not null default 'PHP',
  status text not null default 'pending' check (
    status in (
      'pending',
      'awaiting_payment_method',
      'processing',
      'succeeded',
      'failed',
      'cancelled',
      'refunded'
    )
  ),
  payment_method text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists og_payment_transactions_order_id_idx on public.og_payment_transactions (order_id);
create index if not exists og_payment_transactions_provider_session_idx
  on public.og_payment_transactions (provider_checkout_session_id)
  where provider_checkout_session_id is not null;
create index if not exists og_payment_transactions_status_idx on public.og_payment_transactions (status);

comment on table public.og_payment_transactions is 'Payment attempts — PayMongo webhooks update status; links to og_orders.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists og_payment_settings_updated_at on public.og_payment_settings;
create trigger og_payment_settings_updated_at
  before update on public.og_payment_settings
  for each row execute function public.og_set_updated_at();

drop trigger if exists og_orders_updated_at on public.og_orders;
create trigger og_orders_updated_at
  before update on public.og_orders
  for each row execute function public.og_set_updated_at();

drop trigger if exists og_payment_transactions_updated_at on public.og_payment_transactions;
create trigger og_payment_transactions_updated_at
  before update on public.og_payment_transactions
  for each row execute function public.og_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.og_payment_settings enable row level security;
alter table public.og_orders enable row level security;
alter table public.og_payment_transactions enable row level security;

-- Payment settings: admin read/write; staff read (for ops reference)
create policy "og_payment_settings_admin_all"
  on public.og_payment_settings
  for all
  to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

create policy "og_payment_settings_staff_read"
  on public.og_payment_settings
  for select
  to authenticated
  using (public.og_portal_role() in ('admin', 'staff'));

-- Orders: admin/staff full; customers read own rows by email match (production ties to auth)
create policy "og_orders_admin_staff_all"
  on public.og_orders
  for all
  to authenticated
  using (public.og_portal_role() in ('admin', 'staff'))
  with check (public.og_portal_role() in ('admin', 'staff'));

create policy "og_orders_customer_read_own"
  on public.og_orders
  for select
  to authenticated
  using (
    public.og_portal_role() = 'customer'
    and customer_email = (auth.jwt() ->> 'email')
  );

-- Payment transactions: admin/staff only (customers see order payment_status on og_orders)
create policy "og_payment_transactions_admin_staff_all"
  on public.og_payment_transactions
  for all
  to authenticated
  using (public.og_portal_role() in ('admin', 'staff'))
  with check (public.og_portal_role() in ('admin', 'staff'));
