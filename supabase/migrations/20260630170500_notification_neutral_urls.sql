-- Align staff in-app notification deep links with push (neutral /portal/orders/:id redirect).

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
    select id
    from public.og_portal_users
    where role in ('admin', 'staff') and status = 'active'
  loop
    insert into public.og_notifications (user_id, title, body, url, category)
    values (r.id, v_title, v_body, '/portal/orders/' || p_order_id, 'operations');
  end loop;
end;
$$;
