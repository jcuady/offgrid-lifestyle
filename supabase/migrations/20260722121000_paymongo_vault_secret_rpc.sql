-- Service-role Edge Functions read PayMongo secrets from Vault when env vars are unset.

create or replace function public.og_read_vault_secret(secret_name text)
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'not allowed';
  end if;
  select trim(ds.decrypted_secret) into v
  from vault.decrypted_secrets ds
  where ds.name = secret_name
  limit 1;
  return nullif(v, '');
end;
$$;

revoke all on function public.og_read_vault_secret(text) from public;
revoke all on function public.og_read_vault_secret(text) from anon, authenticated;
grant execute on function public.og_read_vault_secret(text) to service_role;
