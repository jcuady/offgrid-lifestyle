-- Order / payment-proof security suite.
-- Run in the Supabase SQL editor (or MCP execute_sql). It ALWAYS rolls back: the final
-- RAISE EXCEPTION carries the verdict ("ALL_PASS ..." or "FAILURES: ..."), nothing persists.
-- Requires the demo portal accounts customer@/staff@offgrid.test and product the-social-club-collection.
do $$
declare
  fails text := '';
  pass int := 0;
  n int;
  v text;
  cust_uid uuid; cust_email text; cust_pid uuid;
  staff_uid uuid; staff_email text;
  own_id text := 'PRE-2026-T001';
  guest_id text := 'PRE-2026-T002';
  ship_id text := 'RET-2026-T003';
  ship2_id text := 'PRE-2026-T004';
  pickup jsonb;
  delivery jsonb;
  lines jsonb;
begin
  select u.auth_user_id, u.email, u.id into cust_uid, cust_email, cust_pid
    from og_portal_users u where u.email = 'customer@offgrid.test';
  select u.auth_user_id, u.email into staff_uid, staff_email
    from og_portal_users u where u.email = 'staff@offgrid.test';
  if cust_uid is null or staff_uid is null then raise exception 'FIXTURE_MISSING demo accounts'; end if;

  lines := jsonb_build_array(jsonb_build_object(
    'lineItemId','line-1','productId','the-social-club-collection','name','Social Club','image','',
    'priceSnapshot', jsonb_build_object('amount',760,'currency','PHP'),'size','L','color','x','quantity',1));
  delivery := jsonb_build_object('fullName','T','email','t@x.test','phone','09170000000','address','1 Test St',
    'barangay','Brgy','city','Marikina City','province','Metro Manila','region','NCR','zip','1800');
  pickup := delivery || jsonb_build_object('fulfillmentType','pickup','pickupVenue','kado_kohi',
    'pickupVenueLabel','Kado Kohi','claimed',false);

  -- Fixtures. Owned pre-order created by the postgres role, guest pre-order created as anon (real path).
  insert into og_orders(id,order_type,status,payment_status,payment_method,payment_provider,customer_id,
    customer_email,customer_name,customer_phone,subtotal_centavos,shipping_centavos,tax_centavos,total_centavos,
    shipping_info,line_items)
  values (own_id,'retail','pending_deposit','unpaid','gcash','manual',cust_pid,cust_email,'Cust','0917',
    76000,0,0,76000,pickup,lines);

  perform set_config('request.jwt.claims','{"role":"anon"}',true);
  set local role anon;
  insert into og_orders(id,order_type,status,payment_status,payment_method,payment_provider,customer_id,
    customer_email,customer_name,customer_phone,subtotal_centavos,shipping_centavos,tax_centavos,total_centavos,
    shipping_info,line_items)
  values (guest_id,'retail','pending_deposit','unpaid','bdo','manual',null,'guest@x.test','Guest','0917',
    76000,0,0,76000,pickup,lines);
  -- H1: shipping_centavos = 0 on a delivery order must NOT waive the fee
  insert into og_orders(id,order_type,status,payment_status,payment_method,payment_provider,customer_id,
    customer_email,customer_name,customer_phone,subtotal_centavos,shipping_centavos,tax_centavos,total_centavos,
    shipping_info,line_items)
  values (ship_id,'retail','pending_deposit','unpaid','gcash','manual',null,'g2@x.test','G2','0917',
    76000,0,0,76000,delivery,lines);
  -- H2: a client-chosen PRE- id on a delivery order must NOT waive the fee
  insert into og_orders(id,order_type,status,payment_status,payment_method,payment_provider,customer_id,
    customer_email,customer_name,customer_phone,subtotal_centavos,shipping_centavos,tax_centavos,total_centavos,
    shipping_info,line_items)
  values (ship2_id,'retail','pending_deposit','unpaid','gcash','manual',null,'g3@x.test','G3','0917',
    76000,0,0,76000,delivery,lines);
  reset role;

  select shipping_centavos::text into v from og_orders where id = ship_id;
  if v = '15000' then pass := pass+1; else fails := fails || format('H1 shipping waived by shipping=0 (got %s); ', v); end if;
  select shipping_centavos::text into v from og_orders where id = ship2_id;
  if v = '15000' then pass := pass+1; else fails := fails || format('H2 shipping waived by PRE- id (got %s); ', v); end if;
  select shipping_centavos::text into v from og_orders where id = guest_id;
  if v = '0' then pass := pass+1; else fails := fails || format('H3 pickup shipping not waived (got %s); ', v); end if;

  -- Customer tampering (own order). Each must raise.
  perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub',cust_uid::text,'email',cust_email)::text, true);
  set local role authenticated;
  begin update og_orders set total_centavos = 1 where id = own_id;
    fails := fails || 'T1 customer changed total; ';
  exception when others then if sqlerrm like 'Customers may only update%' then pass := pass+1; else fails := fails || format('T guard wrong error (%s); ', sqlerrm); end if; end;
  begin update og_orders set payment_status = 'fully_paid' where id = own_id;
    fails := fails || 'T2 customer set payment_status; ';
  exception when others then if sqlerrm like 'Customers may only update%' then pass := pass+1; else fails := fails || format('T guard wrong error (%s); ', sqlerrm); end if; end;
  begin update og_orders set payment_provider_ref = 'FAKE' where id = own_id;
    fails := fails || 'T3 customer set payment ref directly; ';
  exception when others then if sqlerrm like 'Customers may only update%' then pass := pass+1; else fails := fails || format('T guard wrong error (%s); ', sqlerrm); end if; end;
  begin update og_orders set status = 'confirmed' where id = own_id;
    fails := fails || 'T4 customer set status; ';
  exception when others then if sqlerrm like 'Customers may only update%' then pass := pass+1; else fails := fails || format('T guard wrong error (%s); ', sqlerrm); end if; end;
  begin update og_orders set payment_method = 'cod' where id = own_id;
    fails := fails || 'T5 customer set payment_method directly; ';
  exception when others then if sqlerrm like 'Customers may only update%' then pass := pass+1; else fails := fails || format('T guard wrong error (%s); ', sqlerrm); end if; end;

  -- Customer storage: own folder yes, someone else's no, open UPDATE gone, payment-assets closed.
  begin insert into storage.objects(bucket_id,name,owner) values ('payment-proofs', own_id||'/own.jpg', cust_uid);
    pass := pass+1;
  exception when others then fails := fails || format('S4 customer cannot upload own proof (%s); ', sqlerrm); end;
  begin insert into storage.objects(bucket_id,name,owner) values ('payment-proofs', guest_id||'/theirs.jpg', cust_uid);
    fails := fails || 'S5 customer uploaded into another order folder; ';
  exception when others then if sqlerrm like 'new row violates row-level security%' then pass := pass+1; else fails := fails || format('S wrong error (%s); ', sqlerrm); end if; end;
  begin insert into storage.objects(bucket_id,name,owner) values ('payment-assets','qr-evil.png', cust_uid);
    fails := fails || 'S8 customer wrote payment-assets; ';
  exception when others then if sqlerrm like 'new row violates row-level security%' then pass := pass+1; else fails := fails || format('S wrong error (%s); ', sqlerrm); end if; end;
  select count(*) into n from storage.objects where bucket_id='payment-proofs' and name = own_id||'/own.jpg';
  if n = 1 then pass := pass+1; else fails := fails || 'S6a customer cannot read own proof; '; end if;
  update storage.objects set name = own_id||'/renamed.jpg' where bucket_id='payment-proofs' and name = own_id||'/own.jpg';
  get diagnostics n = row_count;
  if n = 0 then pass := pass+1; else fails := fails || 'S7 customer renamed/updated a proof object; '; end if;

  -- Customer RPC (existing, proof only) still works.
  begin perform og_submit_payment_proof(own_id, 'payment-proofs:'||own_id||'/own.jpg'); pass := pass+1;
  exception when others then fails := fails || format('T6 og_submit_payment_proof broken (%s); ', sqlerrm); end;
  reset role;

  -- Guest storage.
  perform set_config('request.jwt.claims','{"role":"anon"}',true);
  set local role anon;
  begin insert into storage.objects(bucket_id,name) values ('payment-proofs', guest_id||'/g.jpg'); pass := pass+1;
  exception when others then fails := fails || format('S1 guest cannot upload proof for own order (%s); ', sqlerrm); end;
  begin insert into storage.objects(bucket_id,name) values ('payment-proofs', 'PRE-2026-NOPE/g.jpg');
    fails := fails || 'S2 guest uploaded for nonexistent order; ';
  exception when others then if sqlerrm like 'new row violates row-level security%' then pass := pass+1; else fails := fails || format('S wrong error (%s); ', sqlerrm); end if; end;
  begin insert into storage.objects(bucket_id,name) values ('payment-proofs', own_id||'/g.jpg');
    fails := fails || 'S3 guest uploaded into a customer-owned order folder; ';
  exception when others then if sqlerrm like 'new row violates row-level security%' then pass := pass+1; else fails := fails || format('S wrong error (%s); ', sqlerrm); end if; end;
  select count(*) into n from storage.objects where bucket_id='payment-proofs';
  if n = 0 then pass := pass+1; else fails := fails || 'S6b guest can read proofs; '; end if;
  update og_orders set total_centavos = 1 where id = guest_id;
  get diagnostics n = row_count;
  if n = 0 then pass := pass+1; else fails := fails || 'T7 guest updated an order directly; '; end if;

  -- Guest payment RPC.
  begin perform og_submit_order_payment(guest_id, 'GUEST@x.test', null, 'payment-proofs:'||guest_id||'/g.jpg', ' REF-1 ');
    pass := pass+1;
  exception when others then fails := fails || format('R1 guest RPC failed (%s); ', sqlerrm); end;
  begin perform og_submit_order_payment(guest_id, 'someone@else.test', null, null, 'X');
    fails := fails || 'R2 wrong email accepted; ';
  exception when others then if sqlerrm like 'Order not found or access denied%' or sqlerrm like 'Order is closed%' then pass := pass+1; else fails := fails || format('R wrong error (%s); ', sqlerrm); end if; end;
  begin perform og_submit_order_payment(guest_id, 'guest@x.test', null, 'payment-proofs:'||own_id||'/own.jpg', null);
    fails := fails || 'R3 proof of another order accepted; ';
  exception when others then if sqlerrm like 'Invalid proof reference%' then pass := pass+1; else fails := fails || format('R wrong error (%s); ', sqlerrm); end if; end;
  begin perform og_submit_order_payment(guest_id, 'guest@x.test', 'bitcoin', null, null);
    fails := fails || 'R4 invalid payment method accepted; ';
  exception when others then if sqlerrm like 'Invalid payment method%' then pass := pass+1; else fails := fails || format('R wrong error (%s); ', sqlerrm); end if; end;
  begin perform og_submit_order_payment(guest_id, 'guest@x.test', null, 'payment-proofs:'||guest_id||'/../'||own_id||'/own.jpg', null);
    fails := fails || 'R7 path traversal accepted; ';
  exception when others then if sqlerrm like 'Invalid proof reference%' then pass := pass+1; else fails := fails || format('R wrong error (%s); ', sqlerrm); end if; end;
  begin perform og_submit_order_payment(guest_id, 'guest@x.test', 'gcash', null, null); pass := pass+1;
  exception when others then fails := fails || format('R8 guest could not switch method (%s); ', sqlerrm); end;
  reset role;

  select payment_method||'|'||coalesce(payment_proof_url,'')||'|'||coalesce(payment_provider_ref,'') into v
    from og_orders where id = guest_id;
  if v = 'gcash|payment-proofs:'||guest_id||'/g.jpg|REF-1' then pass := pass+1;
  else fails := fails || format('R1b stored values wrong (%s); ', v); end if;

  -- Owner via customer_id with a different checkout email.
  perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub',cust_uid::text,'email',cust_email)::text, true);
  set local role authenticated;
  begin perform og_submit_order_payment(own_id, 'other-checkout-email@x.test', 'bdo', null, 'OWN-REF'); pass := pass+1;
  exception when others then fails := fails || format('R5 owner RPC failed (%s); ', sqlerrm); end;
  begin perform og_submit_order_payment(guest_id, 'guest@x.test', null, null, 'steal');
    pass := pass+1; -- email match is the proof of ownership for guest orders, even when signed in
  exception when others then fails := fails || format('R5b signed-in user with the right email rejected (%s); ', sqlerrm); end;
  reset role;

  -- Staff keep full control.
  perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub',staff_uid::text,'email',staff_email)::text, true);
  set local role authenticated;
  update og_orders set payment_status='fully_paid' where id = own_id;
  get diagnostics n = row_count;
  if n = 1 then pass := pass+1; else fails := fails || 'T8a staff cannot confirm payment; '; end if;
  begin update og_orders set status='delivered' where id = own_id; pass := pass+1;
  exception when others then fails := fails || format('T8b staff cannot claim/deliver (%s); ', sqlerrm); end;
  select count(*) into n from storage.objects where bucket_id='payment-proofs';
  if n >= 2 then pass := pass+1; else fails := fails || format('S9 staff cannot read proofs (%s); ', n); end if;
  reset role;

  -- Settled/cancelled orders accept no further payment edits.
  perform set_config('request.jwt.claims','{"role":"anon"}',true);
  set local role anon;
  begin perform og_submit_order_payment(own_id, cust_email, null, null, 'late');
    fails := fails || 'R6 delivered+paid order still editable; ';
  exception when others then if sqlerrm like 'Order not found or access denied%' or sqlerrm like 'Order is closed%' then pass := pass+1; else fails := fails || format('R wrong error (%s); ', sqlerrm); end if; end;
  reset role;

  select coalesce(file_size_limit,0)::text into v from storage.buckets where id='payment-proofs';
  if v <> '0' then pass := pass+1; else fails := fails || 'S10 payment-proofs has no size limit; '; end if;

  if fails = '' then raise exception 'ALL_PASS checks=%', pass;
  else raise exception 'FAILURES(%): % [passed=%]', length(fails) - length(replace(fails,';','')), fails, pass; end if;
end $$;
