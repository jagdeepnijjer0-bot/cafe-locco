import { supabase } from './supabase';
import { ReservationInput, ContactMessageInput } from './types';

// ── Where form submissions go ────────────────────────────────────────────────
// Both forms are stored in Supabase tables:
//   • Reservations    -> public.reservations      (Supabase -> Table Editor)
//   • Contact messages -> public.contact_messages (Supabase -> Table Editor)
//
// To ALSO email them (or switch to email entirely) you only change THIS file —
// the screens call submitReservation / submitContactMessage and don't care how.
// An optional `notify-submission` edge function can email each new row to
// NOTIFY_EMAIL; see supabase/functions/notify-submission.
// ─────────────────────────────────────────────────────────────────────────────

const REFERENCE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Generate a human-friendly booking reference, e.g. "CL-W647KN". */
function makeReference(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `CL-${code}`;
}

/**
 * True when an insert failed because the `reference` column doesn't exist yet
 * (migration 027 not applied). PGRST204 = PostgREST schema-cache column-not-found;
 * 42703 = Postgres undefined_column.
 */
function isMissingReferenceColumn(error: { code?: string; message?: string }): boolean {
  const code = error.code ?? '';
  const message = (error.message ?? '').toLowerCase();
  return (
    code === 'PGRST204' ||
    code === '42703' ||
    (message.includes('reference') && message.includes('column'))
  );
}

/**
 * Store a table booking in public.reservations and return its reference.
 * The reference is generated here so the exact same value is shown to the guest,
 * persisted to the database, and included in the notification email.
 *
 * If the `reference` column isn't present yet (migration 027 not applied), the
 * booking is saved WITHOUT it so a submission never fails — the guest still sees
 * their reference, and it will persist automatically once the column is added.
 */
export async function submitReservation(input: ReservationInput): Promise<string> {
  // The form's date is DD/MM/YYYY; the DB column is a DATE (needs YYYY-MM-DD).
  const [dd, mm, yyyy] = input.date.split('/');
  const isoDate = dd && mm && yyyy ? `${yyyy}-${mm}-${dd}` : input.date;

  const reference = makeReference();

  const booking = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    date: isoDate,
    time: input.time,
    guests: input.guests,
    notes: input.notes ?? null,
  };

  const { error } = await supabase.from('reservations').insert({ reference, ...booking });

  if (error) {
    if (isMissingReferenceColumn(error)) {
      // Retry without the reference so bookings still save before migration 027.
      const { error: retryError } = await supabase.from('reservations').insert(booking);
      if (retryError) throw retryError;
      return reference;
    }
    throw error;
  }

  return reference;
}

/** Store a contact-form message in public.contact_messages. */
export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message,
  });
  if (error) throw error;
}
