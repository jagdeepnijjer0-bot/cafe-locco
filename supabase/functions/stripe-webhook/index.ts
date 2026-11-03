import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

// Email (shop order notifications; same Resend pattern as rewards-staff).
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL') ?? '';
const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM') ?? 'Cafe Locco <onboarding@resend.dev>';

// Maps Stripe subscription statuses to our DB enum
const STRIPE_STATUS_MAP: Record<string, string> = {
  active:    'active',
  trialing:  'active',
  past_due:  'past_due',
  unpaid:    'past_due',
  canceled:  'cancelled',
  incomplete: 'inactive',
  incomplete_expired: 'inactive',
  paused:    'inactive',
};

// Resolves supabase user_id from stripe_customer_id, falling back to Stripe object metadata
async function resolveUserId(
  customerId: string,
  metadataFallback?: Record<string, string> | Stripe.Metadata | null,
): Promise<string | null> {
  const { data } = await supabase
    .from('restaurant_memberships')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (data?.user_id) return data.user_id;

  // Fallback: metadata on the subscription or session set at creation time
  return metadataFallback?.supabase_user_id ?? null;
}

// Upserts the restaurant_memberships row from a Stripe Subscription object.
// Throws on DB error so the outer handler can return { warning } to Stripe.
async function syncSubscription(
  sub: Stripe.Subscription,
  overrideStatus?: string,
) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const userId = await resolveUserId(customerId, sub.metadata);
  if (!userId) {
    console.error(`[webhook] No user found for Stripe customer ${customerId}`);
    return;
  }

  const status = overrideStatus ?? STRIPE_STATUS_MAP[sub.status] ?? 'inactive';

  const { error } = await supabase.from('restaurant_memberships').upsert(
    {
      user_id:                userId,
      stripe_customer_id:     customerId,
      stripe_subscription_id: sub.id,
      status,
      plan:                   'premium',
      current_period_start:   new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end:     new Date(sub.current_period_end   * 1000).toISOString(),
      cancel_at_period_end:   sub.cancel_at_period_end,
      cancel_at:              sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
      updated_at:             new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) throw new Error(`DB upsert failed: ${error.message}`);
}

// Updates only status + updated_at by customer ID.
// Used as fallback when a subscription object cannot be retrieved from Stripe.
async function updateStatusByCustomer(customerId: string, status: string): Promise<void> {
  const userId = await resolveUserId(customerId, null);
  if (!userId) {
    console.error(`[webhook] No user found for Stripe customer ${customerId}`);
    return;
  }
  const { error } = await supabase
    .from('restaurant_memberships')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw new Error(`DB update failed: ${error.message}`);
}

// ===========================================================================
// SHOP ORDERS (kind: "shop"). Entirely separate from the subscription path
// above, which is unchanged.
// ===========================================================================
const SHOP_PRODUCT_NAME = 'Locco Coffee Beans, 250g';
const SHOP_UNIT_PRICE_PENCE = 999;
const SHOP_DELIVERY_PENCE = 375;
// Unambiguous uppercase alphabet: no 0, O, 1 or I.
const SHOP_REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

interface ShAddress {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

function makeOrderRef(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = '';
  for (let i = 0; i < 6; i++) s += SHOP_REF_ALPHABET[bytes[i] % SHOP_REF_ALPHABET.length];
  return `LOCCO-${s}`;
}

function gbp(pence: number | null | undefined): string {
  return `£${((typeof pence === 'number' ? pence : 0) / 100).toFixed(2)}`;
}

function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addressLines(name: string | null, addr: ShAddress | null): string[] {
  const out: string[] = [];
  if (name) out.push(name);
  if (addr?.line1) out.push(addr.line1);
  if (addr?.line2) out.push(addr.line2);
  const cityLine = [addr?.city, addr?.state].filter(Boolean).join(', ');
  if (cityLine) out.push(cityLine);
  if (addr?.postal_code) out.push(addr.postal_code);
  if (addr?.country) out.push(addr.country);
  return out;
}

// Shipping may live at session.shipping_details (API 2024-06-20) OR at
// session.collected_information.shipping_details (API 2026-04-22+). Both handled.
function extractShipping(
  session: Stripe.Checkout.Session,
): { name: string | null; address: ShAddress | null } {
  const s = session as unknown as {
    shipping_details?: { name?: string | null; address?: ShAddress | null } | null;
    collected_information?: { shipping_details?: { name?: string | null; address?: ShAddress | null } | null } | null;
  };
  const sd = s.shipping_details ?? s.collected_information?.shipping_details ?? null;
  return { name: sd?.name ?? null, address: sd?.address ?? null };
}

// POST one email via Resend. Returns true on 2xx. 4s timeout. Never throws.
async function sendResend(payload: Record<string, unknown>): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('[webhook] resend non-ok', res.status, txt.slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[webhook] resend error', e instanceof Error ? e.message : String(e));
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Creates a shop order from a paid Checkout Session and sends the two emails.
// Idempotent on stripe_session_id; email failures never lose the order.
async function handleShopOrder(session: Stripe.Checkout.Session): Promise<void> {
  // Idempotency: already processed this session?
  const { data: existing } = await supabase
    .from('shop_orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle();
  if (existing) {
    console.log(`[webhook] shop order for session ${session.id} already exists; skipping`);
    return;
  }

  const metaQty = Number(session.metadata?.quantity ?? '0');
  const quantity = Number.isInteger(metaQty) && metaQty >= 1 && metaQty <= 5 ? metaQty : 1;
  const totalPence = typeof session.amount_total === 'number'
    ? session.amount_total
    : SHOP_UNIT_PRICE_PENCE * quantity + SHOP_DELIVERY_PENCE;

  const cust = session.customer_details ?? null;
  const shipping = extractShipping(session);

  const row: Record<string, unknown> = {
    order_ref: makeOrderRef(),
    user_id: session.metadata?.user_id ?? null,
    stripe_session_id: session.id,
    stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    status: 'paid',
    quantity,
    unit_price_pence: SHOP_UNIT_PRICE_PENCE,
    delivery_pence: SHOP_DELIVERY_PENCE,
    total_pence: totalPence,
    currency: session.currency ?? 'gbp',
    customer_email: cust?.email ?? session.customer_email ?? null,
    customer_name: cust?.name ?? null,
    customer_phone: cust?.phone ?? null,
    shipping_name: shipping.name,
    shipping_address: shipping.address,
  };

  // Insert. Dedupe on session (Stripe retries); retry once on the extremely rare
  // order_ref collision.
  let orderId: string | null = null;
  let orderRef = String(row.order_ref);
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.from('shop_orders').insert(row).select('id, order_ref').single();
    if (!error && data) {
      orderId = data.id;
      orderRef = data.order_ref;
      break;
    }
    if (error && error.code === '23505') {
      const { data: dup } = await supabase
        .from('shop_orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle();
      if (dup) {
        console.log(`[webhook] shop order race for session ${session.id}; already created`);
        return;
      }
      row.order_ref = makeOrderRef(); // order_ref collided; try a new one
      orderRef = String(row.order_ref);
      continue;
    }
    throw new Error(`shop_orders insert failed: ${error?.message ?? 'unknown'}`);
  }
  if (!orderId) throw new Error('shop_orders insert failed after retries');

  // ----- Emails (best effort; never throw, never lose the order) -----
  const customerEmail = row.customer_email as string | null;
  const addrLines = addressLines((row.shipping_name as string | null) ?? (cust?.name ?? null), shipping.address);
  const itemTotal = SHOP_UNIT_PRICE_PENCE * quantity;

  // a. Customer confirmation
  let custSent = false;
  if (RESEND_API_KEY && customerEmail) {
    const subject = `Your Cafe Locco order ${orderRef}`;
    const textLines = [
      'Thank you for your order with Cafe Locco.',
      '',
      `Order reference: ${orderRef}`,
      '',
      `Item: ${SHOP_PRODUCT_NAME}`,
      `Quantity: ${quantity}`,
      `Item total: ${gbp(itemTotal)}`,
      `Delivery (Royal Mail Tracked 48): ${gbp(SHOP_DELIVERY_PENCE)}`,
      `Total paid: ${gbp(totalPence)}`,
      '',
      'Delivery address:',
      ...addrLines,
      '',
      'Your order will be sent by Royal Mail Tracked 48. We will send a dispatch update when it is on its way.',
      '',
      'If you need anything, reply to this email or contact info@cafelocco.co.uk.',
      '',
      'Cafe Locco, 139 Daventry Road, Coventry CV3 5HD',
    ];
    const html =
      '<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">' +
      '<h1 style="font-size:20px;margin:0 0 12px;">Thank you for your order</h1>' +
      '<p style="font-size:15px;line-height:1.5;margin:0 0 12px;">We are getting your coffee ready. Here are your order details.</p>' +
      `<p style="font-size:15px;line-height:1.5;margin:0 0 12px;"><strong>Order reference:</strong> ${escapeHtml(orderRef)}</p>` +
      '<table style="font-size:15px;line-height:1.6;border-collapse:collapse;margin:0 0 12px;">' +
      `<tr><td style="padding-right:16px;">Item</td><td>${escapeHtml(SHOP_PRODUCT_NAME)}</td></tr>` +
      `<tr><td style="padding-right:16px;">Quantity</td><td>${quantity}</td></tr>` +
      `<tr><td style="padding-right:16px;">Item total</td><td>${gbp(itemTotal)}</td></tr>` +
      `<tr><td style="padding-right:16px;">Delivery</td><td>Royal Mail Tracked 48, ${gbp(SHOP_DELIVERY_PENCE)}</td></tr>` +
      `<tr><td style="padding-right:16px;"><strong>Total paid</strong></td><td><strong>${gbp(totalPence)}</strong></td></tr>` +
      '</table>' +
      '<p style="font-size:15px;line-height:1.5;margin:0 0 4px;"><strong>Delivery address</strong></p>' +
      `<p style="font-size:15px;line-height:1.5;margin:0 0 12px;">${addrLines.map(escapeHtml).join('<br>')}</p>` +
      '<p style="font-size:15px;line-height:1.5;margin:0 0 12px;">Your order will be sent by Royal Mail Tracked 48. We will send a dispatch update when it is on its way.</p>' +
      '<p style="font-size:13px;color:#666;margin:16px 0 0;">Cafe Locco, 139 Daventry Road, Coventry CV3 5HD</p>' +
      '</div>';
    custSent = await sendResend({
      from: NOTIFY_FROM,
      to: customerEmail,
      reply_to: 'info@cafelocco.co.uk',
      subject,
      text: textLines.join('\n'),
      html,
    });
  } else if (!RESEND_API_KEY) {
    console.error('[webhook] shop customer email skipped: RESEND_API_KEY not set');
  }

  // b. Restaurant notification
  let restSent = false;
  if (RESEND_API_KEY && NOTIFY_EMAIL) {
    const when = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const subject = `Locco Shop: new order ${orderRef} (${quantity} x Locco Coffee Beans)`;
    const rLines = [
      `Order reference: ${orderRef}`,
      `Customer: ${(row.customer_name as string | null) ?? '-'}`,
      `Email: ${customerEmail ?? '-'}`,
      `Phone: ${(row.customer_phone as string | null) ?? '-'}`,
      '',
      'Delivery address:',
      ...addrLines,
      '',
      `Quantity: ${quantity} x ${SHOP_PRODUCT_NAME}`,
      `Item total: ${gbp(itemTotal)}`,
      `Delivery: ${gbp(SHOP_DELIVERY_PENCE)}`,
      `Total paid: ${gbp(totalPence)}`,
      `Stripe payment id: ${(row.stripe_payment_intent_id as string | null) ?? '-'}`,
      `Time (Europe/London): ${when}`,
    ];
    const rHtml =
      '<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px;color:#111;">' +
      `<h2 style="font-size:18px;margin:0 0 12px;">New shop order ${escapeHtml(orderRef)}</h2>` +
      rLines.map((l) => `<p style="font-size:14px;line-height:1.5;margin:0 0 4px;">${escapeHtml(l)}</p>`).join('') +
      '</div>';
    restSent = await sendResend({
      from: NOTIFY_FROM,
      to: NOTIFY_EMAIL,
      subject,
      text: rLines.join('\n'),
      html: rHtml,
    });
  } else if (!NOTIFY_EMAIL) {
    console.error('[webhook] shop restaurant email skipped: NOTIFY_EMAIL not set');
  }

  // Stamp sent timestamps (best effort).
  const stamp: Record<string, string> = {};
  if (custSent) stamp.customer_email_sent_at = new Date().toISOString();
  if (restSent) stamp.restaurant_email_sent_at = new Date().toISOString();
  if (Object.keys(stamp).length) {
    const { error: upErr } = await supabase.from('shop_orders').update(stamp).eq('id', orderId);
    if (upErr) console.error('[webhook] shop order sent-stamp update failed', upErr.message);
  }
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', (err as Error).message);
    return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── Subscription created or updated ─────────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }

      // ── Subscription fully deleted (period ended after cancellation) ─────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub, 'cancelled');
        break;
      }

      // ── Checkout session completed ───────────────────────────────────────────
      // Retrieve the subscription so we have full period/status details.
      // If the subscription ID isn't retrievable (e.g. test synthetic ID),
      // fall back to seeding a minimal active row via session metadata.
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession;

        // Shop order (mode: payment, kind: shop). Handled separately; the
        // subscription path below is exactly as before.
        if (session.mode === 'payment' && session.metadata?.kind === 'shop' && session.payment_status === 'paid') {
          try {
            await handleShopOrder(session);
          } catch (shopErr) {
            // Saving the order failed for a reason OTHER than a duplicate
            // (duplicates return normally from handleShopOrder, so they 200;
            //  email failures never throw, so they never reach here).
            // Return 500 so Stripe retries this delivery.
            console.error(`[webhook] shop order save failed for session ${session.id}:`, (shopErr as Error).message);
            return new Response(
              JSON.stringify({ error: 'shop order save failed' }),
              { status: 500, headers: { 'Content-Type': 'application/json' } },
            );
          }
          break;
        }

        if (session.mode === 'subscription' && session.subscription) {
          const subId     = session.subscription as string;
          const custId    = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
          const metaUserId = session.metadata?.supabase_user_id ?? null;

          let sub: Stripe.Subscription | null = null;
          try {
            sub = await stripe.subscriptions.retrieve(subId);
          } catch (retrieveErr) {
            console.warn(`[webhook] checkout.session.completed: subscription ${subId} not retrievable — ${(retrieveErr as Error).message}`);
          }

          if (sub) {
            // Ensure membership row exists and is linked to this customer
            if (metaUserId) {
              const subCustomer = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
              await supabase.from('restaurant_memberships').upsert(
                {
                  user_id:            metaUserId,
                  stripe_customer_id: subCustomer,
                  status:             'inactive',
                  plan:               'premium',
                },
                { onConflict: 'user_id' },
              );
            }
            await syncSubscription(sub, 'active');
          } else if (metaUserId && custId) {
            // Fallback: seed minimal active row without full subscription data
            const { error } = await supabase.from('restaurant_memberships').upsert(
              {
                user_id:                metaUserId,
                stripe_customer_id:     custId,
                stripe_subscription_id: subId,
                status:                 'active',
                plan:                   'premium',
                updated_at:             new Date().toISOString(),
              },
              { onConflict: 'user_id' },
            );
            if (error) throw new Error(`DB upsert failed: ${error.message}`);
          }
        }
        break;
      }

      // ── Payment failed (invoice) ─────────────────────────────────────────────
      // Sets status to past_due promptly without waiting for subscription.updated.
      // Falls back to customer-based update if the subscription isn't retrievable.
      case 'invoice.payment_failed': {
        const invoice  = event.data.object as Stripe.Invoice;
        const subId    = typeof invoice.subscription === 'string' ? invoice.subscription : null;
        const custId   = typeof invoice.customer    === 'string' ? invoice.customer    : null;
        if (subId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            await syncSubscription(sub, 'past_due');
          } catch {
            if (custId) await updateStatusByCustomer(custId, 'past_due');
          }
        }
        break;
      }

      // ── Payment succeeded (invoice) ──────────────────────────────────────────
      // Recovers from past_due after a successful retry.
      // Falls back to customer-based update if the subscription isn't retrievable.
      case 'invoice.paid': {
        const invoice  = event.data.object as Stripe.Invoice;
        const subId    = typeof invoice.subscription === 'string' ? invoice.subscription : null;
        const custId   = typeof invoice.customer    === 'string' ? invoice.customer    : null;
        if (subId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            if (sub.status !== 'canceled') {
              await syncSubscription(sub, 'active');
            }
          } catch {
            if (custId) await updateStatusByCustomer(custId, 'active');
          }
        }
        break;
      }

      default:
        // Unhandled event — not an error, just ignore
        break;
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, (err as Error).message);
    // Return 200 so Stripe doesn't retry — the error is internal, not a bad request
    return new Response(
      JSON.stringify({ received: true, warning: (err as Error).message }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ received: true }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
