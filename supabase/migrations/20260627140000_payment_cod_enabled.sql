-- Add COD toggle to payment settings (pairs with paymongo_enabled)
alter table public.og_payment_settings
  add column if not exists cod_enabled boolean not null default false;

alter table public.og_payment_settings
  add column if not exists cod_checkout_description text not null default 'Pay the courier when your order arrives. Available in select service areas.';

comment on column public.og_payment_settings.cod_enabled is 'When true, retail checkout allows cash on delivery.';
