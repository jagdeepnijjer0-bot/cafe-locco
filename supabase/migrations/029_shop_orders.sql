-- 029: Shop orders (Locco Coffee Beans). Backend only.
-- Rows are written ONLY by the service role (the stripe-webhook function, on a
-- paid checkout.session.completed with metadata.kind = 'shop'). Signed-in
-- customers may read their own orders. order_ref is generated in the function
-- as LOCCO-XXXXXX using an unambiguous alphabet (no 0/O/1/I).

create table if not exists public.shop_orders (
  id                        uuid primary key default gen_random_uuid(),
  order_ref                 text not null unique,          -- e.g. LOCCO-7K9ZQX
  user_id                   uuid references auth.users(id) on delete set null,
  stripe_session_id         text not null unique,          -- idempotency key
  stripe_payment_intent_id  text,
  status                    text not null default 'paid',
  quantity                  integer,
  unit_price_pence          integer,
  delivery_pence            integer,
  total_pence               integer,
  currency                  text default 'gbp',
  customer_email            text,
  customer_name             text,
  shipping_name             text,
  shipping_address          jsonb,
  customer_phone            text,
  customer_email_sent_at    timestamptz,
  restaurant_email_sent_at  timestamptz,
  created_at                timestamptz not null default now()
);

comment on table public.shop_orders is
  'Shop orders (Locco Coffee Beans). Written only by the service role via the stripe-webhook function.';

create index if not exists shop_orders_user_id_idx on public.shop_orders(user_id);
create index if not exists shop_orders_created_idx on public.shop_orders(created_at);

-- ---------------------------------------------------------------------------
-- RLS: customers read their own orders only; no client writes.
-- ---------------------------------------------------------------------------
alter table public.shop_orders enable row level security;

drop policy if exists "shop_orders: own read" on public.shop_orders;
create policy "shop_orders: own read"
  on public.shop_orders for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Only the service role (which bypasses RLS) inserts/updates. Block clients.
revoke insert, update, delete on public.shop_orders from anon, authenticated;
