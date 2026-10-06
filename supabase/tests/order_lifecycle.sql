-- Order lifecycle matrix: every fulfillment status x every manual payment method, plus payment overrides.
-- Always rolls back; the final RAISE carries the verdict ("ALL_PASS ..." or "FAILURES: ...").
-- Requires demo accounts admin@/staff@/customer@offgrid.test and product the-social-club-collection.
do $$
declare
  fails text := '';
  pass int := 0;
  methods text[] := array['gcash','bdo'];
  statuses text[] := array['under_review','pending_deposit','revision_requested','confirmed','in_production','shipped','delivered','cancelled'];
  pays text[] := array['unpaid','deposit_paid','fully_paid','refunded'];
  m text; s text; p text; v text; id_ text; email_ text;
  i int := 0;
  admin_uid uuid; staff_uid uuid; cust_uid uuid; cust_email text; cust_pid uuid;
  pickup jsonb; lines jsonb;
begin
  select auth_user_id into admin_uid from og_portal_users where email = 'admin@offgrid.test';
  select auth_user_id into staff_uid from og_portal_users where email = 'staff@offgrid.test';
  select auth_user_id, email, id into cust_uid, cust_email, cust_pid from og_portal_users where email = 'customer@offgrid.test';
  if admin_uid is null or staff_uid is null or cust_uid is null then raise exception 'FIXTURE_MISSING demo accounts'; end if;

  lines := jsonb_build_array(jsonb_build_object('lineItemId','line-1','productId','the-social-club-collection','name','SC','image','',
    'priceSnapshot', jsonb_build_object('amount',760,'currency','PHP'),'size','L','color','x','quantity',1));
  pickup := jsonb_build_object('fullName','T','email','t@x.test','phone','09170000000','address','1 Test St','barangay','Brgy',
    'city','Marikina City','province','Metro Manila','region','NCR','zip','1800','fulfillmentType','pickup','pickupVenue','kado_kohi',
    'pickupVenueLabel','Kado Kohi','claimed',false);

  foreach m in array methods loop
    i := i + 1;
    id_ := 'PRE-2026-L' || i || '00';
    email_ := 'matrix' || i || '@x.test';

    -- guest reserves (real anon path)
    perform set_config('request.jwt.claims','{"role":"anon"}',true);
    set local role anon;
    insert into og_orders(id,order_type,status,payment_status,payment_method,payment_provider,customer_id,customer_email,customer_name,
      customer_phone,subtotal_centavos,shipping_centavos,tax_centavos,total_centavos,shipping_info,line_items)
    values (id_,'retail','pending_deposit','unpaid',m,'manual',null,email_,'Matrix','0917',76000,0,0,76000,pickup,lines);
    reset role;

    -- every fulfillment status: staff moves it, then the guest payment step must work until the order closes
    foreach s in array statuses loop
      perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub',staff_uid::text,'email','staff@offgrid.test')::text, true);
      set local role authenticated;
      begin update og_orders set status = s where id = id_; pass := pass + 1;
      exception when others then fails := fails || format('[%s] staff -> %s failed (%s); ', m, s, sqlerrm); end;
      reset role;

      perform set_config('request.jwt.claims','{"role":"anon"}',true);
      set local role anon;
      begin
        perform og_submit_order_payment(id_, upper(email_), m, 'payment-proofs:'||id_||'/'||s||'.png', 'REF-'||s);
        if s in ('delivered','cancelled') then fails := fails || format('[%s] payment step open on %s; ', m, s);
        else pass := pass + 1; end if;
      exception when others then
        if s in ('delivered','cancelled') and sqlerrm like 'Order is closed%' then pass := pass + 1;
        else fails := fails || format('[%s] payment step on %s: %s; ', m, s, sqlerrm); end if;
      end;
      reset role;
    end loop;

    -- admin payment override across every payment status (also moves fulfillment)
    perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub',admin_uid::text,'email','admin@offgrid.test')::text, true);
    set local role authenticated;
    foreach p in array pays loop
      begin
        perform og_admin_override_order_payment(id_, p, case p when 'unpaid' then 'pending_deposit' when 'deposit_paid' then 'confirmed'
                                                              when 'fully_paid' then 'in_production' else 'cancelled' end);
        select payment_status into v from og_orders where id = id_;
        if v = p then pass := pass + 1; else fails := fails || format('[%s] override %s stored %s; ', m, p, v); end if;
      exception when others then fails := fails || format('[%s] admin override %s failed (%s); ', m, p, sqlerrm); end;
    end loop;
    reset role;

    -- paying a placed order auto-confirms it (trigger) when settled by staff
    perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub',admin_uid::text,'email','admin@offgrid.test')::text, true);
    set local role authenticated;
    perform og_admin_override_order_payment(id_, 'unpaid', 'pending_deposit');
    reset role;
    perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub',staff_uid::text,'email','staff@offgrid.test')::text, true);
    set local role authenticated;
    update og_orders set payment_status = 'fully_paid' where id = id_;
    reset role;
    select status into v from og_orders where id = id_;
    if v = 'confirmed' then pass := pass + 1; else fails := fails || format('[%s] paid order did not auto-confirm (%s); ', m, v); end if;
  end loop;

  -- customer cancel rules (unpaid + early stage only)
  insert into og_orders(id,order_type,status,payment_status,payment_method,payment_provider,customer_id,customer_email,customer_name,
    customer_phone,subtotal_centavos,shipping_centavos,tax_centavos,total_centavos,shipping_info,line_items)
  values ('PRE-2026-L901','retail','pending_deposit','unpaid','gcash','manual',cust_pid,cust_email,'Cust','0917',76000,0,0,76000,pickup,lines),
         ('PRE-2026-L902','retail','pending_deposit','unpaid','bdo','manual',cust_pid,cust_email,'Cust','0917',76000,0,0,76000,pickup,lines);
  update og_orders set payment_status = 'fully_paid', status = 'in_production' where id = 'PRE-2026-L902';
  perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub',cust_uid::text,'email',cust_email)::text, true);
  set local role authenticated;
  begin perform og_customer_cancel_order('PRE-2026-L901'); pass := pass + 1;
  exception when others then fails := fails || format('customer cancel of unpaid order failed (%s); ', sqlerrm); end;
  begin perform og_customer_cancel_order('PRE-2026-L902');
    fails := fails || 'customer cancelled a paid, in-production order; ';
  exception when others then pass := pass + 1; end;
  reset role;
  select status into v from og_orders where id = 'PRE-2026-L901';
  if v = 'cancelled' then pass := pass + 1; else fails := fails || format('cancel did not persist (%s); ', v); end if;

  if fails = '' then raise exception 'ALL_PASS checks=%', pass;
  else raise exception 'FAILURES(%): % [passed=%]', length(fails) - length(replace(fails,';','')), fails, pass; end if;
end $$;
