# Supabase deploy — booking reference + email notifications

Project ref: **`adspyshcuylalvhtothn`**

Run these from a machine/terminal that has network access to Supabase
(the Claude Code web sandbox cannot reach Supabase, so this can't be run there).

There are two independent pieces:

1. **Migration 027** — adds `reservations.reference`. **Required** for new
   bookings to save (without it the insert fails on the unknown column).
2. **Email notifications** — deploy the `notify-submission` edge function,
   set secrets, and add Database Webhooks. Optional; only needed if you want
   booking/contact emails sent to `info@cafelocco.co.uk`.

---

## 1. Apply migration 027 (required)

### Easiest: Dashboard SQL Editor
Dashboard → **SQL Editor** → New query → paste and run:

```sql
alter table public.reservations
  add column if not exists reference text;

comment on column public.reservations.reference is
  'Human-friendly booking reference shown to the guest (e.g. CL-W647KN).';

create index if not exists reservations_reference_idx
  on public.reservations(reference);
```

It's idempotent (`if not exists`), so it's safe to run more than once.

### Alternative: Supabase CLI
```bash
export SUPABASE_ACCESS_TOKEN="<token from https://supabase.com/dashboard/account/tokens>"
supabase link --project-ref adspyshcuylalvhtothn     # prompts for the DB password
supabase db push                                     # applies pending migrations
```

### Verify
```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'reservations' and column_name = 'reference';
-- expect one row: reference
```

---

## 2. Email notifications (optional)

### 2a. Deploy the edge function
```bash
export SUPABASE_ACCESS_TOKEN="<token>"
supabase functions deploy notify-submission --project-ref adspyshcuylalvhtothn
```

### 2b. Set the secrets (destination + provider)
Sign up at https://resend.com for `RESEND_API_KEY`. Then:
```bash
supabase secrets set \
  RESEND_API_KEY="re_xxxxxxxx" \
  NOTIFY_EMAIL="info@cafelocco.co.uk" \
  NOTIFY_FROM="Cafe Locco <onboarding@resend.dev>" \
  --project-ref adspyshcuylalvhtothn
```
- `NOTIFY_EMAIL` — where notifications are sent.
- `NOTIFY_FROM` — until you verify your own domain in Resend, keep the
  `onboarding@resend.dev` sender.
- If `RESEND_API_KEY` or `NOTIFY_EMAIL` is unset the function is a safe no-op
  (returns `email-not-configured`); the row is still saved.

### 2c. Add Database Webhooks (this is what actually calls the function)
Dashboard → **Database → Webhooks → Create a new hook**, once for each table:

| Setting     | Reservations                    | Contact messages                |
|-------------|---------------------------------|---------------------------------|
| Table       | `public.reservations`           | `public.contact_messages`       |
| Events      | `INSERT`                        | `INSERT`                        |
| Type        | Supabase Edge Function          | Supabase Edge Function          |
| Function    | `notify-submission`             | `notify-submission`             |

(The function reads `body.table` + `body.record`, which is exactly the payload
a Supabase Database Webhook sends — no custom body needed.)

### Verify end-to-end
Submit a reservation from the app → a row appears in `public.reservations`
(with a `reference` like `CL-W647KN`) → an email arrives at `NOTIFY_EMAIL`
whose subject/body include that same reference.

---

## What the app already does (no action needed)
- The reference is generated once in `submitReservation()`, stored in the DB,
  returned to the success screen (which displays that exact value), and included
  in the email subject/body by `notify-submission`.
