-- Customer order progress listens for status changes on og_orders.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'og_orders'
  ) then
    alter publication supabase_realtime add table public.og_orders;
  end if;
end $$;
