-- 028: Rewards (loyalty points) — Stage 1 backend.
-- ============================================================================
-- Rules (final):
--   • Earn: £1 = 1 point, floor() — whole numbers only.
--   • Redeem ladder (redeeming RESETS balance to 0):
--       75  = free drink
--       150 = free meal
--       250 = free dessert
--       500 = prize draw entry  (AUTOMATIC — see rewards_award)
--   • Points never expire.
--   • A customer can only redeem a tier they have enough points for.
--   • At 500+ (reached by earning), the server AUTO-enters the prize draw,
--     resets the balance to 0, and logs it. The app shows the pop-up.
--
-- Security model:
--   • Customers NEVER write points. All points changes go through the
--     SECURITY DEFINER functions below, which are executable ONLY by the
--     service_role (i.e. only the server-side edge functions can call them).
--   • RLS lets customers read their own profile + transactions only.
--   • Column-level privileges stop customers updating the points columns even
--     though they can still edit their own name/phone/avatar.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Points columns on the existing profile table
-- ---------------------------------------------------------------------------
alter table public.restaurant_profiles
  add column if not exists points_balance     integer not null default 0,
  add column if not exists prize_draw_entries  integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'restaurant_profiles_points_nonneg'
  ) then
    alter table public.restaurant_profiles
      add constraint restaurant_profiles_points_nonneg
      check (points_balance >= 0 and prize_draw_entries >= 0);
  end if;
end $$;

comment on column public.restaurant_profiles.points_balance is
  'Loyalty points balance. Only ever written by the rewards_* SECURITY DEFINER functions. Always 0..499 (auto-resets at 500).';
comment on column public.restaurant_profiles.prize_draw_entries is
  'Count of prize-draw entries earned by reaching 500 points. Server-written only.';

-- ---------------------------------------------------------------------------
-- 2. Transactions (audit trail)
-- ---------------------------------------------------------------------------
create table if not exists public.rewards_transactions (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.restaurant_profiles(id) on delete cascade,
  type          text not null check (type in ('earn', 'redeem', 'prize_draw')),
  amount_spent  numeric(10,2),          -- nullable; set only for 'earn'
  points_change integer not null,        -- + for earn, - for redeem/prize_draw
  reward_label  text,                    -- nullable; e.g. 'Free meal', 'Prize draw entry'
  created_by    text,                    -- staff session id (nullable for system)
  created_at    timestamptz not null default now()
);

comment on table public.rewards_transactions is
  'Immutable audit log of every points change. Sum(points_change) per profile == points_balance.';

create index if not exists rewards_transactions_profile_idx on public.rewards_transactions(profile_id);
create index if not exists rewards_transactions_created_idx on public.rewards_transactions(created_at);
create index if not exists rewards_transactions_type_idx    on public.rewards_transactions(type);

-- ---------------------------------------------------------------------------
-- 3. RLS — customers read their own data, write nothing
-- ---------------------------------------------------------------------------
alter table public.rewards_transactions enable row level security;

drop policy if exists "rewards_transactions: own read" on public.rewards_transactions;
create policy "rewards_transactions: own read"
  on public.rewards_transactions for select
  to authenticated
  using (profile_id = (select auth.uid()));

-- Defence in depth: no client writes to the ledger (service_role bypasses RLS).
revoke insert, update, delete on public.rewards_transactions from anon, authenticated;

-- Stop customers from updating the points columns on their own profile row.
-- They keep their existing SELECT, and can still UPDATE only these columns.
revoke update on public.restaurant_profiles from anon, authenticated;
grant  update (full_name, phone, avatar_url) on public.restaurant_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Server-side points logic (SECURITY DEFINER, service_role only)
-- ---------------------------------------------------------------------------

-- Award points for a spend. floor(£) points. If the new balance reaches 500+,
-- auto-enter the prize draw and reset to 0 (overflow above 500 is dropped).
create or replace function public.rewards_award(
  p_profile_id uuid,
  p_amount     numeric,
  p_created_by text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points    integer;
  v_balance   integer;
  v_new       integer;
  v_name      text;
  v_entries   integer;
  v_triggered boolean := false;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;
  -- Sanity cap: reject absurd award amounts.
  if p_amount > 1000 then
    raise exception 'AMOUNT_TOO_LARGE';
  end if;

  v_points := floor(p_amount)::integer;

  select points_balance, full_name, prize_draw_entries
    into v_balance, v_name, v_entries
  from public.restaurant_profiles
  where id = p_profile_id
  for update;                                  -- row lock prevents double-spend

  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  v_new := v_balance + v_points;

  -- Always log the earn.
  insert into public.rewards_transactions
    (profile_id, type, amount_spent, points_change, reward_label, created_by)
  values
    (p_profile_id, 'earn', p_amount, v_points, null, p_created_by);

  if v_new >= 500 then
    -- Auto prize-draw entry + reset to 0.
    insert into public.rewards_transactions
      (profile_id, type, amount_spent, points_change, reward_label, created_by)
    values
      (p_profile_id, 'prize_draw', null, -v_new, 'Prize draw entry', p_created_by);

    update public.restaurant_profiles
      set points_balance = 0,
          prize_draw_entries = prize_draw_entries + 1
      where id = p_profile_id
      returning points_balance, prize_draw_entries into v_balance, v_entries;

    v_triggered := true;
  else
    update public.restaurant_profiles
      set points_balance = v_new
      where id = p_profile_id
      returning points_balance, prize_draw_entries into v_balance, v_entries;
  end if;

  return jsonb_build_object(
    'full_name',            v_name,
    'points_earned',        v_points,
    'points_balance',       v_balance,
    'prize_draw_triggered', v_triggered,
    'prize_draw_entries',   v_entries
  );
end;
$$;

-- Redeem a tier. Valid tiers: 75 / 150 / 250 (500 is automatic, not manual).
-- Requires balance >= tier; resets balance to 0.
create or replace function public.rewards_redeem(
  p_profile_id uuid,
  p_tier       integer,
  p_created_by text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_name    text;
  v_label   text;
begin
  v_label := case p_tier
    when 75  then 'Free drink'
    when 150 then 'Free meal'
    when 250 then 'Free dessert'
    else null
  end;

  if v_label is null then
    raise exception 'INVALID_TIER';
  end if;

  select points_balance, full_name
    into v_balance, v_name
  from public.restaurant_profiles
  where id = p_profile_id
  for update;

  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  if v_balance < p_tier then
    raise exception 'INSUFFICIENT_POINTS';
  end if;

  -- Reset to 0 regardless of overflow; label records the tier claimed.
  insert into public.rewards_transactions
    (profile_id, type, amount_spent, points_change, reward_label, created_by)
  values
    (p_profile_id, 'redeem', null, -v_balance, v_label, p_created_by);

  update public.restaurant_profiles
    set points_balance = 0
    where id = p_profile_id;

  return jsonb_build_object(
    'full_name',      v_name,
    'reward_label',   v_label,
    'tier',           p_tier,
    'points_balance', 0
  );
end;
$$;

-- Lock down execution: only the service_role (server-side edge functions) may
-- call these. Customers (anon/authenticated) cannot self-award or self-redeem.
revoke all on function public.rewards_award(uuid, numeric, text)  from public;
revoke all on function public.rewards_redeem(uuid, integer, text) from public;
grant execute on function public.rewards_award(uuid, numeric, text)  to service_role;
grant execute on function public.rewards_redeem(uuid, integer, text) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Capture phone at signup (spec: sign-up collects name, email, phone).
--    Replaces the 023 trigger function; also back-fills phone from auth
--    metadata. SECURITY DEFINER, so client column grants don't affect it.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_restaurant_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.restaurant_profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
