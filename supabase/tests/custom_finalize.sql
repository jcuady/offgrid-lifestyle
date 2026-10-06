-- Rolled-back check for og_finalize_custom_order. Expected result: error "ALL_PASS passed=8".
DO $$
DECLARE f text[] := '{}'; p jsonb; ok int := 0;
BEGIN
  insert into og_orders(id,order_type,status,customer_name,customer_email,customer_phone,subtotal_centavos,shipping_centavos,tax_centavos,total_centavos,custom_payload)
   values ('CO-2026-T911','custom','pending_deposit','T Guest','guest911@example.com','0917',0,0,0,0,'{"officialTotal":5000,"note":"orig"}'::jsonb),
          ('CO-2026-T912','custom','pending_deposit','T Closed','closed912@example.com','0917',0,0,0,0,'{}'::jsonb);
  update og_orders set status='delivered' where id='CO-2026-T912';
  set local role anon;
  perform set_config('request.jwt.claims','{"role":"anon"}',true);
  perform og_finalize_custom_order('CO-2026-T911','Guest911@Example.com','{"designFiles":[{"name":"a.png"}],"officialTotal":1,"quotedBy":"x","quoteInternalNotes":"hack"}'::jsonb);
  reset role;
  select custom_payload into p from og_orders where id='CO-2026-T911';
  if p->'designFiles'->0->>'name' = 'a.png' then ok := ok+1; else f := f || 'F1 files not saved'::text; end if;
  if (p->>'officialTotal')::int = 5000 then ok := ok+1; else f := f || 'F2 forged total kept'::text; end if;
  if p ? 'quotedBy' or p ? 'quoteInternalNotes' then f := f || 'F3 forged fields kept'::text; else ok := ok+1; end if;
  set local role anon; perform set_config('request.jwt.claims','{"role":"anon"}',true);
  begin perform og_finalize_custom_order('CO-2026-T911','other@example.com','{}'::jsonb); f := f || 'F4 wrong email allowed'::text;
  exception when others then if sqlerrm like 'Order not found%' then ok := ok+1; else f := f || ('F4 '||sqlerrm); end if; end;
  begin perform og_finalize_custom_order('CO-2026-T911','','{}'::jsonb); f := f || 'F5 empty email allowed'::text;
  exception when others then ok := ok+1; end;
  begin perform og_finalize_custom_order('CO-2026-T912','closed912@example.com','{}'::jsonb); f := f || 'F6 delivered order patched'::text;
  exception when others then ok := ok+1; end;
  begin perform og_finalize_custom_order('PRE-2026-0000','a@b.com','{}'::jsonb); f := f || 'F7 nonexistent ok'::text;
  exception when others then ok := ok+1; end;
  begin perform og_finalize_custom_order('CO-2026-T911','guest911@example.com','[1]'::jsonb); f := f || 'F8 array accepted'::text;
  exception when others then if sqlerrm = 'Invalid payload' then ok := ok+1; else f := f || ('F8 '||sqlerrm); end if; end;
  reset role;
  if array_length(f,1) > 0 then raise exception 'FAILURES: % [passed=%]', array_to_string(f,'; '), ok; end if;
  raise exception 'ALL_PASS passed=%', ok;
END $$;
