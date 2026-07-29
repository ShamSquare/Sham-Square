-- =============================================================================
-- AshityShop — Complete Supabase PostgreSQL Migration
-- =============================================================================
-- Run this in your Supabase SQL Editor to create all required tables,
-- enums, indexes, RLS policies, and seed data.
-- =============================================================================

-- 0. Extensions
-- =============================================================================
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. ENUMS (PostgreSQL custom types)
-- =============================================================================

create type  user_status as enum (
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION'
);

create type role_name as enum (
  'USER',
  'ADMIN',
  'SUPER_ADMIN',
  'DELIVERY'
);

create type product_status as enum (
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED'
);

create type order_status as enum (
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
  'REFUNDED'
);

create type order_item_status as enum (
  'PENDING',
  'CONFIRMED',
  'PICKED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED'
);

create type payment_method as enum (
  'COD',
  'STRIPE',
  'PAYPAL',
  'RAZORPAY'
);

create type payment_status as enum (
  'PENDING',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'REFUNDED',
  'CANCELLED'
);

create type cart_status as enum (
  'ACTIVE',
  'ABANDONED',
  'CONVERTED',
  'EXPIRED'
);

create type coupon_type as enum (
  'PERCENTAGE',
  'FIXED',
  'FREE_SHIPPING'
);

create type coupon_applicability as enum (
  'ALL',
  'CATEGORIES',
  'PRODUCTS'
);

create type notification_type as enum (
  'ORDER',
  'DELIVERY',
  'PROMOTION',
  'SYSTEM',
  'SUPPORT',
  'PAYMENT'
);

create type notification_channel as enum (
  'IN_APP',
  'PUSH',
  'EMAIL',
  'SMS'
);

create type notification_delivery_status as enum (
  'PENDING',
  'SENT',
  'DELIVERED',
  'FAILED',
  'READ'
);

create type banner_link_type as enum (
  'NONE',
  'PRODUCT',
  'CATEGORY',
  'SUBCATEGORY',
  'EXTERNAL',
  'COUPON'
);

create type banner_platform as enum (
  'ALL',
  'WEB',
  'ANDROID',
  'IOS'
);

create type support_ticket_status as enum (
  'OPEN',
  'IN_PROGRESS',
  'WAITING_ON_CUSTOMER',
  'RESOLVED',
  'CLOSED'
);

create type support_ticket_priority as enum (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

create type support_ticket_category as enum (
  'ORDER',
  'PAYMENT',
  'DELIVERY',
  'PRODUCT',
  'ACCOUNT',
  'OTHER'
);

create type audit_action as enum (
  'CREATE',
  'UPDATE',
  'DELETE',
  'SOFT_DELETE',
  'RESTORE',
  'LOGIN',
  'LOGOUT',
  'STATUS_CHANGE',
  'PERMISSION_CHANGE'
);

create type address_label as enum (
  'HOME',
  'WORK',
  'OTHER'
);

create type setting_group as enum (
  'GENERAL',
  'PAYMENT',
  'SHIPPING',
  'NOTIFICATION',
  'MOBILE',
  'ANALYTICS',
  'VENDOR',
  'WAREHOUSE'
);

create type tracking_event_source as enum (
  'SYSTEM',
  'ADMIN',
  'DELIVERY',
  'CUSTOMER'
);

create type device_platform as enum (
  'ANDROID',
  'IOS',
  'WEB'
);

-- =============================================================================
-- 2. TABLES (in dependency order)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2.1. ROLES
-- ---------------------------------------------------------------------------
-- Stores system roles (USER, ADMIN, SUPER_ADMIN, DELIVERY) with granular
-- JSON-based permissions.
-- ---------------------------------------------------------------------------
create table if not exists roles (
  id                uuid primary key default gen_random_uuid(),
  name              role_name not null unique,
  display_name      text not null,
  description       text not null default '',
  permissions       jsonb not null default '[]'::jsonb,
  is_system_role    boolean not null default false,
  is_active         boolean not null default true,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid,
  created_by        uuid,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table roles is 'System roles with granular JSON-based permissions';
comment on column roles.permissions is 'Array of {resource, actions[]} objects defining access rights';

create index idx_roles_active on roles (is_active, is_deleted);

-- ---------------------------------------------------------------------------
-- 2.2. USERS
-- ---------------------------------------------------------------------------
-- Primary user table for mobile app authentication. Uses self-contained
-- password_hash rather than Supabase Auth, giving full control over the
-- authentication flow.
-- ---------------------------------------------------------------------------
create table if not exists users (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  phone             text unique,
  password_hash     text not null,
  role_id           uuid not null references roles(id) on delete restrict,
  first_name        text not null,
  last_name         text not null,
  avatar            text,
  status            user_status not null default 'ACTIVE',
  email_verified    boolean not null default false,
  phone_verified    boolean not null default false,
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  last_login_at     timestamptz,
  last_login_ip     text,
  device_tokens     jsonb not null default '[]'::jsonb,
  vendor_id         uuid,
  delivery_profile  jsonb,
  metadata          jsonb not null default '{}'::jsonb,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid,
  created_by        uuid,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Ensure soft-delete timestamp is set when is_deleted becomes true
  constraint chk_users_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on table users is 'Primary user table for mobile app authentication (self-contained auth)';
comment on column users.device_tokens is 'Array of {token, platform, deviceId, appVersion, isActive, lastUsedAt} objects';
comment on column users.delivery_profile is 'Delivery agent profile {isAvailable, vehicleType, licenseNumber, currentLocation}';
comment on column users.vendor_id is 'Vendor ID if this user is a vendor admin';

create index idx_users_role on users (role_id, status, is_deleted);
create index idx_users_vendor on users (vendor_id, is_deleted);
create index idx_users_created on users (created_at desc);
create index idx_users_email on users (email) where is_deleted = false;
create index idx_users_phone on users (phone) where phone is not null and is_deleted = false;

-- ---------------------------------------------------------------------------
-- 2.3. WEB USERS
-- ---------------------------------------------------------------------------
-- Dedicated table for website users with an independent authentication system
-- from mobile users to avoid conflicts and allow separate auth flows.
-- ---------------------------------------------------------------------------
create table if not exists web_users (
   id              uuid primary key default gen_random_uuid(),
   email           text not null unique,
   password_hash   text not null,
   first_name      text not null,
   last_name       text not null,
   avatar          text,
   phone           text,
   role            text not null default 'USER',
   role_type       text not null default 'user',
   department_id   uuid references departments(id) on delete set null,
   status          user_status not null default 'ACTIVE',
   email_verified  boolean not null default false,
   phone_verified  boolean not null default false,
   last_login_at   timestamptz,
   is_deleted      boolean not null default false,
   deleted_at      timestamptz,
   deleted_by      uuid,
   created_by      uuid,
   updated_by      uuid,
   created_at      timestamptz not null default now(),
   updated_at      timestamptz not null default now(),

   -- Version column for optimistic locking
   version         integer not null default 1,

   -- Ensure soft-delete constraint
   constraint chk_web_users_deleted_at check (
     (is_deleted = false and deleted_at is null) or
     (is_deleted = true and deleted_at is not null)
   )
);

comment on table web_users is 'Website users with independent authentication from mobile users';
comment on column web_users.version is 'Optimistic locking version counter';

create index idx_web_users_email on web_users(email) where is_deleted = false;
create index idx_web_users_status on web_users(status, is_deleted);
create index idx_web_users_created_at on web_users(created_at desc);

-- ---------------------------------------------------------------------------
-- 2.4. DEPARTMENTS
-- ---------------------------------------------------------------------------
-- Organizational departments for multi-tenant vendor management. Each
-- department groups products, orders, and revenue under an admin team.
-- ---------------------------------------------------------------------------
create table if not exists departments (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  name_ar         text not null,
  description     text not null default '',
  supervisor_id   uuid references users(id) on delete set null,
  admin_ids       uuid[] not null default '{}',
  product_count   integer not null default 0,
  order_count     integer not null default 0,
  revenue         numeric(14,2) not null default 0,
  is_active       boolean not null default true,
  is_deleted      boolean not null default false,
  deleted_at      timestamptz,
  deleted_by      uuid,
  created_by      uuid,
  updated_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint chk_departments_product_count check (product_count >= 0),
  constraint chk_departments_order_count check (order_count >= 0),
  constraint chk_departments_revenue check (revenue >= 0),
  constraint chk_departments_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column departments.supervisor_id is 'Foreign key to users table - the department supervisor';
create index idx_departments_supervisor on departments (supervisor_id) where supervisor_id is not null;

comment on table departments is 'Organizational departments for multi-tenant vendor management';
comment on column departments.admin_ids is 'Array of user IDs who administer this department';
comment on column departments.name_ar is 'Arabic name for the department';

create index idx_departments_active on departments (is_active, is_deleted);
create index idx_departments_admin on departments using gin (admin_ids);

-- ---------------------------------------------------------------------------
-- 2.5. ADDRESSES
-- ---------------------------------------------------------------------------
-- User shipping/billing addresses with geolocation support.
-- ---------------------------------------------------------------------------
create table if not exists addresses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  label           address_label not null default 'HOME',
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
  updated_at      timestamptz not null default now(),

  constraint chk_addresses_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column addresses.location is 'GeoJSON Point: {"type": "Point", "coordinates": [lng, lat]}';

create index idx_addresses_user on addresses (user_id, is_deleted);
create index idx_addresses_default on addresses (user_id, is_default) where is_default = true and is_deleted = false;

-- ---------------------------------------------------------------------------
-- 2.6. CATEGORIES
-- ---------------------------------------------------------------------------
-- NOTE: Categories are now fixed enums, not a managed table.
-- This table is kept for backward compatibility during migration.
-- It will be removed after data migration.
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
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
  updated_at    timestamptz not null default now(),

  constraint chk_categories_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column categories.seo is 'SEO metadata: {metaTitle, metaDescription}';

create index idx_categories_active on categories (is_active, sort_order, is_deleted);
create index idx_categories_slug on categories (slug) where is_deleted = false;

-- ---------------------------------------------------------------------------
-- 2.7. SUBCATEGORIES
-- ---------------------------------------------------------------------------
-- NOTE: SubCategories are now fixed enums, not a managed table.
-- This table is kept for backward compatibility during migration.
-- It will be removed after data migration.
-- ---------------------------------------------------------------------------
create table if not exists subcategories (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references categories(id) on delete cascade,
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

  -- Slug is unique within the context of the parent category
  unique(category_id, slug),

  constraint chk_subcategories_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

create index idx_subcategories_active on subcategories (category_id, is_active, sort_order, is_deleted);

-- ---------------------------------------------------------------------------
-- MIGRATION FIX: ensure sub_category accepts NULLs
-- This handles databases that were created with an older migration where
-- sub_category was NOT NULL.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'products'
      and column_name = 'sub_category'
      and is_nullable = 'NO'
  ) then
    alter table products alter column sub_category drop not null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2.8. PRODUCTS
-- ---------------------------------------------------------------------------
-- Core product catalog with rich metadata, rating aggregation, and
-- fixed category/subcategory assignment using enums.
-- ---------------------------------------------------------------------------
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  category          text not null,
  sub_category      text null,
  vendor_id         uuid,
  name              text not null,
  slug              text not null unique,
  description       text not null,
  short_description text not null default '',
  brand             text,
  tags              text[] not null default '{}',
  image             text,
  images            text[] not null default '{}',
  thumbnail         text,
  price             numeric(12,2) not null default 0,
  price_range       jsonb not null default '{"min":0,"max":0,"currency":"USD"}'::jsonb,
  attributes        jsonb not null default '{}'::jsonb,
  stock             integer not null default 0,
  status            product_status not null default 'DRAFT',
  is_featured       boolean not null default false,
  has_sizes         boolean not null default false,
  sizes             text[] not null default '{}',
  has_colors        boolean not null default false,
  colors            text[] not null default '{}',
  rating            jsonb not null default '{"average":0,"count":0,"distribution":{"one":0,"two":0,"three":0,"four":0,"five":0}}'::jsonb,
  total_sold        integer not null default 0,
  seo               jsonb,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid,
  created_by        uuid,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint chk_products_total_sold check (total_sold >= 0),
  constraint chk_products_stock check (stock >= 0),
  constraint chk_products_price check (price >= 0),
  constraint chk_products_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  ),

  constraint chk_products_category check (category in ('AL_DUHA_LIBRARY', 'CROCHET', 'ANIME', 'HANDMADE')),
  constraint chk_products_sub_category check (
    (sub_category is null) or
    (sub_category in ('LIBRARY_PRODUCTS', 'PRINTING_SERVICES', 'NO_SUB'))
  )
);

comment on column products.category is 'Fixed category enum: AL_DUHA_LIBRARY, CROCHET, ANIME, HANDMADE';
comment on column products.sub_category is 'Fixed subcategory enum (only for AL_DUHA_LIBRARY): LIBRARY_PRODUCTS, PRINTING_SERVICES';
comment on column products.stock is 'Current inventory stock quantity';
create index idx_products_stock on products (stock) where is_deleted = false;

comment on column products.price_range is 'Price range: {min, max, currency}';
comment on column products.rating is 'Rating aggregate: {average, count, distribution: {one..five}}';
comment on column products.attributes is 'Key-value product attributes (e.g., color, size, material)';

create index idx_products_category on products (category, status, is_deleted);
create index idx_products_featured on products (status, is_featured) where is_deleted = false;
create index idx_products_created on products (created_at desc);
create index idx_products_sold on products (total_sold desc);
create index idx_products_tags on products using gin (tags);
create index idx_products_slug on products (slug) where is_deleted = false;

-- ---------------------------------------------------------------------------
-- 2.9. PRODUCT VARIANTS
-- ---------------------------------------------------------------------------
-- Size, color, and other variant-level inventory and pricing for each product.
-- ---------------------------------------------------------------------------
create table if not exists product_variants (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references products(id) on delete cascade,
  vendor_id         uuid,
  sku               text not null unique,
  name              text not null,
  attributes        jsonb not null default '{}'::jsonb,
  price             numeric(12,2) not null,
  compare_at_price  numeric(12,2),
  cost_price        numeric(12,2),
  currency          text not null default 'USD',
  inventory         jsonb not null default '{"quantity":0,"reserved":0,"low_stock_threshold":5}'::jsonb,
  weight            numeric(10,2),
  weight_unit       text not null default 'kg',
  dimensions        jsonb,
  images            text[] not null default '{}',
  barcode           text,
  is_default        boolean not null default false,
  is_active         boolean not null default true,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid,
  created_by        uuid,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint chk_variants_price check (price >= 0),
  constraint chk_variants_compare_price check (compare_at_price is null or compare_at_price >= 0),
  constraint chk_variants_cost_price check (cost_price is null or cost_price >= 0),
  constraint chk_variants_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column product_variants.inventory is 'Inventory tracking: {quantity, reserved, low_stock_threshold}';
comment on column product_variants.dimensions is 'Physical dimensions: {length, width, height, unit}';

create index idx_variants_product on product_variants (product_id, is_active, is_deleted);
create index idx_variants_default on product_variants (product_id, is_default) where is_default = true;
create index idx_variants_sku on product_variants (sku) where is_deleted = false;

-- ---------------------------------------------------------------------------
-- 2.10. PRODUCT REVIEWS
-- ---------------------------------------------------------------------------
-- User-submitted product reviews with moderation support and verified
-- purchase tracking. One review per product per user enforced by unique
-- constraint.
-- ---------------------------------------------------------------------------
create table if not exists product_reviews (
  id                    uuid primary key default gen_random_uuid(),
  product_id            uuid not null references products(id) on delete cascade,
  user_id               uuid not null references users(id) on delete cascade,
  order_id              uuid,
  variant_id            uuid,
  rating                integer not null,
  title                 text not null default '',
  comment               text not null,
  images                text[] not null default '{}',
  is_verified_purchase  boolean not null default false,
  is_approved           boolean not null default false,
  is_hidden             boolean not null default false,
  helpful_count         integer not null default 0,
  admin_response        jsonb,
  is_deleted            boolean not null default false,
  deleted_at            timestamptz,
  deleted_by            uuid,
  created_by            uuid,
  updated_by            uuid,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- Rating must be between 1 and 5
  constraint chk_reviews_rating check (rating >= 1 and rating <= 5),
  constraint chk_reviews_helpful_count check (helpful_count >= 0),
  -- One review per product per user
  unique(product_id, user_id),
  constraint chk_reviews_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column product_reviews.admin_response is 'Admin response: {message, respondedBy, respondedAt}';

create index idx_reviews_product on product_reviews (product_id, is_approved, is_hidden, created_at desc);
create index idx_reviews_user on product_reviews (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2.11. WISHLISTS
-- ---------------------------------------------------------------------------
-- Named wishlists per user with items stored as JSON for flexibility.
-- A user can have multiple wishlists but each must have a unique name.
-- ---------------------------------------------------------------------------
create table if not exists wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  name        text not null default 'My Wishlist',
  is_default  boolean not null default false,
  items       jsonb not null default '[]'::jsonb,
  item_count  integer not null default 0,
  is_deleted  boolean not null default false,
  deleted_at  timestamptz,
  deleted_by  uuid,
  created_by  uuid,
  updated_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint chk_wishlists_item_count check (item_count >= 0),
  unique(user_id, name),
  constraint chk_wishlists_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column wishlists.items is 'Array of {productId, variantId, addedAt, note} objects';

create index idx_wishlists_user on wishlists (user_id, is_default, is_deleted);

-- ---------------------------------------------------------------------------
-- 2.12. CARTS
-- ---------------------------------------------------------------------------
-- Shopping carts can belong to authenticated users (by user_id) or
-- guest sessions (by session_id). Partial unique indexes ensure only one
-- active cart per user or session at any time.
-- ---------------------------------------------------------------------------
create table if not exists carts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references users(id) on delete cascade,
  session_id          text,
  status              cart_status not null default 'ACTIVE',
  coupon_code         text,
  coupon_id           uuid,
  currency            text not null default 'USD',
  subtotal            numeric(12,2) not null default 0,
  discount            numeric(12,2) not null default 0,
  shipping            numeric(12,2) not null default 0,
  tax                 numeric(12,2) not null default 0,
  total               numeric(12,2) not null default 0,
  item_count          integer not null default 0,
  expires_at          timestamptz,
  converted_order_id  uuid,
  is_deleted          boolean not null default false,
  deleted_at          timestamptz,
  deleted_by          uuid,
  created_by          uuid,
  updated_by          uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint chk_carts_pricing check (subtotal >= 0 and discount >= 0 and shipping >= 0 and tax >= 0 and total >= 0),
  constraint chk_carts_item_count check (item_count >= 0),
  constraint chk_carts_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on table carts is 'Shopping carts for authenticated users or guest sessions';

-- Only one active cart per authenticated user
create unique index idx_carts_active_user on carts (user_id, status)
  where user_id is not null and status = 'ACTIVE' and is_deleted = false;

-- Only one active cart per guest session
create unique index idx_carts_active_session on carts (session_id, status)
  where session_id is not null and status = 'ACTIVE' and is_deleted = false;

-- ---------------------------------------------------------------------------
-- 2.13. CART ITEMS
-- ---------------------------------------------------------------------------
-- Line items within a cart. Unique on (cart_id, variant_id) to prevent
-- duplicate entries for the same variant.
-- ---------------------------------------------------------------------------
create table if not exists cart_items (
  id            uuid primary key default gen_random_uuid(),
  cart_id       uuid not null references carts(id) on delete cascade,
  product_id    uuid not null references products(id) on delete cascade,
  variant_id    uuid not null references product_variants(id) on delete cascade,
  quantity      integer not null,
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

  constraint chk_cart_items_quantity check (quantity >= 1 and quantity <= 99),
  constraint chk_cart_items_pricing check (unit_price >= 0 and line_total >= 0),
  unique(cart_id, variant_id),
  constraint chk_cart_items_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

create index idx_cart_items_cart on cart_items (cart_id, is_deleted);

-- ---------------------------------------------------------------------------
-- 2.14. ORDERS
-- ---------------------------------------------------------------------------
-- Customer orders with payment, shipping, pricing, and delivery tracking
-- all stored as JSON snapshots for historical accuracy.
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique,
  user_id             uuid not null references users(id) on delete restrict,
  status              order_status not null default 'PENDING',
  payment             jsonb not null default '{"method":"COD","status":"PENDING","transactionId":null,"gatewayResponse":null,"paidAt":null,"refundedAt":null,"refundAmount":0}'::jsonb,
  shipping_address    jsonb not null default '{}'::jsonb,
  billing_address     jsonb,
  shipping_address_id uuid,
  pricing             jsonb not null default '{"subtotal":0,"discount":0,"shipping":0,"tax":0,"total":0,"currency":"USD"}'::jsonb,
  coupon_id           uuid,
  coupon_code         text,
  delivery            jsonb not null default '{}'::jsonb,
  customer_notes      text not null default '',
  admin_notes         text not null default '',
  cancel_reason       text,
  cancelled_at        timestamptz,
  vendor_id           uuid,
  is_archived         boolean not null default false,
  is_deleted          boolean not null default false,
  deleted_at          timestamptz,
  deleted_by          uuid,
  created_by          uuid,
  updated_by          uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint chk_orders_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column orders.payment is 'Payment details snapshot: {method, status, transactionId, gatewayResponse, paidAt, refundedAt, refundAmount}';
comment on column orders.shipping_address is 'Snapshot of the shipping address at time of order';
comment on column orders.pricing is 'Pricing snapshot: {subtotal, discount, shipping, tax, total, currency}';
comment on column orders.delivery is 'Delivery tracking: {agentId, assignedAt, estimatedDeliveryAt, deliveredAt, deliveryNotes}';

create index idx_orders_user on orders (user_id, created_at desc);
create index idx_orders_status on orders (status, created_at desc);
create index idx_orders_number on orders (order_number);
create index idx_orders_created on orders (created_at desc);

-- ---------------------------------------------------------------------------
-- 2.15. ORDER ITEMS
-- ---------------------------------------------------------------------------
-- Individual line items within an order with their own status tracking
-- for granular fulfillment management.
-- ---------------------------------------------------------------------------
create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid not null references products(id) on delete restrict,
  variant_id    uuid not null references product_variants(id) on delete restrict,
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
  status        order_item_status not null default 'PENDING',
  vendor_id     uuid,
  warehouse_id  uuid,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz,
  deleted_by    uuid,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint chk_order_items_quantity check (quantity > 0),
  constraint chk_order_items_pricing check (unit_price >= 0 and discount >= 0 and tax >= 0 and line_total >= 0),
  constraint chk_order_items_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column order_items.status is 'Per-item fulfillment status independent of overall order status';

create index idx_order_items_order on order_items (order_id, is_deleted);

-- ---------------------------------------------------------------------------
-- 2.16. ORDER TRACKING
-- ---------------------------------------------------------------------------
-- Immutable event log capturing every status change in the order lifecycle
-- for full auditability and customer transparency.
-- ---------------------------------------------------------------------------
create table if not exists order_tracking (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  status          order_status not null,
  title           text not null,
  message         text not null default '',
  location        jsonb,
  location_label  text not null default '',
  source          tracking_event_source not null default 'SYSTEM',
  metadata        jsonb not null default '{}'::jsonb,
  created_by      uuid,
  created_at      timestamptz not null default now()
);

comment on table order_tracking is 'Immutable audit log of all order status changes';

create index idx_tracking_order on order_tracking (order_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2.17. NOTIFICATIONS
-- ---------------------------------------------------------------------------
-- Multi-channel notifications (in-app, push, email, SMS) with delivery
-- status tracking and expiration support.
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  type              notification_type not null,
  title             text not null,
  body              text not null,
  data              jsonb not null default '{}'::jsonb,
  channels          notification_channel[] not null default '{IN_APP}',
  delivery_status   notification_delivery_status not null default 'PENDING',
  is_read           boolean not null default false,
  read_at           timestamptz,
  sent_at           timestamptz,
  expires_at        timestamptz,
  failure_reason    text,
  created_at        timestamptz not null default now()
);

comment on column notifications.channels is 'Array of delivery channels this notification should be sent through';

create index idx_notifications_user on notifications (user_id, is_read, created_at desc);
create index idx_notifications_delivery on notifications (delivery_status, created_at);

-- ---------------------------------------------------------------------------
-- 2.18. COUPONS
-- ---------------------------------------------------------------------------
-- Discount coupons with flexible applicability (all products, specific
-- categories, or specific products), usage limits, and date ranges.
-- ---------------------------------------------------------------------------
create table if not exists coupons (
  id                        uuid primary key default gen_random_uuid(),
  code                      text not null unique,
  name                      text not null,
  description               text not null default '',
  type                      coupon_type not null,
  value                     numeric(12,2) not null,
  max_discount              numeric(12,2),
  min_order_amount          numeric(12,2) not null default 0,
  usage_limit               integer,
  usage_count               integer not null default 0,
  per_user_limit            integer not null default 1,
  applicability             coupon_applicability not null default 'ALL',
  applicable_category_ids   uuid[] not null default '{}',
  applicable_product_ids    uuid[] not null default '{}',
  start_date                timestamptz not null,
  end_date                  timestamptz not null,
  is_active                 boolean not null default true,
  vendor_id                 uuid,
  is_deleted                boolean not null default false,
  deleted_at                timestamptz,
  deleted_by                uuid,
  created_by                uuid,
  updated_by                uuid,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  constraint chk_coupons_value check (value > 0),
  constraint chk_coupons_max_discount check (max_discount is null or max_discount > 0),
  constraint chk_coupons_usage_count check (usage_count >= 0),
  constraint chk_coupons_per_user_limit check (per_user_limit > 0),
  constraint chk_coupons_dates check (end_date > start_date),
  constraint chk_coupons_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column coupons.applicable_category_ids is 'Category IDs this coupon applies to (only when applicability = CATEGORIES)';
comment on column coupons.applicable_product_ids is 'Product IDs this coupon applies to (only when applicability = PRODUCTS)';

create index idx_coupons_active on coupons (is_active, start_date, end_date, is_deleted);
create index idx_coupons_code on coupons (code) where is_deleted = false;

-- ---------------------------------------------------------------------------
-- 2.19. BANNERS
-- ---------------------------------------------------------------------------
-- Promotional banners with platform targeting, scheduling, and click tracking.
-- ---------------------------------------------------------------------------
create table if not exists banners (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  subtitle      text not null default '',
  image         text not null,
  mobile_image  text,
  link_type     banner_link_type not null default 'NONE',
  link_value    text,
  platform      banner_platform not null default 'ALL',
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
  updated_at    timestamptz not null default now(),

  constraint chk_banners_click_count check (click_count >= 0),
  constraint chk_banners_dates check (end_date is null or start_date is null or end_date > start_date),
  constraint chk_banners_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

create index idx_banners_active on banners (platform, position, is_active, sort_order, is_deleted);

-- ---------------------------------------------------------------------------
-- 2.20. SUPPORT TICKETS
-- ---------------------------------------------------------------------------
-- Customer support tickets with priority, assignment, and message history.
-- Messages stored as JSON array for atomicity simplicity.
-- ---------------------------------------------------------------------------
create table if not exists support_tickets (
  id                uuid primary key default gen_random_uuid(),
  ticket_number     text not null unique,
  user_id           uuid not null references users(id) on delete cascade,
  order_id          uuid,
  category          support_ticket_category not null,
  subject           text not null,
  priority          support_ticket_priority not null default 'MEDIUM',
  status            support_ticket_status not null default 'OPEN',
  assigned_to       uuid,
  messages          jsonb not null default '[]'::jsonb,
  message_count     integer not null default 0,
  last_message_at   timestamptz,
  resolved_at       timestamptz,
  closed_at         timestamptz,
  is_deleted        boolean not null default false,
  deleted_at        timestamptz,
  deleted_by        uuid,
  created_by        uuid,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint chk_tickets_message_count check (message_count >= 0),
  constraint chk_tickets_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column support_tickets.messages is 'Array of {senderId, senderRole, message, attachments, isInternal, createdAt} objects';

create index idx_tickets_user on support_tickets (user_id, status, created_at desc);
create index idx_tickets_assigned on support_tickets (assigned_to, status, priority);

-- ---------------------------------------------------------------------------
-- 2.21. AUDIT LOGS
-- ---------------------------------------------------------------------------
-- Immutable audit trail for all entity changes across the platform.
-- Insert-only: no updates or deletes should ever be performed on this table.
-- ---------------------------------------------------------------------------
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id   uuid not null,
  action      audit_action not null,
  actor_id    uuid,
  actor_role  text,
  changes     jsonb,
  ip_address  text,
  user_agent  text,
  request_id  text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

comment on table audit_logs is 'Immutable insert-only audit trail for all entity changes';
comment on column audit_logs.changes is 'Object with "before" and "after" representations of the changed entity';

create index idx_audit_entity on audit_logs (entity_type, entity_id, created_at desc);
create index idx_audit_actor on audit_logs (actor_id, created_at desc);
create index idx_audit_action on audit_logs (action, created_at desc);
create index idx_audit_created on audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- 2.22. SETTINGS
-- ---------------------------------------------------------------------------
-- Key-value configuration store with grouping, encryption flag, and
-- public visibility controls for frontend-exposed settings.
-- ---------------------------------------------------------------------------
create table if not exists settings (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique,
  value         jsonb not null,
  group_name    setting_group not null default 'GENERAL',
  description   text not null default '',
  is_public     boolean not null default false,
  is_encrypted  boolean not null default false,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz,
  deleted_by    uuid,
  created_by    uuid,
  updated_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint chk_settings_deleted_at check (
    (is_deleted = false and deleted_at is null) or
    (is_deleted = true and deleted_at is not null)
  )
);

comment on column settings.is_public is 'If true, this setting is exposed to frontend clients';
comment on column settings.is_encrypted is 'If true, the value should be encrypted at rest and decrypted in application code';

create index idx_settings_group on settings (group_name, is_public, is_deleted);

-- ---------------------------------------------------------------------------
-- 2.23. USER DEVICES
-- ---------------------------------------------------------------------------
-- Registered device tokens for push notification delivery.
-- ---------------------------------------------------------------------------
create table if not exists user_devices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  fcm_token   text not null unique,
  device_type device_platform not null default 'WEB',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_user_devices_user on user_devices (user_id, is_active);
create index idx_user_devices_token on user_devices (fcm_token) where is_active = true;

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables that contain user-specific data
alter table roles enable row level security;
alter table users enable row level security;
alter table web_users enable row level security;
alter table departments enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_reviews enable row level security;
alter table wishlists enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_tracking enable row level security;
alter table notifications enable row level security;
alter table coupons enable row level security;
alter table banners enable row level security;
alter table support_tickets enable row level security;
alter table audit_logs enable row level security;
alter table settings enable row level security;
alter table user_devices enable row level security;

-- ---------------------------------------------------------------------------
-- 3.1. Helper functions for RLS policies
-- ---------------------------------------------------------------------------

-- Helper to get the current user role from the users table
-- Since the app uses self-contained auth (not Supabase Auth), the
-- application sets a session variable 'app.current_user_id' on connection.
create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid;
$$;

create or replace function public.current_user_role()
returns role_name
language sql
stable
as $$
  select u.role_id::text::role_name
  from users u
  where u.id = public.current_user_id()
    and u.is_deleted = false;
$$;

-- Check if current user has admin-level access
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from users u
    join roles r on r.id = u.role_id
    where u.id = public.current_user_id()
      and u.is_deleted = false
      and r.name in ('ADMIN', 'SUPER_ADMIN')
      and r.is_active = true
  );
$$;

-- Check if current user is SUPER_ADMIN
create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from users u
    join roles r on r.id = u.role_id
    where u.id = public.current_user_id()
      and u.is_deleted = false
      and r.name = 'SUPER_ADMIN'
      and r.is_active = true
  );
$$;

-- ---------------------------------------------------------------------------
-- 3.2. RLS Policies
-- ---------------------------------------------------------------------------

-- ---------- ROLES ----------
-- Only admins can manage roles; everyone can read active roles
create policy "Anyone can view active roles"
  on roles for select
  using (is_active = true and is_deleted = false);

create policy "Admins can insert roles"
  on roles for insert
  with check (public.is_admin());

create policy "Admins can update roles"
  on roles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Only super admins can delete roles"
  on roles for delete
  using (public.is_super_admin());

-- ---------- USERS ----------
-- Users can view/edit their own profile; admins can view/edit all
create policy "Users can view own profile"
  on users for select
  using (id = public.current_user_id() or public.is_admin());

create policy "Users can insert own profile"
  on users for insert
  with check (id = public.current_user_id() or public.is_admin());

create policy "Users can update own profile"
  on users for update
  using (id = public.current_user_id() or public.is_admin())
  with check (id = public.current_user_id() or public.is_admin());

create policy "Only admins can delete users (soft)"
  on users for delete
  using (public.is_admin());

-- ---------- WEB USERS ----------
-- Web users access their own data; admins can manage all
create policy "Web users can view own profile"
  on web_users for select
  using (id = public.current_user_id() or public.is_admin());

create policy "Web users can update own profile"
  on web_users for update
  using (id = public.current_user_id() or public.is_admin())
  with check (id = public.current_user_id() or public.is_admin());

create policy "Admins can manage web users"
  on web_users for insert
  with check (public.is_admin());

create policy "Admins can delete web users"
  on web_users for delete
  using (public.is_admin());

-- ---------- DEPARTMENTS ----------
-- Admins can manage; users can view active departments
create policy "Users can view active departments"
  on departments for select
  using (is_active = true and is_deleted = false);

create policy "Admins can manage departments"
  on departments for insert
  with check (public.is_admin());

create policy "Admins can update departments"
  on departments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete departments"
  on departments for delete
  using (public.is_admin());

-- ---------- ADDRESSES ----------
-- Users manage their own addresses; admins can manage all
create policy "Users can view own addresses"
  on addresses for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "Users can insert own addresses"
  on addresses for insert
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can update own addresses"
  on addresses for update
  using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can delete own addresses"
  on addresses for delete
  using (user_id = public.current_user_id() or public.is_admin());

-- ---------- CATEGORIES ----------
-- Public read for active categories; admin write
create policy "Anyone can view active categories"
  on categories for select
  using (is_active = true and is_deleted = false);

create policy "Admins can manage categories"
  on categories for insert
  with check (public.is_admin());

create policy "Admins can update categories"
  on categories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete categories"
  on categories for delete
  using (public.is_admin());

-- ---------- SUBCATEGORIES ----------
create policy "Anyone can view active subcategories"
  on subcategories for select
  using (is_active = true and is_deleted = false);

create policy "Admins can manage subcategories"
  on subcategories for insert
  with check (public.is_admin());

create policy "Admins can update subcategories"
  on subcategories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete subcategories"
  on subcategories for delete
  using (public.is_admin());

-- ---------- PRODUCTS ----------
-- Public read for published products; admin write
create policy "Anyone can view published products"
  on products for select
  using (status = 'PUBLISHED' and is_deleted = false);

create policy "Admins can view all products"
  on products for select
  using (public.is_admin());

create policy "Admins can insert products"
  on products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on products for delete
  using (public.is_admin());

-- ---------- PRODUCT VARIANTS ----------
create policy "Anyone can view active variants of published products"
  on product_variants for select
  using (is_active = true and is_deleted = false);

create policy "Admins can view all variants"
  on product_variants for select
  using (public.is_admin());

create policy "Admins can manage variants"
  on product_variants for insert
  with check (public.is_admin());

create policy "Admins can update variants"
  on product_variants for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete variants"
  on product_variants for delete
  using (public.is_admin());

-- ---------- PRODUCT REVIEWS ----------
-- Users can view approved reviews; their own unapproved; admins can view all
create policy "Anyone can view approved reviews"
  on product_reviews for select
  using (is_approved = true and is_hidden = false and is_deleted = false);

create policy "Users can view own reviews"
  on product_reviews for select
  using (user_id = public.current_user_id());

create policy "Admins can view all reviews"
  on product_reviews for select
  using (public.is_admin());

create policy "Users can create own reviews"
  on product_reviews for insert
  with check (user_id = public.current_user_id());

create policy "Users can update own reviews"
  on product_reviews for update
  using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Admins can delete any review"
  on product_reviews for delete
  using (public.is_admin());

create policy "Users can delete own reviews"
  on product_reviews for delete
  using (user_id = public.current_user_id());

-- ---------- WISHLISTS ----------
create policy "Users can view own wishlists"
  on wishlists for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "Users can create own wishlists"
  on wishlists for insert
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can update own wishlists"
  on wishlists for update
  using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can delete own wishlists"
  on wishlists for delete
  using (user_id = public.current_user_id() or public.is_admin());

-- ---------- CARTS ----------
create policy "Users can view own carts"
  on carts for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "Users can create own carts"
  on carts for insert
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can update own carts"
  on carts for update
  using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can delete own carts"
  on carts for delete
  using (user_id = public.current_user_id() or public.is_admin());

-- ---------- CART ITEMS ----------
create policy "Users can view own cart items"
  on cart_items for select
  using (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id
        and (c.user_id = public.current_user_id() or public.is_admin())
    )
  );

create policy "Users can insert own cart items"
  on cart_items for insert
  with check (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id
        and (c.user_id = public.current_user_id() or public.is_admin())
    )
  );

create policy "Users can update own cart items"
  on cart_items for update
  using (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id
        and (c.user_id = public.current_user_id() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id
        and (c.user_id = public.current_user_id() or public.is_admin())
    )
  );

create policy "Users can delete own cart items"
  on cart_items for delete
  using (
    exists (
      select 1 from carts c
      where c.id = cart_items.cart_id
        and (c.user_id = public.current_user_id() or public.is_admin())
    )
  );

-- ---------- ORDERS ----------
create policy "Users can view own orders"
  on orders for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "Users can create own orders"
  on orders for insert
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can update own orders"
  on orders for update
  using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Admins can delete orders"
  on orders for delete
  using (public.is_admin());

-- ---------- ORDER ITEMS ----------
create policy "Users can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (o.user_id = public.current_user_id() or public.is_admin())
    )
  );

create policy "Admins can manage order items"
  on order_items for insert
  with check (public.is_admin());

create policy "Admins can update order items"
  on order_items for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete order items"
  on order_items for delete
  using (public.is_admin());

-- ---------- ORDER TRACKING ----------
create policy "Users can view own order tracking"
  on order_tracking for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_tracking.order_id
        and (o.user_id = public.current_user_id() or public.is_admin())
    )
  );

create policy "Admins can insert order tracking"
  on order_tracking for insert
  with check (public.is_admin());

-- ---------- NOTIFICATIONS ----------
create policy "Users can view own notifications"
  on notifications for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "System/admins can insert notifications"
  on notifications for insert
  with check (public.is_admin());

create policy "Users can mark own notifications as read"
  on notifications for update
  using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- ---------- COUPONS ----------
create policy "Anyone can view active coupons"
  on coupons for select
  using (is_active = true and is_deleted = false and start_date <= now() and end_date >= now());

create policy "Admins can view all coupons"
  on coupons for select
  using (public.is_admin());

create policy "Admins can manage coupons"
  on coupons for insert
  with check (public.is_admin());

create policy "Admins can update coupons"
  on coupons for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete coupons"
  on coupons for delete
  using (public.is_admin());

-- ---------- BANNERS ----------
create policy "Anyone can view active banners"
  on banners for select
  using (is_active = true and is_deleted = false);

create policy "Admins can manage banners"
  on banners for insert
  with check (public.is_admin());

create policy "Admins can update banners"
  on banners for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete banners"
  on banners for delete
  using (public.is_admin());

-- ---------- SUPPORT TICKETS ----------
create policy "Users can view own tickets"
  on support_tickets for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "Users can create own tickets"
  on support_tickets for insert
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can update own tickets"
  on support_tickets for update
  using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Admins can delete tickets"
  on support_tickets for delete
  using (public.is_admin());

-- ---------- AUDIT LOGS ----------
-- Audit logs are insert-only; only admins can read them
create policy "Admins can view audit logs"
  on audit_logs for select
  using (public.is_admin());

create policy "System can insert audit logs"
  on audit_logs for insert
  with check (public.is_admin());

-- ---------- SETTINGS ----------
create policy "Anyone can view public settings"
  on settings for select
  using (is_public = true and is_deleted = false);

create policy "Admins can view all settings"
  on settings for select
  using (public.is_admin());

create policy "Admins can manage settings"
  on settings for insert
  with check (public.is_admin());

create policy "Admins can update settings"
  on settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete settings"
  on settings for delete
  using (public.is_admin());

-- ---------- USER DEVICES ----------
create policy "Users can view own devices"
  on user_devices for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "Users can register own devices"
  on user_devices for insert
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can update own devices"
  on user_devices for update
  using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

create policy "Users can delete own devices"
  on user_devices for delete
  using (user_id = public.current_user_id() or public.is_admin());

-- =============================================================================
-- 4. SEED DATA
-- =============================================================================

-- Insert default system roles
insert into roles (name, display_name, description, is_system_role, is_active) values
  ('USER', 'User', 'Regular customer with standard shopping privileges', true, true),
  ('ADMIN', 'Admin', 'Administrator with access to management features', true, true),
  ('SUPER_ADMIN', 'Super Admin', 'Super administrator with full system access', true, true),
  ('DELIVERY', 'Delivery', 'Delivery agent responsible for order fulfillment', true, true)
on conflict (name) do nothing;

-- =============================================================================
-- 5. TRIGGER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp on row modification
create or replace function trigger_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to all tables that have an updated_at column
create trigger set_updated_at before update on roles
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on users
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on web_users
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on departments
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on addresses
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on categories
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on subcategories
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on products
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on product_variants
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on product_reviews
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on wishlists
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on carts
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on cart_items
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on orders
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on order_items
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on coupons
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on banners
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on support_tickets
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on settings
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on user_devices
  for each row execute function trigger_set_updated_at();

create or replace function public.adjust_stock(
  p_product_id uuid,
  p_quantity integer
) returns void
language sql
security definer
as $$
  update products
  set stock = greatest(0, stock - p_quantity),
      total_sold = total_sold + p_quantity,
      updated_at = now()
  where id = p_product_id;
$$;