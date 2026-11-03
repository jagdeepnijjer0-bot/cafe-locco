// Local, no-network simulation of the stripe-webhook shop logic.
// The real edge function (supabase/functions/stripe-webhook/index.ts) needs the
// Deno + Stripe + Supabase runtime, so this script MIRRORS its shop decision
// path with fakes to prove behaviour. Run: node supabase/tests/shop_webhook_sim.mjs
//
// It asserts:
//   1. a shop checkout.session.completed creates exactly one order + 2 emails
//   2. a membership (subscription) event follows the old path, no shop order
//   3. a duplicate shop event creates nothing
//   4. shipping is read from BOTH shipping_details and collected_information

// ---- fakes -----------------------------------------------------------------
const db = { shop_orders: [] };            // in-memory table (unique session + ref)
const emails = [];                         // captured Resend payloads
let subscriptionPathCalls = 0;             // proves membership path is separate

const SHOP_UNIT_PRICE_PENCE = 999;
const SHOP_DELIVERY_PENCE = 375;
const SHOP_PRODUCT_NAME = 'Locco Coffee Beans, 250g';
const SHOP_REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function makeOrderRef() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = '';
  for (let i = 0; i < 6; i++) s += SHOP_REF_ALPHABET[bytes[i] % SHOP_REF_ALPHABET.length];
  return `LOCCO-${s}`;
}
const gbp = (p) => `£${((typeof p === 'number' ? p : 0) / 100).toFixed(2)}`;

function addressLines(name, addr) {
  const out = [];
  if (name) out.push(name);
  if (addr?.line1) out.push(addr.line1);
  if (addr?.line2) out.push(addr.line2);
  const city = [addr?.city, addr?.state].filter(Boolean).join(', ');
  if (city) out.push(city);
  if (addr?.postal_code) out.push(addr.postal_code);
  if (addr?.country) out.push(addr.country);
  return out;
}
function extractShipping(session) {
  const sd = session.shipping_details ?? session.collected_information?.shipping_details ?? null;
  return { name: sd?.name ?? null, address: sd?.address ?? null };
}
async function sendResend(payload) { emails.push(payload); return true; } // fake, always ok

// mirrors handleShopOrder() in index.ts
async function handleShopOrder(session) {
  if (db.shop_orders.some((o) => o.stripe_session_id === session.id)) {
    return; // idempotent: already processed
  }
  const metaQty = Number(session.metadata?.quantity ?? '0');
  const quantity = Number.isInteger(metaQty) && metaQty >= 1 && metaQty <= 5 ? metaQty : 1;
  const totalPence = typeof session.amount_total === 'number'
    ? session.amount_total : SHOP_UNIT_PRICE_PENCE * quantity + SHOP_DELIVERY_PENCE;
  const cust = session.customer_details ?? null;
  const shipping = extractShipping(session);
  const orderRef = makeOrderRef();
  const order = {
    id: `row_${db.shop_orders.length + 1}`,
    order_ref: orderRef,
    stripe_session_id: session.id,
    user_id: session.metadata?.user_id ?? null,
    quantity,
    unit_price_pence: SHOP_UNIT_PRICE_PENCE,
    delivery_pence: SHOP_DELIVERY_PENCE,
    total_pence: totalPence,
    customer_email: cust?.email ?? session.customer_email ?? null,
    customer_name: cust?.name ?? null,
    customer_phone: cust?.phone ?? null,
    shipping_name: shipping.name,
    shipping_address: shipping.address,
  };
  db.shop_orders.push(order);

  const addr = addressLines(order.shipping_name ?? cust?.name ?? null, shipping.address);
  const itemTotal = SHOP_UNIT_PRICE_PENCE * quantity;
  // customer email
  await sendResend({
    to: order.customer_email, reply_to: 'info@cafelocco.co.uk',
    subject: `Your Cafe Locco order ${orderRef}`,
    kind: 'customer',
    summary: { ref: orderRef, item: SHOP_PRODUCT_NAME, quantity, itemTotal: gbp(itemTotal), delivery: gbp(SHOP_DELIVERY_PENCE), total: gbp(totalPence), address: addr },
  });
  // restaurant email
  await sendResend({
    to: 'restaurant(NOTIFY_EMAIL)',
    subject: `Locco Shop: new order ${orderRef} (${quantity} x Locco Coffee Beans)`,
    kind: 'restaurant',
    summary: { ref: orderRef, customer: order.customer_name, email: order.customer_email, phone: order.customer_phone, address: addr, total: gbp(totalPence) },
  });
}

// mirrors the checkout.session.completed routing in index.ts
async function handleEvent(event) {
  if (event.type !== 'checkout.session.completed') return;
  const session = event.data.object;
  if (session.mode === 'payment' && session.metadata?.kind === 'shop' && session.payment_status === 'paid') {
    await handleShopOrder(session);
    return;
  }
  if (session.mode === 'subscription' && session.subscription) {
    subscriptionPathCalls++; // old membership path (unchanged); no shop order
  }
}

// ---- fixtures --------------------------------------------------------------
const shopEvent = {
  type: 'checkout.session.completed',
  data: { object: {
    id: 'cs_test_shop_1', mode: 'payment', payment_status: 'paid',
    metadata: { kind: 'shop', user_id: 'user-123', quantity: '2' },
    amount_total: 999 * 2 + 375, currency: 'gbp',
    customer_details: { email: 'sarah@example.com', name: 'Sarah Ahmed', phone: '+447700900123' },
    payment_intent: 'pi_test_1',
    shipping_details: { name: 'Sarah Ahmed', address: { line1: '12 High Street', line2: null, city: 'Coventry', state: null, postal_code: 'CV3 5HD', country: 'GB' } },
  } },
};
const membershipEvent = {
  type: 'checkout.session.completed',
  data: { object: {
    id: 'cs_test_sub_1', mode: 'subscription', subscription: 'sub_test_1', payment_status: 'paid',
    metadata: { supabase_user_id: 'user-999' },
  } },
};
const duplicateShopEvent = JSON.parse(JSON.stringify(shopEvent)); // same id cs_test_shop_1
// Newer API shape: shipping under collected_information.shipping_details
const shopEventNewShape = {
  type: 'checkout.session.completed',
  data: { object: {
    id: 'cs_test_shop_2', mode: 'payment', payment_status: 'paid',
    metadata: { kind: 'shop', user_id: 'user-456', quantity: '1' },
    amount_total: 999 + 375, currency: 'gbp',
    customer_details: { email: 'leo@example.com', name: 'Leo <b>Tester</b>', phone: '+447700900999' },
    payment_intent: 'pi_test_2',
    collected_information: { shipping_details: { name: 'Leo Tester', address: { line1: '9 Park Road', city: 'Leeds', postal_code: 'LS1 2AB', country: 'GB' } } },
  } },
};

// ---- run -------------------------------------------------------------------
console.log('=== Running shop-webhook simulation (no live calls) ===\n');

await handleEvent(shopEvent);
console.log('1) shop event ->   orders:', db.shop_orders.length, '| emails:', emails.length,
  '| ref:', db.shop_orders[0]?.order_ref, '| total:', gbp(db.shop_orders[0]?.total_pence));

const beforeMembership = db.shop_orders.length;
await handleEvent(membershipEvent);
console.log('2) membership ->   orders added:', db.shop_orders.length - beforeMembership,
  '| subscriptionPathCalls:', subscriptionPathCalls, '(old path taken, no shop order)');

const beforeDup = { orders: db.shop_orders.length, emails: emails.length };
await handleEvent(duplicateShopEvent);
console.log('3) duplicate ->    orders added:', db.shop_orders.length - beforeDup.orders,
  '| emails added:', emails.length - beforeDup.emails, '(idempotent, nothing created)');

await handleEvent(shopEventNewShape);
const o2 = db.shop_orders.find((o) => o.stripe_session_id === 'cs_test_shop_2');
console.log('4) new-shape ship ->', JSON.stringify(o2.shipping_address), '| name:', o2.shipping_name,
  '(read from collected_information)\n');

// ---- email previews --------------------------------------------------------
console.log('=== Customer email (order 1) ===');
const c = emails.find((e) => e.kind === 'customer');
console.log('subject:', c.subject);
console.log('reply_to:', c.reply_to);
console.log('summary:', JSON.stringify(c.summary, null, 2));
console.log('\n=== Restaurant email (order 1) ===');
const r = emails.find((e) => e.kind === 'restaurant');
console.log('subject:', r.subject);
console.log('starts with "Locco Shop:":', r.subject.startsWith('Locco Shop:'));
console.log('to:', r.to);

// ---- assertions ------------------------------------------------------------
const checks = [
  ['one order from the single shop event', db.shop_orders.filter((o) => o.stripe_session_id === 'cs_test_shop_1').length === 1],
  ['two emails built for that order', emails.filter((e) => e.summary?.ref === db.shop_orders[0].order_ref).length === 2],
  ['order_ref matches LOCCO-[safe]{6}', /^LOCCO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(db.shop_orders[0].order_ref)],
  ['membership added no shop order', db.shop_orders.every((o) => o.stripe_session_id !== 'cs_test_sub_1')],
  ['membership used the old subscription path', subscriptionPathCalls === 1],
  ['duplicate created nothing', db.shop_orders.filter((o) => o.stripe_session_id === 'cs_test_shop_1').length === 1],
  ['total = 999*2 + 375 = 2373', db.shop_orders[0].total_pence === 2373],
  ['new-shape shipping parsed', o2.shipping_address?.postal_code === 'LS1 2AB'],
];
console.log('\n=== Assertions ===');
let ok = true;
for (const [name, pass] of checks) { console.log(pass ? 'PASS' : 'FAIL', '-', name); if (!pass) ok = false; }
console.log('\nRESULT:', ok ? 'ALL PASS' : 'FAILURES PRESENT');
process.exit(ok ? 0 : 1);
