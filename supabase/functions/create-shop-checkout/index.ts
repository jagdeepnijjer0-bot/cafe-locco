// Supabase Edge Function: create-shop-checkout
// Creates a hosted Stripe Checkout Session for the Locco Coffee Beans shop.
// Deploy with JWT verification ON (sign-in required).
//
// Price and delivery are set SERVER SIDE with inline price_data. The only thing
// read from the client is `quantity` (1 to 5); every price/amount/delivery value
// the client might send is ignored.
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server-controlled values. Never trust any price/amount/delivery from the client.
const PRODUCT_NAME = 'Locco Coffee Beans, 250g';
const UNIT_PRICE_PENCE = 999; // GBP 9.99
const DELIVERY_PENCE = 375;   // GBP 3.75 flat, Royal Mail Tracked 48
const MAX_QTY = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json().catch(() => ({}));
    const quantity = Number(body?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new Error('quantity must be an integer from 1 to 5');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          quantity,
          price_data: {
            currency: 'gbp',
            unit_amount: UNIT_PRICE_PENCE,
            product_data: { name: PRODUCT_NAME },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: ['GB'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: DELIVERY_PENCE, currency: 'gbp' },
            display_name: 'Royal Mail Tracked 48',
          },
        },
      ],
      phone_number_collection: { enabled: true },
      metadata: { kind: 'shop', user_id: user.id, quantity: String(quantity) },
      // Same deep-link pattern as the membership checkout.
      success_url: 'cafelocco://shop-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'cafelocco://shop-cancel',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // Log the message only (no secrets are included in Stripe/Supabase messages).
    console.error('[create-shop-checkout] error', err instanceof Error ? err.message : String(err));
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
