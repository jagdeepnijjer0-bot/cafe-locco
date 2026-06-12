# Where form submissions go

Both forms now write to your **Supabase** project.

| Form | Stored in (Supabase → Table Editor) |
|------|--------------------------------------|
| **Reservations** | `public.reservations` |
| **Contact** | `public.contact_messages` |

## To see submissions
1. Configure `app-mobile/.env` with your `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. Apply migration `supabase/migrations/023_restaurant_schema.sql` (creates both
   tables + the public-insert RLS policies).
3. Submit a reservation / message from the app.
4. Open **Supabase → Table Editor → `reservations` / `contact_messages`** — each
   submission is a new row (newest at the top by `created_at`).

## (Optional) Also get them by email
Submissions are stored regardless; to ALSO receive an email per submission:
1. Deploy `supabase/functions/notify-submission`.
2. Set secrets (this is the **one place** to change the destination address):
   ```
   supabase secrets set RESEND_API_KEY="re_..."          # https://resend.com
   supabase secrets set NOTIFY_EMAIL="you@example.com"   # <- switch to owner later
   supabase secrets set NOTIFY_FROM="Cafe Locco <bookings@yourdomain.com>"
   ```
3. Add a **Database Webhook** (Supabase → Database → Webhooks) on **INSERT** for
   `public.reservations` and `public.contact_messages`, pointing at the
   `notify-submission` function.

## Switching the destination later
- **Email recipient:** change the single `NOTIFY_EMAIL` secret.
- **Where data is stored / routing logic:** all in `app-mobile/lib/submissions.ts`
  (`submitReservation`, `submitContactMessage`) — the screens don't change.
