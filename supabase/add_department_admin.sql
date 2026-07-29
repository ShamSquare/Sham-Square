-- =============================================================================
-- Department Admin Permission System - Database Migration
-- =============================================================================

-- 1. Add managed_category column to web_users table
-- This stores the product category assigned to department admins
alter table web_users 
  add column if not exists managed_category text;

comment on column web_users.managed_category is 'Product category assigned to department admin (ANIME, CROCHET, HANDMADE, AL_DUHA_LIBRARY)';

-- 2. Add index for efficient filtering by managed_category
create index if not exists idx_web_users_managed_category 
  on web_users (managed_category) 
  where managed_category is not null and is_deleted = false;

-- 3. Update the role_name enum to include DEPARTMENT_ADMIN
-- First check if the value already exists
do $$
begin
  if not exists (
    select 1 from pg_enum 
    where enumlabel = 'DEPARTMENT_ADMIN' 
    and enumtypid = (
      select oid from pg_type where typname = 'role_name'
    )
  ) then
    alter type role_name add value 'DEPARTMENT_ADMIN';
  end if;
end $$;

-- 4. Insert DEPARTMENT_ADMIN role if it doesn't exist
insert into roles (name, display_name, description, is_system_role, is_active, permissions)
values (
  'DEPARTMENT_ADMIN',
  'Department Admin',
  'Manages products, inventory, orders, and reviews for a specific product category',
  true,
  true,
  '[
    {
      "resource": "products",
      "actions": ["read", "create", "update", "delete"]
    },
    {
      "resource": "inventory",
      "actions": ["read", "update"]
    },
    {
      "resource": "orders",
      "actions": ["read", "update"]
    },
    {
      "resource": "reviews",
      "actions": ["read", "update", "delete"]
    },
    {
      "resource": "settings",
      "actions": ["read", "update"]
    }
  ]'::jsonb
)
on conflict (name) do nothing;

-- 5. Create helper function to check if current user is department admin
create or replace function public.is_department_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from web_users wu
    join roles r on r.id = wu.role_id
    where wu.id = public.current_user_id()
      and wu.is_deleted = false
      and r.name = 'DEPARTMENT_ADMIN'
      and r.is_active = true
      and wu.managed_category is not null
  );
$$;

-- 6. Create helper function to get current user's managed category
create or replace function public.get_department_admin_category()
returns text
language sql
stable
as $$
  select wu.managed_category
  from web_users wu
  where wu.id = public.current_user_id()
    and wu.is_deleted = false
    and wu.managed_category is not null
  limit 1;
$$;

-- 7. Update RLS policies for products to support department admin
-- Department admins can view products in their managed category
drop policy if exists "Department admins can view their category products" on products;

create policy "Department admins can view their category products"
  on products for select
  using (
    public.is_department_admin() 
    and category = public.get_department_admin_category()
  );

-- Department admins can insert products in their managed category
drop policy if exists "Department admins can insert products in their category" on products;

create policy "Department admins can insert products in their category"
  on products for insert
  with check (
    public.is_department_admin() 
    and category = public.get_department_admin_category()
  );

-- Department admins can update products in their managed category
drop policy if exists "Department admins can update their category products" on products;

create policy "Department admins can update their category products"
  on products for update
  using (
    public.is_department_admin() 
    and category = public.get_department_admin_category()
  )
  with check (
    public.is_department_admin() 
    and category = public.get_department_admin_category()
  );

-- Department admins can delete products in their managed category
drop policy if exists "Department admins can delete their category products" on products;

create policy "Department admins can delete their category products"
  on products for delete
  using (
    public.is_department_admin() 
    and category = public.get_department_admin_category()
  );

-- 8. Update RLS policies for product_reviews to support department admin
-- Department admins can view reviews for products in their managed category
drop policy if exists "Department admins can view their category reviews" on product_reviews;

create policy "Department admins can view their category reviews"
  on product_reviews for select
  using (
    public.is_department_admin()
    and exists (
      select 1 from products p
      where p.id = product_reviews.product_id
        and p.category = public.get_department_admin_category()
    )
  );

-- Department admins can update reviews for products in their managed category
drop policy if exists "Department admins can update their category reviews" on product_reviews;

create policy "Department admins can update their category reviews"
  on product_reviews for update
  using (
    public.is_department_admin()
    and exists (
      select 1 from products p
      where p.id = product_reviews.product_id
        and p.category = public.get_department_admin_category()
    )
  )
  with check (
    public.is_department_admin()
    and exists (
      select 1 from products p
      where p.id = product_reviews.product_id
        and p.category = public.get_department_admin_category()
    )
  );

-- Department admins can delete reviews for products in their managed category
drop policy if exists "Department admins can delete their category reviews" on product_reviews;

create policy "Department admins can delete their category reviews"
  on product_reviews for delete
  using (
    public.is_department_admin()
    and exists (
      select 1 from products p
      where p.id = product_reviews.product_id
        and p.category = public.get_department_admin_category()
    )
  );

-- 9. Update RLS policies for orders to support department admin
-- Department admins can view orders that contain products from their managed category
drop policy if exists "Department admins can view orders with their category products" on orders;

create policy "Department admins can view orders with their category products"
  on orders for select
  using (
    public.is_department_admin()
    and exists (
      select 1 from order_items oi
      join products p on p.id = oi.product_id
      where oi.order_id = orders.id
        and p.category = public.get_department_admin_category()
        and oi.is_deleted = false
    )
  );

-- 10. Update RLS policies for order_items to support department admin
-- Department admins can view order items for products in their managed category
drop policy if exists "Department admins can view their category order items" on order_items;

create policy "Department admins can view their category order items"
  on order_items for select
  using (
    public.is_department_admin()
    and exists (
      select 1 from products p
      where p.id = order_items.product_id
        and p.category = public.get_department_admin_category()
    )
  );

-- Department admins can update order items for products in their managed category
drop policy if exists "Department admins can update their category order items" on order_items;

create policy "Department admins can update their category order items"
  on order_items for update
  using (
    public.is_department_admin()
    and exists (
      select 1 from products p
      where p.id = order_items.product_id
        and p.category = public.get_department_admin_category()
    )
  )
  with check (
    public.is_department_admin()
    and exists (
      select 1 from products p
      where p.id = order_items.product_id
        and p.category = public.get_department_admin_category()
    )
  );

-- 11. Update RLS policies for web_users to support department admin
-- Department admins can only view their own profile
drop policy if exists "Department admins can view own profile" on web_users;

create policy "Department admins can view own profile"
  on web_users for select
  using (
    public.is_department_admin()
    and id = public.current_user_id()
  );

-- Department admins can only update their own profile
drop policy if exists "Department admins can update own profile" on web_users;

create policy "Department admins can update own profile"
  on web_users for update
  using (
    public.is_department_admin()
    and id = public.current_user_id()
  )
  with check (
    public.is_department_admin()
    and id = public.current_user_id()
  );

-- 12. Update RLS policies for settings to support department admin
-- Department admins can view all settings (read-only for most, but can update their own)
drop policy if exists "Department admins can view settings" on settings;

create policy "Department admins can view settings"
  on settings for select
  using (public.is_department_admin());

-- Department admins cannot modify global settings (only super admins can)
-- No insert/update/delete policies for department admins on settings

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================