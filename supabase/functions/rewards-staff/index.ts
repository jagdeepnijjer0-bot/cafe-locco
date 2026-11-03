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

// Email (best-effort milestone notifications; same pattern as notify-submission).
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL') ?? '';
const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM') ?? 'Cafe Locco <onboarding@resend.dev>';

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

// ---- milestone emails (best effort; never affect the award result) --------
const REWARD_PHRASE: Record<number, string> = {
  75: 'a free drink',
  150: 'a free meal',
  250: 'a free dessert',
  500: 'a prize draw entry',
};
const REWARD_HONOUR: Record<number, string> = {
  75: 'Free drink',
  150: 'Free meal',
  250: 'Free dessert',
  500: 'Prize draw entry (balance reset to 0)',
};

/** Highest milestone CROSSED by this award, or null. Uses only the data the
 *  rewards_award RPC returns: prize_draw_triggered === true means 500 was
 *  crossed (server auto-entered the draw and reset the balance); otherwise a
 *  tier counts only when the balance moves from below it to at/above it. */
function milestoneCrossed(d: Record<string, unknown>): number | null {
  if (d?.prize_draw_triggered === true) return 500;
  const earned = Number(d?.points_earned ?? 0);
  const after = Number(d?.points_balance ?? 0);
  const before = after - earned;
  for (const t of [250, 150, 75]) {
    if (before < t && t <= after) return t;
  }
  return null;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** POST one email via Resend with a ~4s timeout. Never throws. */
async function sendResend(payload: Record<string, unknown>): Promise<void> {
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
      console.error('[rewards-staff] resend non-ok', res.status, txt.slice(0, 200));
    }
  } catch (e) {
    console.error('[rewards-staff] resend error', e instanceof Error ? e.message : String(e));
  } finally {
    clearTimeout(timer);
  }
}

/** Send the customer + restaurant milestone emails. Best effort; never throws. */
async function sendMilestoneEmails(
  pid: string,
  d: Record<string, unknown>,
  milestone: number,
): Promise<void> {
  try {
    if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
      console.error('[rewards-staff] milestone email skipped: RESEND_API_KEY or NOTIFY_EMAIL not set');
      return;
    }

    const { data: prof } = await supabase
      .from('restaurant_profiles')
      .select('email, full_name, phone')
      .eq('id', pid)
      .single();

    const fullName = String((prof?.full_name ?? d.full_name ?? 'Member') || 'Member');
    const custEmail = prof?.email ? String(prof.email) : '';
    const phone = prof?.phone ? String(prof.phone) : '-';
    const balance = Number(d?.points_balance ?? 0);
    const phrase = REWARD_PHRASE[milestone];
    const honour = REWARD_HONOUR[milestone];

    // a. Customer email (to their account email).
    if (custEmail) {
      const subject = milestone === 500
        ? 'You have been entered into the Café Locco prize draw'
        : `You have reached ${milestone} points at Café Locco`;
      const heading = milestone === 500
        ? 'You have reached 500 points, so you have been entered into the Café Locco prize draw. Your points have reset to 0 so you can start earning again.'
        : `You have reached ${milestone} points, which unlocks ${phrase}.`;
      const text = [
        heading,
        '',
        `Your current balance is ${balance} points. Points never expire.`,
        'Show your QR code in the app to staff at the café to claim.',
        '',
        'Café Locco, 139 Daventry Road, Coventry CV3 5HD',
      ].join('\n');
      const html =
        `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">` +
        `<h1 style="font-size:20px;margin:0 0 12px;">Café Locco Rewards</h1>` +
        `<p style="font-size:16px;line-height:1.5;margin:0 0 12px;">${escapeHtml(heading)}</p>` +
        `<p style="font-size:16px;line-height:1.5;margin:0 0 12px;">Your current balance is <strong>${balance} points</strong>. Points never expire.</p>` +
        `<p style="font-size:16px;line-height:1.5;margin:0 0 12px;">Show your QR code in the app to staff at the café to claim.</p>` +
        `<p style="font-size:13px;color:#666;margin:16px 0 0;">Café Locco, 139 Daventry Road, Coventry CV3 5HD</p>` +
        `</div>`;
      await sendResend({ from: NOTIFY_FROM, to: custEmail, subject, text, html });
    } else {
      console.error('[rewards-staff] milestone email: no customer email on profile');
    }

    // b. Restaurant email (to NOTIFY_EMAIL).
    const when = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const rSubject = milestone === 500
      ? `Locco Rewards: ${fullName} entered the prize draw`
      : `Locco Rewards: ${fullName} reached ${milestone} points`;
    const milestoneLabel = milestone === 500 ? '500 points (prize draw entry)' : `${milestone} points`;
    const rLines = [
      `Name: ${fullName}`,
      `Email: ${custEmail || '-'}`,
      `Phone: ${phone}`,
      `Milestone: ${milestoneLabel}`,
      `Reward to honour: ${honour}`,
      `Current balance: ${balance} points`,
      `Time (Europe/London): ${when}`,
    ];
    const rHtml =
      `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:480px;color:#111;">` +
      `<h2 style="font-size:18px;margin:0 0 12px;">Locco Rewards milestone</h2>` +
      rLines.map((l) => `<p style="font-size:15px;line-height:1.5;margin:0 0 6px;">${escapeHtml(l)}</p>`).join('') +
      `</div>`;
    await sendResend({ from: NOTIFY_FROM, to: NOTIFY_EMAIL, subject: rSubject, text: rLines.join('\n'), html: rHtml });
  } catch (e) {
    console.error('[rewards-staff] milestone email error', e instanceof Error ? e.message : String(e));
  }
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

      // Best-effort milestone emails. Must never change the award result, never
      // throw, and never delay the staff response (fire-and-forget when the
      // runtime supports it).
      try {
        const awardData = (data ?? {}) as Record<string, unknown>;
        const milestone = milestoneCrossed(awardData);
        if (milestone) {
          const emailWork = sendMilestoneEmails(pid, awardData, milestone);
          const er = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
          if (er && typeof er.waitUntil === 'function') er.waitUntil(emailWork);
          else await emailWork; // emailWork never throws and each send times out at ~4s
        }
      } catch (e) {
        console.error('[rewards-staff] milestone dispatch error', e instanceof Error ? e.message : String(e));
      }

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
