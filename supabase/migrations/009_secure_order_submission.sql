create or replace function public.place_order(order_payload jsonb)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  created_order public.orders;
  item jsonb;
  product_row public.products;
  product_id uuid;
  item_quantity numeric;
  expected_unit_price numeric;
  expected_line_total numeric;
  calculated_subtotal numeric := 0;
  requested_subtotal numeric;
  requested_discount numeric;
  requested_delivery numeric;
  requested_total numeric;
  customer_phone text := nullif(trim(order_payload->>'phone'), '');
  item_count integer := 0;
begin
  if nullif(trim(order_payload->>'website'), '') is not null then
    raise exception 'অর্ডার গ্রহণ করা যায়নি';
  end if;

  if customer_phone is null or customer_phone !~ '^01[0-9]{9}$' then
    raise exception 'সঠিক ফোন নম্বর প্রয়োজন';
  end if;

  if (select count(*) from public.orders
      where phone = customer_phone
        and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'অল্প সময়ে অনেক অর্ডার করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন';
  end if;

  requested_subtotal := coalesce((order_payload->>'subtotal')::numeric, 0);
  requested_discount := coalesce((order_payload->>'discount_amount')::numeric, 0);
  requested_delivery := coalesce((order_payload->>'delivery_charge')::numeric, 0);
  requested_total := coalesce((order_payload->>'total_amount')::numeric, 0);

  if requested_subtotal < 0 or requested_discount < 0 or requested_delivery < 0
     or requested_total < 0 or requested_discount > requested_subtotal then
    raise exception 'অর্ডারের হিসাব সঠিক নয়';
  end if;

  for item in select * from jsonb_array_elements(coalesce(order_payload->'items', '[]'::jsonb))
  loop
    item_count := item_count + 1;
    item_quantity := (item->>'quantity')::numeric;
    if item_quantity is null or item_quantity <= 0 then
      raise exception 'পণ্যের পরিমাণ সঠিক নয়';
    end if;

    product_id := nullif(item->>'product_id', '')::uuid;
    if product_id is not null then
      select * into product_row
      from public.products
      where id = product_id
      for update;

      if not found or product_row.is_available = false or product_row.available_today = false then
        raise exception 'একটি পণ্য এখন অর্ডার করা যাবে না';
      end if;

      if item_quantity < product_row.minimum_quantity
         or item_quantity > product_row.stock_quantity
         or (product_row.quantity_step > 0
             and mod(item_quantity - product_row.minimum_quantity, product_row.quantity_step) <> 0) then
        raise exception 'পণ্যের পরিমাণ বা স্টক সঠিক নয়';
      end if;

      expected_unit_price := case
        when product_row.offer_price is not null
          and product_row.offer_price > 0
          and product_row.offer_price < product_row.price
          and (product_row.offer_starts_at is null or product_row.offer_starts_at <= now())
          and (product_row.offer_ends_at is null or product_row.offer_ends_at >= now())
          then product_row.offer_price
        else product_row.price
      end;

      expected_line_total := case
        when product_row.sell_type = 'gram'
          then expected_unit_price * item_quantity / 1000
        else expected_unit_price * item_quantity
      end;

      if abs(coalesce((item->>'unit_price')::numeric, -1) - expected_unit_price) > 0.01
         or abs(coalesce((item->>'line_total')::numeric, -1) - expected_line_total) > 0.01 then
        raise exception 'পণ্যের মূল্য পরিবর্তিত হয়েছে। ব্যাগ আপডেট করে আবার চেষ্টা করুন';
      end if;

      update public.products
      set stock_quantity = stock_quantity - item_quantity
      where id = product_id;
    else
      if coalesce((item->>'is_custom_mix')::boolean, false) = false
         or coalesce((item->>'line_total')::numeric, 0) <= 0 then
        raise exception 'অর্ডারের পণ্য সঠিক নয়';
      end if;
      expected_line_total := (item->>'line_total')::numeric;
    end if;

    calculated_subtotal := calculated_subtotal + expected_line_total;
  end loop;

  if item_count = 0 or abs(calculated_subtotal - requested_subtotal) > 0.01
     or abs((requested_subtotal + requested_delivery - requested_discount) - requested_total) > 0.01 then
    raise exception 'অর্ডারের হিসাব সঠিক নয়';
  end if;

  insert into public.orders (
    order_code, customer_name, phone, address_bn, area, area_name_bn,
    payment_method, bkash_transaction_id, customer_note, subtotal,
    discount_amount, coupon_used, delivery_charge, total_amount,
    delivery_date, delivery_type, status, status_message_bn
  )
  values (
    upper(coalesce(order_payload->>'order_code', 'AR-' || right(extract(epoch from now())::text, 8))),
    order_payload->>'customer_name', customer_phone, order_payload->>'address_bn',
    order_payload->>'area', order_payload->>'area_name_bn', order_payload->>'payment_method',
    nullif(order_payload->>'bkash_transaction_id', ''),
    nullif(order_payload->>'customer_note', ''), requested_subtotal,
    requested_discount, nullif(order_payload->>'coupon_used', ''), requested_delivery,
    requested_total, (order_payload->>'delivery_date')::timestamptz,
    order_payload->>'delivery_type', 'pending', order_payload->>'status_message_bn'
  )
  returning * into created_order;

  for item in select * from jsonb_array_elements(coalesce(order_payload->'items', '[]'::jsonb))
  loop
    insert into public.order_items (
      order_id, product_id, product_name_bn, product_image_url, regular_price,
      sell_type, unit_price, quantity, line_total
    )
    values (
      created_order.id, nullif(item->>'product_id', '')::uuid, item->>'product_name_bn',
      nullif(item->>'product_image_url', ''), nullif(item->>'regular_price', '')::numeric,
      item->>'sell_type', (item->>'unit_price')::numeric, (item->>'quantity')::numeric,
      (item->>'line_total')::numeric
    );
  end loop;

  return created_order;
end;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;
