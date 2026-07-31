-- ============================================
-- Fix: create_order_atomic type cast issue
-- ============================================
-- Root cause: coercece(p_payload->>'status', 'PENDING') returns text,
-- which PostgreSQL cannot implicitly cast to order_status enum.
-- This causes the entire create_order_atomic function to fail
-- with: column "status" is of type order_status but expression is of type text
-- Fix: add explicit casts to order_status for status column,
-- and to uuid for shipping_address_id / vendor_id columns.

create or replace function public.create_order_atomic(
  p_payload jsonb
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_current_stock integer;
  v_coupon_id uuid := null;
  v_coupon_code text := null;
  v_coupon record;
begin
  v_order_number := coalesce(
    p_payload->>'orderNumber',
    'ORD-' || extract(epoch from now())::text
  );
  v_coupon_id := nullif(trim(both '"' from p_payload->>'couponId'), '');
  v_coupon_code := nullif(trim(both '"' from p_payload->>'couponCode'), '');

  for v_item in select * from jsonb_array_elements(coalesce(p_payload->'items', '[]'::jsonb)) loop
    v_product_id := (v_item->>'productId')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    if v_product_id is null or v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid item data: missing productId or quantity';
    end if;

    select stock into v_current_stock from products where id = v_product_id for update;

    if not found then
      raise exception 'Product % not found', v_product_id;
    end if;

    if v_current_stock < v_quantity then
      raise exception 'Insufficient stock for product %: available %, requested %', v_product_id, v_current_stock, v_quantity;
    end if;
  end loop;

  if v_coupon_id is not null then
    select * into v_coupon from coupons where id = v_coupon_id for update;

    if not found then
      raise exception 'Coupon % not found', v_coupon_id;
    end if;

    if v_coupon.usage_limit is not null and v_coupon.usage_count >= v_coupon.usage_limit then
      raise exception 'Coupon % has reached maximum usage limit of %', coalesce(v_coupon_code, v_coupon.id), v_coupon.usage_limit;
    end if;
  end if;

  insert into orders (
    order_number,
    user_id,
    status,
    payment,
    shipping_address,
    billing_address,
    shipping_address_id,
    pricing,
    coupon_id,
    coupon_code,
    customer_notes,
    admin_notes,
    cancel_reason,
    vendor_id,
    is_archived,
    is_deleted,
    created_at,
    updated_at
  ) values (
    v_order_number,
    (p_payload->>'userId')::uuid,
    coalesce((p_payload->>'status')::order_status, 'PENDING'::order_status),
    coalesce(p_payload->'payment', '{"method":"COD","status":"PENDING"}'::jsonb),
    coalesce(p_payload->'shippingAddress', '{}'::jsonb),
    p_payload->'billingAddress',
    nullif(trim(both '"' from p_payload->>'shippingAddressId'), '')::uuid,
    coalesce(p_payload->'pricing', '{"subtotal":0,"discount":0,"shipping":0,"tax":0,"total":0,"currency":"SYP"}'::jsonb),
    v_coupon_id,
    v_coupon_code,
    coalesce(p_payload->>'customerNotes', ''),
    coalesce(p_payload->>'adminNotes', ''),
    nullif(trim(both '"' from p_payload->>'cancelReason'), ''),
    nullif(trim(both '"' from p_payload->>'vendorId'), '')::uuid,
    false,
    false,
    now(),
    now()
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_payload->'items', '[]'::jsonb)) loop
    insert into order_items (
      order_id,
      product_id,
      variant_id,
      sku,
      product_name,
      variant_name,
      thumbnail,
      selected_color,
      selected_size,
      quantity,
      unit_price,
      discount,
      tax,
      line_total,
      currency,
      status,
      is_deleted,
      created_at,
      updated_at
    ) values (
      v_order_id,
      (v_item->>'productId')::uuid,
      nullif(trim(both '"' from v_item->>'variantId'), ''),
      coalesce(v_item->>'sku', ''),
      coalesce(v_item->>'productName', 'Unknown Product'),
      coalesce(v_item->>'variantName', ''),
      v_item->>'thumbnail',
      nullif(trim(both '"' from v_item->>'selectedColor'), ''),
      nullif(trim(both '"' from v_item->>'selectedSize'), ''),
      (v_item->>'quantity')::integer,
      coalesce((v_item->>'unitPrice')::numeric, 0),
      coalesce((v_item->>'discount')::numeric, 0),
      coalesce((v_item->>'tax')::numeric, 0),
      coalesce((v_item->>'lineTotal')::numeric, 0),
      coalesce(v_item->>'currency', 'SYP'),
      coalesce(v_item->>'status', 'PENDING'),
      false,
      now(),
      now()
    );
  end loop;

  if v_coupon_id is not null then
    update coupons
    set usage_count = usage_count + 1,
        updated_at = now()
    where id = v_coupon_id;
  end if;

  for v_item in select * from jsonb_array_elements(coalesce(p_payload->'items', '[]'::jsonb)) loop
    v_product_id := (v_item->>'productId')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    update products
    set stock = stock - v_quantity,
        total_sold = total_sold + v_quantity,
        updated_at = now()
    where id = v_product_id;

    if not found then
      raise exception 'Product % not found during stock deduction', v_product_id;
    end if;

    if (select stock from products where id = v_product_id) < 0 then
      raise exception 'Stock went negative for product %', v_product_id;
    end if;
  end loop;

  return jsonb_build_object(
    'id', v_order_id,
    'orderNumber', v_order_number,
    'status', 'PENDING',
    'success', true
  );
end;
$$;
