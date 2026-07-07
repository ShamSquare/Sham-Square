-- =============================================================================
-- AshityShop — Supabase PostgreSQL Migration
-- Run this in your Supabase SQL Editor to create all required tables.
-- =============================================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. ROLES
-- =============================================================================
create table if not exists roles (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null unique,
  display_name  text not null,
  description   text not null default '',
  permissions   jsonb not null default '[]'::jsonb,
  is_system_role boolean not null default false,
  is_active     boolean not null default true,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz,
  deleted_by    uuid,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_roles_active on roles (is_active, is_deleted);

-- =============================================================================
-- 2. USERS (password_hash is stored; supabase auth is NOT used here)
-- =============================================================================
create table if not exists users (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null unique,
  phone           text unique,
  password_hash   text not null,
  role_id         uuid not null references roles(id),
  first_name      text not null,
  last_name       text not null,
  avatar          text,
  status          text not null default 'ACTIVE',
  email_verified  boolean not null default false,
  phone_verified  boolean not null default false,
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  last_login_at   timestamptz,
  last_login_ip   text,
  device_tokens   jsonb not null default '[]'::jsonb,
  vendor_id       uuid,
  delivery_profile jsonb,
  metadata        jsonb not null default '{}'::jsonb,
  is_deleted      boolean not null default false,
  deleted_at      timestamptz,
  deleted_by      uuid,
  created_by      uuid,
  updated_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_users_role on users (role_id, status, is_deleted);
create index idx_users_vendor on users (vendor_id, is_deleted);
create index idx_users_created on users (created_at desc);

-- =============================================================================
-- 3. ADDRESSES
-- =============================================================================
create table if not exists addresses (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references users(id),
  label           text not null default 'HOME',
  full_name       text not null,
  phone           text not null,
  address_line1   text not null,
  address_line2   text not null default '',
  city            text not null,
  state           text not null,
  country         text not null,
  postal_code     text not null,
  location        jsonb,
  is_default      boolean not null default false,
  delivery_instructions text not null default '',
  is_deleted      boolean not null default false,
  deleted_at      timestamptz,
  deleted_by      uuid,
  created_by      uuid,
  updated_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_addresses_user on addresses (user_id, is_deleted);

-- =============================================================================
-- 4. CATEGORIES
-- =============================================================================
create table if not exists categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  description   text not null default '',
  image         text,
  icon          text,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  vendor_id     uuid,
  seo           jsonb,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz,
  deleted_by    uuid,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_categories_active on categories (is_active, sort_order, is_deleted);

-- =============================================================================
-- 5. SUBCATEGORIES
-- =============================================================================
create table if not exists subcategories (
  id            uuid primary key default uuid_generate_v4(),
  category_id   uuid not null references categories(id),
  name          text not null,
  slug          text not null,
  description   text not null default '',
  image         text,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  vendor_id     uuid,
  seo           jsonb,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz,
  deleted_by    uuid,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(category_id, slug)
);

create index idx_subcategories_active on subcategories (category_id, is_active, sort_order, is_deleted);

-- =============================================================================
-- 6. PRODUCTS
-- =============================================================================
create table if not exists products (
  id                uuid primary key default uuid_generate_v4(),
  category_id       uuid not null references categories(id),
  sub_category_id   uuid not null references subcategories(id),
  vendor_id         uuid,
  name              text not null,
  slug              text not null unique,
  description       text not null,
  short_description text not null default '',
  brand             text,
  tags              text[] not null default '{}',
  images            text[] not null default '{}',
  thumbnail         text,
  price_range       jsonb not null default '{"min":0,"max":0,"currency":"USD"}'::jsonb,
  attributes        jsonb not null default '{}'::jsonb,
  status            text not null default 'DRAFT',
  is_featured       boolean not null default false,
  rating            jsonb not null default '{"average":0,"count":0,"distribution":{"one":0,"two":0,"three":0,"four":0,"five":0}}'::jsonb,
  total_sold        integer not null default 0,
  seo               jsonb,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid,
  created_by        uuid,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_products_category on products (category_id, sub_category_id, status, is_deleted);
create index idx_products_featured on products (status, is_featured);
create index idx_products_created on products (created_at desc);
create index idx_products_sold on products (total_sold desc);
create index idx_products_tags on products using gin (tags);

-- =============================================================================
-- 7. PRODUCT VARIANTS
-- =============================================================================
create table if not exists product_variants (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references products(id),
  vendor_id       uuid,
  sku             text not null unique,
  name            text not null,
  attributes      jsonb not null default '{}'::jsonb,
  price           numeric(12,2) not null,
  compare_at_price numeric(12,2),
  cost_price      numeric(12,2),
  currency        text not null default 'USD',
  inventory       jsonb not null default '{"quantity":0,"reserved":0,"low_stock_threshold":5}'::jsonb,
  weight          numeric(10,2),
  weight_unit     text not null default 'kg',
  dimensions      jsonb,
  images          text[] not null default '{}',
  barcode         text,
  is_default      boolean not null default false,
  is_active       boolean not null default true,
  is_deleted      boolean not null default false,
  deleted_at      timestamptz,
  deleted_by      uuid,
  created_by      uuid,
  updated_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_variants_product on product_variants (product_id, is_active, is_deleted);
create index idx_variants_default on product_variants (product_id, is_default);

-- =============================================================================
-- 8. PRODUCT REVIEWS
-- =============================================================================
create table if not exists product_reviews (
  id                  uuid primary key default uuid_generate_v4(),
  product_id          uuid not null references products(id),
  user_id             uuid not null references users(id),
  order_id            uuid,
  variant_id          uuid,
  rating              integer not null check (rating >= 1 and rating <= 5),
  title               text not null default '',
  comment             text not null,
  images              text[] not null default '{}',
  is_verified_purchase boolean not null default false,
  is_approved         boolean not null default false,
  is_hidden           boolean not null default false,
  helpful_count       integer not null default 0,
  admin_response      jsonb,
  is_deleted          boolean not null default false,
  deleted_at          timestamptz,
  deleted_by          uuid,
  created_by          uuid,
  updated_by          uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(product_id, user_id)
);

create index idx_reviews_product on product_reviews (product_id, is_approved, is_hidden, created_at desc);
create index idx_reviews_user on product_reviews (user_id, created_at desc);

-- =============================================================================
-- 9. WISHLISTS
-- =============================================================================
create table if not exists wishlists (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references users(id),
  name        text not null default 'My Wishlist',
  is_default  boolean not null default true,
  items       jsonb not null default '[]'::jsonb,
  item_count  integer not null default 0,
  is_deleted  boolean not null default false,
  deleted_at  timestamptz,
  deleted_by  uuid,
  created_by  uuid,
  updated_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, name)
);

create index idx_wishlists_user on wishlists (user_id, is_default);

-- =============================================================================
-- 10. CARTS
-- =============================================================================
create table if not exists carts (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references users(id),
  session_id        text,
  status            text not null default 'ACTIVE',
  coupon_code       text,
  coupon_id         uuid,
  currency          text not null default 'USD',
  subtotal          numeric(12,2) not null default 0,
  discount          numeric(12,2) not null default 0,
  shipping          numeric(12,2) not null default 0,
  tax               numeric(12,2) not null default 0,
  total             numeric(12,2) not null default 0,
  item_count        integer not null default 0,
  expires_at        timestamptz,
  converted_order_id uuid,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid,
  created_by        uuid,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index idx_carts_active_user on carts (user_id, status) where user_id is not null and status = 'ACTIVE' and is_deleted = false;
create unique index idx_carts_active_session on carts (session_id, status) where session_id is not null and status = 'ACTIVE' and is_deleted = false;

-- =============================================================================
-- 11. CART ITEMS
-- =============================================================================
create table if not exists cart_items (
  id            uuid primary key default uuid_generate_v4(),
  cart_id       uuid not null references carts(id),
  product_id    uuid not null references products(id),
  variant_id    uuid not null references product_variants(id),
  quantity      integer not null check (quantity >= 1 and quantity <= 99),
  unit_price    numeric(12,2) not null,
  line_total    numeric(12,2) not null,
  currency      text not null default 'USD',
  product_name  text not null,
  variant_name  text not null,
  thumbnail     text,
  vendor_id     uuid,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz,
  deleted_by    uuid,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(cart_id, variant_id)
);

create index idx_cart_items_cart on cart_items (cart_id, is_deleted);

-- =============================================================================
-- 12. ORDERS
-- =============================================================================
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  order_number      text not null unique,
  user_id           uuid not null references users(id),
  status            text not null default 'PENDING',
  payment           jsonb not null default '{"method":"COD","status":"PENDING","refund_amount":0}'::jsonb,
  shipping_address  jsonb not null default '{}'::jsonb,
  billing_address   jsonb,
  shipping_address_id uuid,
  pricing           jsonb not null default '{"subtotal":0,"discount":0,"shipping":0,"tax":0,"total":0,"currency":"USD"}'::jsonb,
  coupon_id         uuid,
  coupon_code       text,
  delivery          jsonb not null default '{}'::jsonb,
  customer_notes    text not null default '',
  admin_notes       text not null default '',
  cancel_reason     text,
  cancelled_at      timestamptz,
  vendor_id         uuid,
  is_archived       boolean not null default false,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid,
  created_by        uuid,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_orders_user on orders (user_id, created_at desc);
create index idx_orders_status on orders (status, created_at desc);

-- =============================================================================
-- 13. ORDER ITEMS
-- =============================================================================
create table if not exists order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references orders(id),
  product_id    uuid not null references products(id),
  variant_id    uuid not null references product_variants(id),
  sku           text not null,
  product_name  text not null,
  variant_name  text not null,
  thumbnail     text,
  quantity      integer not null,
  unit_price    numeric(12,2) not null,
  discount      numeric(12,2) not null default 0,
  tax           numeric(12,2) not null default 0,
  line_total    numeric(12,2) not null,
  currency      text not null default 'USD',
  status        text not null default 'PENDING',
  vendor_id     uuid,
  warehouse_id  uuid,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz,
  deleted_by    uuid,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_order_items_order on order_items (order_id, is_deleted);

-- =============================================================================
-- 14. ORDER TRACKING
-- =============================================================================
create table if not exists order_tracking (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references orders(id),
  status          text not null,
  title           text not null,
  message         text not null default '',
  location        jsonb,
  location_label  text not null default '',
  source          text not null default 'SYSTEM',
  metadata        jsonb not null default '{}'::jsonb,
  created_by      uuid,
  created_at      timestamptz not null default now()
);

create index idx_tracking_order on order_tracking (order_id, created_at desc);

-- =============================================================================
-- 15. NOTIFICATIONS
-- =============================================================================
create table if not exists notifications (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references users(id),
  type            text not null,
  title           text not null,
  body            text not null,
  data            jsonb not null default '{}'::jsonb,
  channels        text[] not null default '{IN_APP}',
  delivery_status text not null default 'PENDING',
  is_read         boolean not null default false,
  read_at         timestamptz,
  sent_at         timestamptz,
  expires_at      timestamptz,
  failure_reason  text,
  created_at      timestamptz not null default now()
);

create index idx_notifications_user on notifications (user_id, is_read, created_at desc);

-- =============================================================================
-- 16. COUPONS
-- =============================================================================
create table if not exists coupons (
  id                      uuid primary key default uuid_generate_v4(),
  code                    text not null unique,
  name                    text not null,
  description             text not null default '',
  type                    text not null,
  value                   numeric(12,2) not null,
  max_discount            numeric(12,2),
  min_order_amount        numeric(12,2) not null default 0,
  usage_limit             integer,
  usage_count             integer not null default 0,
  per_user_limit          integer not null default 1,
  applicability           text not null default 'ALL',
  applicable_category_ids uuid[] not null default '{}',
  applicable_product_ids  uuid[] not null default '{}',
  start_date              timestamptz not null,
  end_date                timestamptz not null,
  is_active               boolean not null default true,
  vendor_id               uuid,
  is_deleted              boolean not null default false,
  deleted_at              timestamptz,
  deleted_by              uuid,
  created_by              uuid,
  updated_by              uuid,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_coupons_active on coupons (is_active, start_date, end_date, is_deleted);

-- =============================================================================
-- 17. BANNERS
-- =============================================================================
create table if not exists banners (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  subtitle      text not null default '',
  image         text not null,
  mobile_image  text,
  link_type     text not null default 'NONE',
  link_value    text,
  platform      text not null default 'ALL',
  position      text not null,
  sort_order    integer not null default 0,
  start_date    timestamptz,
  end_date      timestamptz,
  is_active     boolean not null default true,
  click_count   integer not null default 0,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz,
  deleted_by    uuid,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_banners_active on banners (platform, position, is_active, sort_order, is_deleted);

-- =============================================================================
-- 18. SUPPORT TICKETS
-- =============================================================================
create table if not exists support_tickets (
  id              uuid primary key default uuid_generate_v4(),
  ticket_number   text not null unique,
  user_id         uuid not null references users(id),
  order_id        uuid,
  category        text not null,
  subject         text not null,
  priority        text not null default 'MEDIUM',
  status          text not null default 'OPEN',
  assigned_to     uuid,
  messages        jsonb not null default '[]'::jsonb,
  message_count   integer not null default 0,
  last_message_at timestamptz,
  resolved_at     timestamptz,
  closed_at       timestamptz,
  is_deleted      boolean not null default false,
  deleted_at      timestamptz,
  deleted_by      uuid,
  created_by      uuid,
  updated_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_tickets_user on support_tickets (user_id, status, created_at desc);
create index idx_tickets_assigned on support_tickets (assigned_to, status, priority);

-- =============================================================================
-- 19. AUDIT LOGS
-- =============================================================================
create table if not exists audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  entity_type text not null,
  entity_id   uuid not null,
  action      text not null,
  actor_id    uuid,
  actor_role  text,
  changes     jsonb,
  ip_address  text,
  user_agent  text,
  request_id  text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_entity on audit_logs (entity_type, entity_id, created_at desc);
create index idx_audit_actor on audit_logs (actor_id, created_at desc);
create index idx_audit_action on audit_logs (action, created_at desc);

-- =============================================================================
-- 20. SETTINGS
-- =============================================================================
create table if not exists settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  value       jsonb not null,
  group_name  text not null default 'GENERAL',
  description text not null default '',
  is_public   boolean not null default false,
  is_encrypted boolean not null default false,
  is_deleted  boolean not null default false,
  deleted_at  timestamptz,
  deleted_by  uuid,
  created_by  uuid,
  updated_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_settings_group on settings (group_name, is_public, is_deleted);

-- =============================================================================
-- 21. USER DEVICES
-- =============================================================================
create table if not exists user_devices (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references users(id),
  fcm_token   text not null unique,
  device_type text not null default 'web',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_user_devices_user on user_devices (user_id, is_active);
create index idx_user_devices_token on user_devices (fcm_token, is_active);

-- =============================================================================
-- SEED DATA
-- =============================================================================
insert into roles (name, display_name, description, is_system_role, is_active) values
  ('USER', 'User', 'Regular customer', true, true),
  ('ADMIN', 'Admin', 'Administrator', true, true),
  ('SUPER_ADMIN', 'Super Admin', 'Super administrator', true, true),
  ('DELIVERY', 'Delivery', 'Delivery agent', true, true)
on conflict (name) do nothing;
