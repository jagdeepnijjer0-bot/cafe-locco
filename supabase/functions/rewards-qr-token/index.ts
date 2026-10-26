// Supabase Edge Function: rewards-qr-token
// CUSTOMER-facing. Issues a short-lived, rotating token for the signed-in
// customer's loyalty QR code. The QR encodes THIS token — never the raw
// profile id — and it expires after ~60s, so a screenshot is useless.
//
// Auth: requires the customer's Supabase access token (Authorization: Bearer).
// Secret required: REWARDS_QR_SECRET (HMAC signing key).
// Optional: REWARDS_QR_TTL_SECONDS (default 60).
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const QR_SECRET = Deno.env.get('REWARDS_QR_SECRET') ?? '';
const QR_TTL = Number(Deno.env.get('REWARDS_QR_TTL_SECONDS') ?? '60');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- HMAC token helpers (compact, JWT-like: base64url(payload).base64url(sig)) --
function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function hmacKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}
async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
  return `${body}.${b64url(sig)}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!QR_SECRET) throw new Error('Server not configured');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const now = Math.floor(Date.now() / 1000);
    const exp = now + QR_TTL;
    const qr = await signToken({ pid: user.id, iat: now, exp }, QR_SECRET);

    return new Response(
      JSON.stringify({ token: qr, expires_at: exp, ttl_seconds: QR_TTL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to issue token';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
