create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null,
  slug text not null unique,
  sort_order integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name_bn text not null,
  slug text not null unique,
  image_url text not null,
  origin_bn text not null,
  sell_type text not null check (sell_type in ('piece', 'kg', 'gram')),
  price numeric(10,2) not null default 0,
  stock_quantity numeric(10,2) not null default 0,
  quantity_step numeric(10,2) not null default 1,
  minimum_quantity numeric(10,2) not null default 1,
  is_available boolean not null default true,
  available_today boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id integer primary key default 1,
  delivery_notice_bn text not null,
  delivery_radius_km numeric(10,2) not null default 6,
  base_delivery_charge numeric(10,2) not null default 40,
  per_km_delivery_charge numeric(10,2) not null default 10,
  bkash_number text not null,
  delivery_start_time_time time not null default '14:00:00',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  phone text not null,
  address_bn text not null,
  area text not null,
  area_name_bn text not null,
  payment_method text not null check (payment_method in ('cod', 'bkash')),
  bkash_transaction_id text,
  subtotal numeric(10,2) not null default 0,
  delivery_charge numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  delivery_date timestamptz not null,
  delivery_type text not null check (delivery_type in ('same_day', 'next_day')),
  status text not null default 'pending'
    check (status in ('pending', 'hold', 'out_for_delivery', 'delivered', 'cancelled')),
  status_message_bn text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_bn text not null,
  sell_type text not null check (sell_type in ('piece', 'kg', 'gram')),
  unit_price numeric(10,2) not null default 0,
  quantity numeric(10,2) not null default 1,
  line_total numeric(10,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'admin',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row
execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_profiles enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
on public.categories for select
using (true);

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read products" on public.products;
create policy "public read products"
on public.products for select
using (true);

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings"
on public.site_settings for select
using (true);

drop policy if exists "admin manage settings" on public.site_settings;
create policy "admin manage settings"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders"
on public.orders for select
using (public.is_admin());

drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin read order items" on public.order_items;
create policy "admin read order items"
on public.order_items for select
using (public.is_admin());

drop policy if exists "admin read own profile" on public.admin_profiles;
create policy "admin read own profile"
on public.admin_profiles for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "admin manage profiles" on public.admin_profiles;
create policy "admin manage profiles"
on public.admin_profiles for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.place_order(order_payload jsonb)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  created_order public.orders;
  item jsonb;
begin
  insert into public.orders (
    order_code,
    customer_name,
    phone,
    address_bn,
    area,
    area_name_bn,
    payment_method,
    bkash_transaction_id,
    subtotal,
    delivery_charge,
    total_amount,
    delivery_date,
    delivery_type,
    status,
    status_message_bn
  )
  values (
    upper(coalesce(order_payload->>'order_code', 'AR-' || right(extract(epoch from now())::text, 8))),
    order_payload->>'customer_name',
    order_payload->>'phone',
    order_payload->>'address_bn',
    order_payload->>'area',
    order_payload->>'area_name_bn',
    order_payload->>'payment_method',
    nullif(order_payload->>'bkash_transaction_id', ''),
    coalesce((order_payload->>'subtotal')::numeric, 0),
    coalesce((order_payload->>'delivery_charge')::numeric, 0),
    coalesce((order_payload->>'total_amount')::numeric, 0),
    (order_payload->>'delivery_date')::timestamptz,
    order_payload->>'delivery_type',
    coalesce(order_payload->>'status', 'pending'),
    order_payload->>'status_message_bn'
  )
  returning * into created_order;

  for item in select * from jsonb_array_elements(coalesce(order_payload->'items', '[]'::jsonb))
  loop
    insert into public.order_items (
      order_id,
      product_id,
      product_name_bn,
      sell_type,
      unit_price,
      quantity,
      line_total
    )
    values (
      created_order.id,
      nullif(item->>'product_id', '')::uuid,
      item->>'product_name_bn',
      item->>'sell_type',
      coalesce((item->>'unit_price')::numeric, 0),
      coalesce((item->>'quantity')::numeric, 0),
      coalesce((item->>'line_total')::numeric, 0)
    );
  end loop;

  return created_order;
end;
$$;

create or replace function public.track_order(order_code_input text, phone_input text)
returns table (
  id uuid,
  order_code text,
  customer_name text,
  phone text,
  address_bn text,
  area text,
  area_name_bn text,
  payment_method text,
  subtotal numeric,
  delivery_charge numeric,
  total_amount numeric,
  delivery_date timestamptz,
  delivery_type text,
  status text,
  status_message_bn text,
  created_at timestamptz,
  order_items jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    o.id,
    o.order_code,
    o.customer_name,
    o.phone,
    o.address_bn,
    o.area,
    o.area_name_bn,
    o.payment_method,
    o.subtotal,
    o.delivery_charge,
    o.total_amount,
    o.delivery_date,
    o.delivery_type,
    o.status,
    o.status_message_bn,
    o.created_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', oi.id,
          'product_name_bn', oi.product_name_bn,
          'sell_type', oi.sell_type,
          'unit_price', oi.unit_price,
          'quantity', oi.quantity,
          'line_total', oi.line_total
        )
      ) filter (where oi.id is not null),
      '[]'::jsonb
    ) as order_items
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  where o.order_code = upper(order_code_input)
    and o.phone = phone_input
  group by o.id;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;

insert into public.categories (id, name_bn, slug, sort_order, is_active)
values
  ('00000000-0000-0000-0000-000000000101', 'সবজি', 'sobji', 1, true),
  ('00000000-0000-0000-0000-000000000102', 'ফল', 'fol', 2, true),
  ('00000000-0000-0000-0000-000000000103', 'ভবিষ্যতে গ্রোসারি', 'grocery', 3, true)
on conflict (id) do update
set
  name_bn = excluded.name_bn,
  slug = excluded.slug,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.site_settings (
  id,
  delivery_notice_bn,
  delivery_radius_km,
  base_delivery_charge,
  per_km_delivery_charge,
  bkash_number,
  delivery_start_time_time
)
values (
  1,
  'আজ দুপুর ২টার আগে অর্ডার করলে আজই ডেলিভারি, এরপরের অর্ডার যাবে পরের দিনের স্লটে।',
  6,
  40,
  10,
  '01711-223344',
  '14:00:00'
)
on conflict (id) do update
set
  delivery_notice_bn = excluded.delivery_notice_bn,
  delivery_radius_km = excluded.delivery_radius_km,
  base_delivery_charge = excluded.base_delivery_charge,
  per_km_delivery_charge = excluded.per_km_delivery_charge,
  bkash_number = excluded.bkash_number,
  delivery_start_time_time = excluded.delivery_start_time_time;

insert into public.products (
  id,
  category_id,
  name_bn,
  slug,
  image_url,
  origin_bn,
  sell_type,
  price,
  stock_quantity,
  quantity_step,
  minimum_quantity,
  is_available,
  available_today
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    'দেশি টমেটো',
    'deshi-tomato',
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80',
    'বগুড়া',
    'kg',
    95,
    42,
    0.5,
    0.5,
    true,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000101',
    'ফুলকপি',
    'fulkopi',
    'https://images.unsplash.com/photo-1615485291234-9fbc14a99691?auto=format&fit=crop&w=900&q=80',
    'যশোর',
    'piece',
    55,
    24,
    1,
    1,
    true,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000101',
    'গাজর',
    'gajor',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80',
    'রংপুর',
    'gram',
    28,
    8000,
    250,
    250,
    true,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    '00000000-0000-0000-0000-000000000102',
    'কলা (সাগর)',
    'kola-sagor',
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',
    'নরসিংদী',
    'piece',
    12,
    50,
    1,
    2,
    true,
    true
  )
on conflict (id) do update
set
  category_id = excluded.category_id,
  name_bn = excluded.name_bn,
  slug = excluded.slug,
  image_url = excluded.image_url,
  origin_bn = excluded.origin_bn,
  sell_type = excluded.sell_type,
  price = excluded.price,
  stock_quantity = excluded.stock_quantity,
  quantity_step = excluded.quantity_step,
  minimum_quantity = excluded.minimum_quantity,
  is_available = excluded.is_available,
  available_today = excluded.available_today;
