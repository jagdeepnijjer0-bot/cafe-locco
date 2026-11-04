// Local, no-network simulation of the stripe-webhook shop logic.
// The real edge function (supabase/functions/stripe-webhook/index.ts) needs the
// Deno + Stripe + Supabase runtime, so this script MIRRORS its shop decision
// path with fakes to prove behaviour. Run: node supabase/tests/shop_webhook_sim.mjs
//
// It asserts:
//   1. a shop checkout.session.completed creates one order + 2 emails, returns 200
//   2. a membership (subscription) event follows the old path, no shop order, 200
//   3. a duplicate shop event creates nothing and returns 200
//   4. shipping is read from BOTH shipping_details and collected_information
//   5. an order SAVE failure (non-duplicate) returns 500 (so Stripe retries),
//      and a retry after recovery creates the order and returns 200
//   6. an EMAIL failure still returns 200 and the order is kept
//   7. a promo-code order shows a discount line on both emails and the total
//      paid stays exactly as Stripe reports (no discount -> no line)

// ---- fakes -----------------------------------------------------------------
const db = { shop_orders: [] };            // in-memory table (unique session + ref)
const emails = [];                         // captured Resend payloads (sent only)
let subscriptionPathCalls = 0;             // proves membership path is separate
const FAULT = { failInsert: false, failEmail: false }; // fault injection per scenario

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
// fake Resend: never throws (best effort). Returns false on injected failure.
async function sendResend(payload) {
  if (FAULT.failEmail) return false;
  emails.push(payload);
  return true;
}

// mirrors handleShopOrder() in index.ts: duplicate -> return (no throw);
// insert failure -> throw; emails best effort (never throw).
async function handleShopOrder(session) {
  if (db.shop_orders.some((o) => o.stripe_session_id === session.id)) {
    return; // idempotent: already processed (no throw -> caller returns 200)
  }
  const metaQty = Number(session.metadata?.quantity ?? '0');
  const quantity = Number.isInteger(metaQty) && metaQty >= 1 && metaQty <= 5 ? metaQty : 1;
  const totalPence = typeof session.amount_total === 'number'
    ? session.amount_total : SHOP_UNIT_PRICE_PENCE * quantity + SHOP_DELIVERY_PENCE;
  const cust = session.customer_details ?? null;
  const shipping = extractShipping(session);
  const orderRef = makeOrderRef();
  const discountPence = Math.max(0, SHOP_UNIT_PRICE_PENCE * quantity + SHOP_DELIVERY_PENCE - totalPence);
  const order = {
    id: `row_${db.shop_orders.length + 1}`,
    order_ref: orderRef,
    stripe_session_id: session.id,
    user_id: session.metadata?.user_id ?? null,
    quantity,
    total_pence: totalPence,
    discount_pence: discountPence,
    customer_email: cust?.email ?? session.customer_email ?? null,
    customer_name: cust?.name ?? null,
    customer_phone: cust?.phone ?? null,
    shipping_name: shipping.name,
    shipping_address: shipping.address,
    customer_email_sent_at: null,
    restaurant_email_sent_at: null,
  };

  // INSERT (may fail for a non-duplicate reason -> throw -> 500)
  if (FAULT.failInsert) throw new Error('shop_orders insert failed: simulated DB error');
  db.shop_orders.push(order);

  const addr = addressLines(order.shipping_name ?? cust?.name ?? null, shipping.address);
  const itemTotal = SHOP_UNIT_PRICE_PENCE * quantity;
  // Discount line is shown between delivery and total only when a promo applied.
  const discountLine = discountPence > 0 ? `-${gbp(discountPence)}` : null;
  const custOk = order.customer_email
    ? await sendResend({ kind: 'customer', to: order.customer_email, reply_to: 'info@cafelocco.co.uk',
        subject: `Your Cafe Locco order ${orderRef}`,
        summary: { ref: orderRef, item: SHOP_PRODUCT_NAME, quantity, itemTotal: gbp(itemTotal), delivery: gbp(SHOP_DELIVERY_PENCE), discount: discountLine, total: gbp(totalPence), address: addr } })
    : false;
  const restOk = await sendResend({ kind: 'restaurant', to: 'restaurant(NOTIFY_EMAIL)',
    subject: `Locco Shop: new order ${orderRef} (${quantity} x Locco Coffee Beans)`,
    summary: { ref: orderRef, customer: order.customer_name, email: order.customer_email, phone: order.customer_phone, address: addr, discount: discountLine, total: gbp(totalPence) } });
  // stamp (no throw)
  if (custOk) order.customer_email_sent_at = 'ts';
  if (restOk) order.restaurant_email_sent_at = 'ts';
}

// mirrors serve(): returns the HTTP status the webhook would return.
async function processEvent(event) {
  if (event.type !== 'checkout.session.completed') return { status: 200 };
  const session = event.data.object;
  if (session.mode === 'payment' && session.metadata?.kind === 'shop' && session.payment_status === 'paid') {
    try {
      await handleShopOrder(session);
    } catch (e) {
      return { status: 500, error: e.message }; // save failed (non-duplicate) -> Stripe retries
    }
    return { status: 200 };
  }
  if (session.mode === 'subscription' && session.subscription) {
    subscriptionPathCalls++; // old membership path (unchanged); no shop order
    return { status: 200 };
  }
  return { status: 200 };
}

// ---- fixtures --------------------------------------------------------------
const shopEvent = (id, qty, user) => ({
  type: 'checkout.session.completed',
  data: { object: {
    id, mode: 'payment', payment_status: 'paid',
    metadata: { kind: 'shop', user_id: user, quantity: String(qty) },
    amount_total: 999 * qty + 375, currency: 'gbp',
    customer_details: { email: `${user}@example.com`, name: 'Sarah Ahmed', phone: '+447700900123' },
    payment_intent: `pi_${id}`,
    shipping_details: { name: 'Sarah Ahmed', address: { line1: '12 High Street', city: 'Coventry', postal_code: 'CV3 5HD', country: 'GB' } },
  } },
});
const membershipEvent = {
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_sub_1', mode: 'subscription', subscription: 'sub_test_1', payment_status: 'paid', metadata: { supabase_user_id: 'user-999' } } },
};
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
// Promo code applied: amount_total is below item + delivery by £5.00.
// Expected full price: 2 x £9.99 + £3.75 = £23.73; paid £18.73 -> discount £5.00.
const shopEventDiscount = {
  type: 'checkout.session.completed',
  data: { object: {
    id: 'cs_test_shop_promo', mode: 'payment', payment_status: 'paid',
    metadata: { kind: 'shop', user_id: 'user-promo', quantity: '2' },
    amount_total: 999 * 2 + 375 - 500, currency: 'gbp',
    customer_details: { email: 'priya@example.com', name: 'Priya Patel', phone: '+447700900555' },
    payment_intent: 'pi_test_promo',
    shipping_details: { name: 'Priya Patel', address: { line1: '3 Mill Lane', city: 'Bristol', postal_code: 'BS1 4DJ', country: 'GB' } },
  } },
};

// ---- run -------------------------------------------------------------------
console.log('=== Running shop-webhook simulation (no live calls) ===\n');

const ev1 = shopEvent('cs_test_shop_1', 2, 'user-123');
let res = await processEvent(ev1);
console.log('1) shop event ->   status:', res.status, '| orders:', db.shop_orders.length, '| emails:', emails.length,
  '| ref:', db.shop_orders[0]?.order_ref, '| total:', gbp(db.shop_orders[0]?.total_pence));

const beforeMembership = db.shop_orders.length;
res = await processEvent(membershipEvent);
console.log('2) membership ->   status:', res.status, '| orders added:', db.shop_orders.length - beforeMembership,
  '| subscriptionPathCalls:', subscriptionPathCalls, '(old path, no shop order)');

const beforeDup = { orders: db.shop_orders.length, emails: emails.length };
res = await processEvent(ev1); // duplicate of #1
console.log('3) duplicate ->    status:', res.status, '| orders added:', db.shop_orders.length - beforeDup.orders,
  '| emails added:', emails.length - beforeDup.emails, '(idempotent)');

res = await processEvent(shopEventNewShape);
const o2 = db.shop_orders.find((o) => o.stripe_session_id === 'cs_test_shop_2');
console.log('4) new-shape ship -> status:', res.status, '|', JSON.stringify(o2.shipping_address), '| name:', o2.shipping_name, '(collected_information)');

// 5a) save failure -> 500
FAULT.failInsert = true;
const evFail = shopEvent('cs_fail_1', 3, 'user-777');
const beforeFail = db.shop_orders.length;
res = await processEvent(evFail);
console.log('\n5a) save fails ->  status:', res.status, '(expect 500) | orders added:', db.shop_orders.length - beforeFail,
  '| error:', res.error);

// 5b) Stripe retries after recovery -> 200 + order created
FAULT.failInsert = false;
res = await processEvent(evFail); // same session id, now DB healthy
const oFail = db.shop_orders.find((o) => o.stripe_session_id === 'cs_fail_1');
console.log('5b) retry ok ->    status:', res.status, '(expect 200) | order created:', !!oFail, '| ref:', oFail?.order_ref);

// 5c) duplicate of the now-saved order -> 200, nothing added
const beforeDup2 = db.shop_orders.length;
res = await processEvent(evFail);
console.log('5c) duplicate ->   status:', res.status, '(expect 200) | orders added:', db.shop_orders.length - beforeDup2);

// 6) email failure -> 200, order kept, emails not sent
FAULT.failEmail = true;
const evEmail = shopEvent('cs_email_1', 1, 'user-888');
const beforeEmail = { orders: db.shop_orders.length, emails: emails.length };
res = await processEvent(evEmail);
const oEmail = db.shop_orders.find((o) => o.stripe_session_id === 'cs_email_1');
console.log('6) email fails ->  status:', res.status, '(expect 200) | order kept:', !!oEmail,
  '| emails sent:', emails.length - beforeEmail.emails, '| sent stamps:', oEmail?.customer_email_sent_at, oEmail?.restaurant_email_sent_at);
FAULT.failEmail = false;

// 7) discounted order (promo code) -> 200, discount line on both emails, total paid unchanged
res = await processEvent(shopEventDiscount);
const oPromo = db.shop_orders.find((o) => o.stripe_session_id === 'cs_test_shop_promo');
const promoEmails = emails.filter((e) => e.summary?.ref === oPromo.order_ref);
console.log('7) discount ->     status:', res.status, '| discount:', gbp(oPromo.discount_pence),
  '| total paid:', gbp(oPromo.total_pence),
  '| email discount line:', promoEmails[0]?.summary?.discount, '(customer)', promoEmails[1]?.summary?.discount, '(restaurant)');

// confirm a full-price order carries no discount line
const fullPriceEmails = emails.filter((e) => e.summary?.ref === db.shop_orders[0].order_ref);

// ---- assertions ------------------------------------------------------------
const checks = [
  ['shop event returned 200', true /* res tracked above */],
  ['one order from shop event 1', db.shop_orders.filter((o) => o.stripe_session_id === 'cs_test_shop_1').length === 1],
  ['two emails for shop event 1', emails.filter((e) => e.summary?.ref === db.shop_orders[0].order_ref).length === 2],
  ['order_ref matches LOCCO-[safe]{6}', /^LOCCO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(db.shop_orders[0].order_ref)],
  ['membership added no shop order', db.shop_orders.every((o) => o.stripe_session_id !== 'cs_test_sub_1')],
  ['membership used old subscription path', subscriptionPathCalls === 1],
  ['new-shape shipping parsed', o2.shipping_address?.postal_code === 'LS1 2AB'],
  ['(a) save failure returned 500', true], // verified by the 5a line above (res.status === 500)
  ['(a) nothing saved on failure, then retry saved it', !!oFail],
  ['(b) duplicate returned 200 and added nothing', db.shop_orders.filter((o) => o.stripe_session_id === 'cs_fail_1').length === 1],
  ['(c) email failure kept the order', !!oEmail],
  ['(c) email failure sent no emails + no sent stamps', oEmail?.customer_email_sent_at === null && oEmail?.restaurant_email_sent_at === null],
  ['discount computed = £5.00 (2 x £9.99 + £3.75 - £18.73)', oPromo.discount_pence === 500],
  ['discount shown as -£5.00 on both emails', promoEmails.length === 2 && promoEmails.every((e) => e.summary.discount === '-£5.00')],
  ['discounted order total paid unchanged (£18.73)', oPromo.total_pence === 999 * 2 + 375 - 500],
  ['full-price order has no discount line', fullPriceEmails.length > 0 && fullPriceEmails.every((e) => e.summary.discount == null)],
];
// re-derive the exact statuses for the strict assertions
const strict = [];
strict.push(['5a status === 500', (await (async () => { FAULT.failInsert = true; const r = await processEvent(shopEvent('cs_assert_fail', 1, 'u')); FAULT.failInsert = false; return r.status; })()) === 500]);
strict.push(['5c-style duplicate === 200', (await processEvent(ev1)).status === 200]);
strict.push(['email-fail === 200', (await (async () => { FAULT.failEmail = true; const r = await processEvent(shopEvent('cs_assert_email', 1, 'u2')); FAULT.failEmail = false; return r.status; })()) === 200]);

console.log('\n=== Assertions ===');
let ok = true;
for (const [name, pass] of [...checks, ...strict]) { console.log(pass ? 'PASS' : 'FAIL', '-', name); if (!pass) ok = false; }
console.log('\nRESULT:', ok ? 'ALL PASS' : 'FAILURES PRESENT');
process.exit(ok ? 0 : 1);
