alter table public.order_items
add column if not exists product_image_url text;

comment on column public.order_items.product_image_url is
  'Snapshot of the cart item image shown on order tracking pages.';

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
          'image_url', coalesce(oi.product_image_url, p.image_url),
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
  left join public.products p on p.id = oi.product_id
  where o.order_code = upper(order_code_input)
    and o.phone = phone_input
  group by o.id;
$$;

create or replace function public.track_orders_by_phone(phone_input text)
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
          'image_url', coalesce(oi.product_image_url, p.image_url),
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
  left join public.products p on p.id = oi.product_id
  where o.phone = phone_input
  group by o.id
  order by o.created_at desc;
$$;

create or replace function public.track_order_by_code(order_code_input text)
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
          'image_url', coalesce(oi.product_image_url, p.image_url),
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
  left join public.products p on p.id = oi.product_id
  where o.order_code = upper(order_code_input)
  group by o.id;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;
grant execute on function public.track_orders_by_phone(text) to anon, authenticated;
grant execute on function public.track_order_by_code(text) to anon, authenticated;
