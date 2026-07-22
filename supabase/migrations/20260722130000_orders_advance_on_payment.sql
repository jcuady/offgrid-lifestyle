-- When payment settles, advance fulfillment out of draft/pending_deposit → confirmed.
-- Covers PayMongo webhooks, client sync, and manual GCash staff confirmation.

create or replace function public.og_orders_advance_on_payment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.payment_status is not distinct from old.payment_status then
    return new;
  end if;

  if new.payment_status in ('deposit_paid', 'fully_paid')
     and old.payment_status is distinct from new.payment_status
     and new.status in ('draft', 'pending_deposit')
  then
    new.status := 'confirmed';
  end if;

  return new;
end;
$$;

drop trigger if exists og_orders_advance_on_payment on public.og_orders;
create trigger og_orders_advance_on_payment
  before update of payment_status on public.og_orders
  for each row
  execute function public.og_orders_advance_on_payment();

comment on function public.og_orders_advance_on_payment() is
  'Auto-confirm orders when payment_status becomes deposit_paid or fully_paid.';
