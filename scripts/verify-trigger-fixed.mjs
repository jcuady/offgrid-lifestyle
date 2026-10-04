import fs from 'node:fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const env = dotenv.parse(fs.readFileSync('.env'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const adminClient = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const orderId = 'PRE-PROBE-FIX-CHECK';

const lineItem = {
  lineItemId: 'probe-line-1',
  productId: 'the-social-club-collection',
  name: 'THE SOCIAL CLUB COLLECTION TEE — Chill Sunday',
  image: '/images/products/social-club-cover.webp',
  priceSnapshot: { amount: 760, currency: 'PHP' },
  size: 'M',
  color: 'Chill Sunday',
  quantity: 1,
  variantSku: 'OG-SOCIALCLUB-BOXY-COT-CHILLSUNDAY',
};

const shippingInfo = {
  fullName: 'Probe Test',
  email: 'probe@offgrid.test',
  phone: '+63 912 345 6789',
  address: 'Kado Kohi — Marikina Branch',
  barangay: 'Cafe Pickup Partner',
  city: 'Marikina City',
  province: 'Metro Manila',
  region: 'NCR',
  zip: '1800',
  fulfillmentType: 'pickup',
  pickupVenue: 'kado_kohi',
  pickupVenueLabel: 'Kado Kohi — Marikina Branch',
  pickupAvailableDate: 'Starting October 15, 2026',
  pickupMapsUrl: 'https://maps.app.goo.gl/ztDaXVxnnDNM2HNi9',
  claimed: false,
};

async function check() {
  const { data, error } = await supabase.from('og_orders').insert({
    id: orderId,
    order_type: 'retail',
    status: 'pending_deposit',
    payment_status: 'unpaid',
    payment_method: 'gcash',
    payment_provider: 'manual',
    customer_id: null,
    customer_email: 'probe@offgrid.test',
    customer_name: 'Probe Test',
    customer_phone: '+63 912 345 6789',
    subtotal_centavos: 76000,
    shipping_centavos: 0,
    tax_centavos: 0,
    total_centavos: 76000,
    shipping_info: shippingInfo,
    line_items: [lineItem],
  }).select();

  if (error) {
    console.log('STATUS: PENDING_UPDATE');
    console.log('Postgres error:', error.message);
  } else {
    console.log('STATUS: FIXED_AND_VERIFIED!');
    console.log('Inserted order totals:', {
      subtotal: data[0].subtotal_centavos,
      shipping: data[0].shipping_centavos,
      total: data[0].total_centavos,
    });
    // Clean up probe
    await adminClient.from('og_orders').delete().eq('id', orderId);
    await adminClient.from('og_products').update({ stock: 30 }).eq('id', 'the-social-club-collection');
  }
}

check();
