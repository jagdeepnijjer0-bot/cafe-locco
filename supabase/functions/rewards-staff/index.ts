// Supabase Edge Function: rewards-staff
// STAFF-facing backend for the (Stage 3) PIN-protected staff web page.
// Single endpoint routed by `action`:
//   • login  { pin }                      -> { staff_token, expires_at }
//   • lookup { staff_token, qr }          -> { full_name, points_balance, eligible_tiers }
//   • award  { staff_token, qr, amount }  -> { full_name, points_balance, points_earned, prize_draw_triggered }
//   • redeem { staff_token, qr, tier }    -> { full_name, reward_label, points_balance }
//
// Security:
//   • PIN verified server-side against REWARDS_STAFF_PIN (constant-time).
//   • Successful login returns a short-lived HMAC staff-session token.
//   • award/redeem require BOTH a valid staff token AND a valid, unexpired
//     customer QR token; they call the service_role-only RPCs so customers
//     can never self-award.
//
// Deploy WITHOUT JWT verification (staff are not Supabase users):
//     supabase functions deploy rewards-staff --no-verify-jwt
//
// Secrets required: REWARDS_STAFF_PIN, REWARDS_STAFF_SECRET, REWARDS_QR_SECRET
// Optional: REWARDS_STAFF_SESSION_SECONDS (default 43200 = 12h), REWARDS_MAX_AWARD (default 1000)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const STAFF_PIN = Deno.env.get('REWARDS_STAFF_PIN') ?? '';
const STAFF_SECRET = Deno.env.get('REWARDS_STAFF_SECRET') ?? '';
const QR_SECRET = Deno.env.get('REWARDS_QR_SECRET') ?? '';
const SESSION_TTL = Number(Deno.env.get('REWARDS_STAFF_SESSION_SECONDS') ?? '43200');
const MAX_AWARD = Number(Deno.env.get('REWARDS_MAX_AWARD') ?? '1000');
const REDEEM_TIERS = [75, 150, 250];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// --- helpers ---------------------------------------------------------------
function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmacKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usages,
  );
}
async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
  return `${body}.${b64url(sig)}`;
}
// Returns the decoded payload if the signature is valid and not expired, else null.
async function verifyToken(token: string, secret: string): Promise<Record<string, unknown> | null> {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let key: CryptoKey;
  try { key = await hmacKey(secret, ['verify']); } catch { return null; }
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(sig), new TextEncoder().encode(body));
  } catch { return null; }
  if (!ok) return null;
  let obj: Record<string, unknown>;
  try { obj = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))); } catch { return null; }
  const exp = obj.exp;
  if (typeof exp !== 'number' || Math.floor(Date.now() / 1000) > exp) return null;
  return obj;
}
function constantTimeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let r = 0;
  for (let i = 0; i < ea.length; i++) r |= ea[i] ^ eb[i];
  return r === 0;
}
function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function requireStaff(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const staff = await verifyToken(String(body.staff_token ?? ''), STAFF_SECRET);
  if (!staff || staff.role !== 'staff') throw new Error('STAFF_SESSION_INVALID');
  return staff;
}
async function requireQrProfile(body: Record<string, unknown>): Promise<string> {
  const qr = await verifyToken(String(body.qr ?? ''), QR_SECRET);
  if (!qr || typeof qr.pid !== 'string') throw new Error('QR_INVALID_OR_EXPIRED');
  return qr.pid;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (!STAFF_PIN || !STAFF_SECRET || !QR_SECRET) throw new Error('Server not configured');
    if (req.method !== 'POST') throw new Error('Method not allowed');

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? '');

    // ---- login: verify PIN, issue a short staff session token --------------
    if (action === 'login') {
      if (!constantTimeEqual(String(body.pin ?? ''), STAFF_PIN)) {
        return json({ error: 'INVALID_PIN' }, 401);
      }
      const now = Math.floor(Date.now() / 1000);
      const exp = now + SESSION_TTL;
      const sid = b64url(crypto.getRandomValues(new Uint8Array(9))); // audit id
      const staff_token = await signToken({ role: 'staff', sid, iat: now, exp }, STAFF_SECRET);
      return json({ staff_token, expires_at: exp });
    }

    // ---- everything else requires a valid staff session -------------------
    const staff = await requireStaff(body);
    const createdBy = `staff:${staff.sid ?? '?'}`;

    if (action === 'lookup') {
      const pid = await requireQrProfile(body);
      const { data, error } = await supabase
        .from('restaurant_profiles')
        .select('full_name, points_balance, prize_draw_entries')
        .eq('id', pid)
        .single();
      if (error || !data) throw new Error('PROFILE_NOT_FOUND');
      const eligible = REDEEM_TIERS.filter((t) => (data.points_balance ?? 0) >= t);
      return json({
        full_name: data.full_name,
        points_balance: data.points_balance,
        prize_draw_entries: data.prize_draw_entries,
        eligible_tiers: eligible,
      });
    }

    if (action === 'award') {
      const pid = await requireQrProfile(body);
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) return json({ error: 'INVALID_AMOUNT' }, 400);
      if (amount > MAX_AWARD) return json({ error: 'AMOUNT_TOO_LARGE' }, 400);
      const { data, error } = await supabase.rpc('rewards_award', {
        p_profile_id: pid, p_amount: amount, p_created_by: createdBy,
      });
      if (error) throw new Error(error.message);
      return json(data);
    }

    if (action === 'redeem') {
      const pid = await requireQrProfile(body);
      const tier = Number(body.tier);
      if (!REDEEM_TIERS.includes(tier)) return json({ error: 'INVALID_TIER' }, 400);
      const { data, error } = await supabase.rpc('rewards_redeem', {
        p_profile_id: pid, p_tier: tier, p_created_by: createdBy,
      });
      if (error) {
        // Surface the business error cleanly (e.g. INSUFFICIENT_POINTS).
        const msg = error.message?.includes('INSUFFICIENT_POINTS') ? 'INSUFFICIENT_POINTS' : error.message;
        return json({ error: msg }, 400);
      }
      return json(data);
    }

    return json({ error: 'UNKNOWN_ACTION' }, 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    const status = message === 'STAFF_SESSION_INVALID' ? 401
      : message === 'QR_INVALID_OR_EXPIRED' ? 400
      : 400;
    return json({ error: message }, status);
  }
});
