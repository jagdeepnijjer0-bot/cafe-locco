# Rewards — Stage 1 deploy (Supabase)

Project ref: **`adspyshcuylalvhtothn`**. Run from a machine with Supabase access
(the Claude Code sandbox cannot reach Supabase). Nothing here touches the app UI.

## 1. Apply the migration (required)
Dashboard → **SQL Editor** → paste the full contents of
`supabase/migrations/028_rewards.sql` and run. It is idempotent
(`add column if not exists`, `create table if not exists`, guarded constraint).

Or via CLI:
```bash
export SUPABASE_ACCESS_TOKEN="<token>"
supabase link --project-ref adspyshcuylalvhtothn
supabase db push
```

## 2. Set the function secrets
Generate two strong random secrets and pick a staff PIN:
```bash
export SUPABASE_ACCESS_TOKEN="<token>"
QR_SECRET=$(openssl rand -hex 32)
STAFF_SECRET=$(openssl rand -hex 32)

supabase secrets set \
  REWARDS_QR_SECRET="$QR_SECRET" \
  REWARDS_STAFF_SECRET="$STAFF_SECRET" \
  REWARDS_STAFF_PIN="<choose a 4-6 digit PIN>" \
  --project-ref adspyshcuylalvhtothn
```
Optional overrides (defaults shown): `REWARDS_QR_TTL_SECONDS=60`,
`REWARDS_STAFF_SESSION_SECONDS=43200` (12h), `REWARDS_MAX_AWARD=1000`.
(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)

## 3. Deploy the functions
```bash
# Customer QR token — keep JWT verification ON (customer must be signed in)
supabase functions deploy rewards-qr-token --project-ref adspyshcuylalvhtothn

# Staff backend — JWT verification OFF (staff are NOT Supabase users;
# auth is the PIN -> staff-session token enforced inside the function)
supabase functions deploy rewards-staff --no-verify-jwt --project-ref adspyshcuylalvhtothn

# Redeploy delete-account (now also clears rewards_transactions)
supabase functions deploy delete-account --project-ref adspyshcuylalvhtothn
```

## 4. Verify
```sql
-- columns added
select column_name from information_schema.columns
where table_name='restaurant_profiles' and column_name in ('points_balance','prize_draw_entries');

-- ledger table + RLS
select relrowsecurity from pg_class where relname='rewards_transactions';   -- expect t

-- functions locked to service_role only (no anon/authenticated execute)
select p.proname, r.rolname
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace and n.nspname='public'
left join lateral aclexplode(p.proacl) a on true
left join pg_roles r on r.oid=a.grantee
where p.proname in ('rewards_award','rewards_redeem');
```

Quick end-to-end (SQL, simulates the server path):
```sql
-- pick a test profile id, then:
select public.rewards_award('<profile-uuid>', 14.70, 'manual-test');  -- +14 pts
select public.rewards_redeem('<profile-uuid>', 75, 'manual-test');    -- needs >=75
```

## Function API (for Stage 2 app wiring + Stage 3 staff page)
- `POST /functions/v1/rewards-qr-token`  (Bearer = customer token) → `{ token, expires_at, ttl_seconds }`
- `POST /functions/v1/rewards-staff` body `{ action, ... }`:
  - `login`  `{ pin }` → `{ staff_token, expires_at }`
  - `lookup` `{ staff_token, qr }` → `{ full_name, points_balance, prize_draw_entries, eligible_tiers }`
  - `award`  `{ staff_token, qr, amount }` → `{ full_name, points_earned, points_balance, prize_draw_triggered, prize_draw_entries }`
  - `redeem` `{ staff_token, qr, tier }` → `{ full_name, reward_label, points_balance }`
