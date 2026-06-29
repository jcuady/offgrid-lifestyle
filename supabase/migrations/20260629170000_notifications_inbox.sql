-- In-app notification inbox (paired with Web Push via send-push edge function).

create table if not exists public.og_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.og_portal_users (id) on delete cascade,
  title text not null,
  body text not null,
  url text,
  category text not null default 'order',
  read_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists og_notifications_user_created_idx
  on public.og_notifications (user_id, created_at desc);

create index if not exists og_notifications_user_unread_idx
  on public.og_notifications (user_id)
  where read_at is null;

alter table public.og_notifications enable row level security;

create policy og_notifications_read_own
  on public.og_notifications
  for select
  to authenticated
  using (
    user_id = (select id from public.og_portal_users where auth_user_id = auth.uid() limit 1)
  );

create policy og_notifications_update_own
  on public.og_notifications
  for update
  to authenticated
  using (
    user_id = (select id from public.og_portal_users where auth_user_id = auth.uid() limit 1)
  )
  with check (
    user_id = (select id from public.og_portal_users where auth_user_id = auth.uid() limit 1)
  );

create policy og_notifications_insert_staff
  on public.og_notifications
  for insert
  to authenticated
  with check (
    public.og_portal_role() in ('admin', 'staff')
    or user_id = (select id from public.og_portal_users where auth_user_id = auth.uid() limit 1)
  );

create policy og_notifications_admin_read
  on public.og_notifications
  for select
  to authenticated
  using (public.og_portal_role() = 'admin');

comment on table public.og_notifications is 'Per-user in-app notifications (order updates, staff alerts).';

-- Staff/admin portal user ids for operational alerts.
create or replace function public.og_staff_admin_user_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.og_portal_users where role in ('admin', 'staff') and status = 'active';
$$;

grant execute on function public.og_staff_admin_user_ids() to authenticated;

-- Staff in-app alerts when orders are created or payment proof is uploaded (works for guest checkout too).
create or replace function public.og_notify_staff_for_order(
  p_order_id text,
  p_event text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_title text;
  v_body text;
  v_url text;
begin
  if p_event = 'new_retail_order' then
    v_title := 'New shop order';
    v_body := format('Retail order %s needs review in Operations.', p_order_id);
  elsif p_event = 'new_custom_order' then
    v_title := 'New custom request';
    v_body := format('Custom order %s was submitted and awaits quote review.', p_order_id);
  elsif p_event = 'payment_proof' then
    v_title := 'Payment proof uploaded';
    v_body := format('Customer uploaded payment proof for order %s.', p_order_id);
  else
    return;
  end if;

  for r in
    select id, role
    from public.og_portal_users
    where role in ('admin', 'staff') and status = 'active'
  loop
    v_url := case
      when r.role = 'admin' then '/portal/admin/orders/' || p_order_id
      else '/portal/staff/orders/' || p_order_id
    end;
    insert into public.og_notifications (user_id, title, body, url, category)
    values (r.id, v_title, v_body, v_url, 'operations');
  end loop;
end;
$$;

create or replace function public.og_orders_staff_notify_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_type = 'retail' then
    perform public.og_notify_staff_for_order(new.id, 'new_retail_order');
  elsif new.order_type = 'custom' then
    perform public.og_notify_staff_for_order(new.id, 'new_custom_order');
  end if;
  return new;
end;
$$;

create or replace function public.og_orders_staff_notify_on_proof()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.payment_proof_url is not null
     and (old.payment_proof_url is null or old.payment_proof_url is distinct from new.payment_proof_url) then
    perform public.og_notify_staff_for_order(new.id, 'payment_proof');
  end if;
  return new;
end;
$$;

drop trigger if exists og_orders_staff_notify_insert on public.og_orders;
create trigger og_orders_staff_notify_insert
  after insert on public.og_orders
  for each row
  execute function public.og_orders_staff_notify_on_insert();

drop trigger if exists og_orders_staff_notify_proof on public.og_orders;
create trigger og_orders_staff_notify_proof
  after update of payment_proof_url on public.og_orders
  for each row
  execute function public.og_orders_staff_notify_on_proof();
