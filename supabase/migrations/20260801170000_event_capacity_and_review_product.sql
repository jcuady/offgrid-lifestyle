-- Event capacity enforcement + review must reference a product on the delivered order.

-- ---------------------------------------------------------------------------
-- Events: block inserts when capacity is reached (row lock avoids race)
-- ---------------------------------------------------------------------------
create or replace function public.og_enforce_event_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_registered integer;
  v_status text;
begin
  select e.capacity, coalesce(e.registered, 0), e.status
    into v_capacity, v_registered, v_status
  from public.og_events e
  where e.id = new.event_id
  for update;

  if v_status is distinct from 'upcoming' then
    raise exception 'Event is not open for registration';
  end if;

  if v_capacity is not null and v_registered >= v_capacity then
    raise exception 'Event is full';
  end if;

  return new;
end;
$$;

drop trigger if exists og_event_registrations_capacity on public.og_event_registrations;
create trigger og_event_registrations_capacity
  before insert on public.og_event_registrations
  for each row execute function public.og_enforce_event_capacity();

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
        and (e.capacity is null or coalesce(e.registered, 0) < e.capacity)
    )
  );

-- ---------------------------------------------------------------------------
-- Reviews: delivered order must include the reviewed product_id
-- ---------------------------------------------------------------------------
drop policy if exists og_product_reviews_authenticated_insert on public.og_product_reviews;
create policy og_product_reviews_authenticated_insert
  on public.og_product_reviews for insert to authenticated
  with check (
    exists (
      select 1 from public.og_portal_users
      where email = (select auth.jwt()) ->> 'email'
        and role = 'admin'
    )
    or (
      lower(customer_email) = lower((select auth.jwt()) ->> 'email')
      and exists (
        select 1 from public.og_orders o
        where o.id = order_id
          and o.status = 'delivered'
          and o.order_type = 'retail'
          and (
            lower(o.customer_email) = lower((select auth.jwt()) ->> 'email')
            or o.customer_id = (
              select id from public.og_portal_users
              where auth_user_id = (select auth.uid())
              limit 1
            )
          )
          and exists (
            select 1
            from jsonb_array_elements(coalesce(o.line_items, '[]'::jsonb)) as li
            where li->>'productId' = product_id
          )
      )
    )
  );
