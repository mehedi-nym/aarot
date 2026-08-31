alter table public.products
add column if not exists offer_price numeric(10,2),
add column if not exists offer_starts_at timestamptz,
add column if not exists offer_ends_at timestamptz,
add column if not exists offer_badge_bn text,
add column if not exists offer_badge_en text;

comment on column public.products.offer_price is
  'Discounted selling price. Leave null to sell at the regular price.';

comment on column public.products.offer_starts_at is
  'Optional offer start time. Null means the offer can start immediately.';

comment on column public.products.offer_ends_at is
  'Optional offer end time. Null means the offer has no scheduled end.';

alter table public.order_items
add column if not exists regular_price numeric(10,2);

create table if not exists public.promotional_banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'home_popup',
  title_bn text not null,
  title_en text,
  description_bn text,
  description_en text,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  alt_text_bn text not null,
  alt_text_en text,
  link_url text,
  button_label_bn text,
  button_label_en text,
  seo_title_bn text,
  seo_title_en text,
  seo_description_bn text,
  seo_description_en text,
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_bn text not null,
  title_en text,
  body_bn text not null,
  body_en text,
  seo_title_bn text,
  seo_title_en text,
  seo_description_bn text,
  seo_description_en text,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_promotional_banners_updated_at on public.promotional_banners;
create trigger set_promotional_banners_updated_at
before update on public.promotional_banners
for each row
execute function public.set_updated_at();

drop trigger if exists set_content_pages_updated_at on public.content_pages;
create trigger set_content_pages_updated_at
before update on public.content_pages
for each row
execute function public.set_updated_at();

alter table public.promotional_banners enable row level security;
alter table public.content_pages enable row level security;

drop policy if exists "public read active promotional banners" on public.promotional_banners;
create policy "public read active promotional banners"
on public.promotional_banners for select
using (is_active = true);

drop policy if exists "admin manage promotional banners" on public.promotional_banners;
create policy "admin manage promotional banners"
on public.promotional_banners for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read published content pages" on public.content_pages;
create policy "public read published content pages"
on public.content_pages for select
using (is_published = true);

drop policy if exists "admin manage content pages" on public.content_pages;
create policy "admin manage content pages"
on public.content_pages for all
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
      product_image_url,
      regular_price,
      sell_type,
      unit_price,
      quantity,
      line_total
    )
    values (
      created_order.id,
      nullif(item->>'product_id', '')::uuid,
      item->>'product_name_bn',
      nullif(item->>'product_image_url', ''),
      nullif(item->>'regular_price', '')::numeric,
      item->>'sell_type',
      coalesce((item->>'unit_price')::numeric, 0),
      coalesce((item->>'quantity')::numeric, 0),
      coalesce((item->>'line_total')::numeric, 0)
    );
  end loop;

  return created_order;
end;
$$;

insert into public.content_pages (
  slug,
  title_bn,
  title_en,
  body_bn,
  body_en,
  seo_title_bn,
  seo_title_en,
  seo_description_bn,
  seo_description_en,
  is_published
)
values
  (
    'about',
    'আমাদের সম্পর্কে',
    'About Us',
    'আড়ৎ হলো ঘরে বসে টাটকা সবজি, ফল ও প্রয়োজনীয় বাজার অর্ডার করার সহজ প্ল্যাটফর্ম। আমাদের লক্ষ্য হলো স্থানীয় গ্রাহকদের কাছে আড়ৎ থেকে সতেজ পণ্য সঠিক ওজনে, স্বচ্ছ দামে এবং যত্নসহকারে পৌঁছে দেওয়া।

আমাদের ভিশন হলো দৈনন্দিন বাজারকে আরও সহজ, বিশ্বাসযোগ্য ও ডিজিটাল করা। আমাদের মিশন হলো প্রতিদিন মানসম্পন্ন পণ্য সংগ্রহ, সঠিক পরিমাপ, পরিষ্কার প্যাকিং এবং সময়মতো ডেলিভারির মাধ্যমে গ্রাহকের ভরসা অর্জন করা।',
    'Aarot is a simple platform for ordering fresh vegetables, fruits, and daily groceries from home. Our goal is to deliver fresh market products to local customers with accurate weight, transparent pricing, and careful handling.

Our vision is to make everyday grocery shopping easier, more trustworthy, and more digital. Our mission is to earn customer trust through quality sourcing, accurate measurement, clean packing, and timely delivery.',
    'আড়ৎ সম্পর্কে',
    'About Aarot',
    'আড়ৎ-এর ভিশন, মিশন এবং সেবার গল্প জানুন।',
    'Learn about Aarot''s vision, mission, and service story.',
    true
  ),
  (
    'policy',
    'নীতিমালা',
    'Policy',
    'আড়ৎ-এ অর্ডার করার সময় গ্রাহকের তথ্য নিরাপদে ব্যবহার করা হয় এবং শুধুমাত্র অর্ডার, ডেলিভারি ও সাপোর্টের কাজে রাখা হয়। পণ্যের দাম, স্টক এবং ডেলিভারি সময় বাজার পরিস্থিতি অনুযায়ী পরিবর্তন হতে পারে।

কোনো পণ্য স্টকে না থাকলে বা মান ঠিক না হলে আমরা গ্রাহককে জানিয়ে সমাধান করি। ডেলিভারির সময় ঠিকানা, ফোন নম্বর এবং পেমেন্ট তথ্য সঠিকভাবে দেওয়া গ্রাহকের দায়িত্ব।',
    'At Aarot, customer information is used carefully and only for orders, delivery, and support. Product prices, stock, and delivery timing may change based on market conditions.

If a product is out of stock or does not meet our quality standard, we inform the customer and resolve it. Customers are responsible for providing correct address, phone number, and payment information.',
    'আড়ৎ নীতিমালা',
    'Aarot Policy',
    'আড়ৎ-এর অর্ডার, ডেলিভারি, তথ্য এবং সাপোর্ট নীতিমালা।',
    'Aarot order, delivery, information, and support policy.',
    true
  )
on conflict (slug) do update
set
  title_bn = excluded.title_bn,
  title_en = excluded.title_en,
  body_bn = excluded.body_bn,
  body_en = excluded.body_en,
  seo_title_bn = excluded.seo_title_bn,
  seo_title_en = excluded.seo_title_en,
  seo_description_bn = excluded.seo_description_bn,
  seo_description_en = excluded.seo_description_en,
  is_published = excluded.is_published;
