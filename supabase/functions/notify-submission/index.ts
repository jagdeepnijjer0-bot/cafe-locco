// Supabase Edge Function: notify-submission
// OPTIONAL email notifications for new reservations / contact messages.
// Wire it up as a Database Webhook (Supabase -> Database -> Webhooks) on INSERT
// for public.reservations and public.contact_messages.
//
// To switch the destination email, change ONE env var: NOTIFY_EMAIL.
//   supabase secrets set NOTIFY_EMAIL="owner@restaurant.com"
//   supabase secrets set RESEND_API_KEY="re_..."        (https://resend.com)
//   supabase secrets set NOTIFY_FROM="Cafe Locco <bookings@yourdomain.com>"
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL') ?? '';
const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM') ?? 'Cafe Locco <onboarding@resend.dev>';

serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const table: string = body.table ?? body.type ?? '';
    const r = body.record ?? {};

    if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
      // Not configured yet — submissions are still stored in the table.
      return new Response('email-not-configured', { status: 200 });
    }

    let subject = '';
    let lines: string[] = [];
    if (table === 'reservations') {
      subject = `New reservation request ${r.reference ?? ''} — ${r.name} (${r.date} ${r.time})`.trim();
      lines = [
        `Reference: ${r.reference ?? '-'}`,
        `Name:      ${r.name}`,
        `Email:     ${r.email}`,
        `Phone:     ${r.phone}`,
        `Date:      ${r.date}`,
        `Time:      ${r.time}`,
        `Guests:    ${r.guests}`,
        `Notes:     ${r.notes ?? '-'}`,
      ];
    } else if (table === 'contact_messages') {
      subject = `New contact message — ${r.name}`;
      lines = [
        `Name:    ${r.name}`,
        `Email:   ${r.email}`,
        `Phone:   ${r.phone ?? '-'}`,
        ``,
        `${r.message}`,
      ];
    } else {
      return new Response('ignored', { status: 200 });
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: NOTIFY_FROM, to: NOTIFY_EMAIL, subject, text: lines.join('\n') }),
    });

    return new Response('sent', { status: 200 });
  } catch (e) {
    // Never fail the insert because of email problems.
    return new Response(`error: ${e instanceof Error ? e.message : e}`, { status: 200 });
  }
});
