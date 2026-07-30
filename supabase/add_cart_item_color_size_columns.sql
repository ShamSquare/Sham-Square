-- =============================================================================
-- Migration: Add selected_color and selected_size columns to cart_items
-- =============================================================================
-- Run this in your Supabase SQL Editor to add the missing variant columns
-- to the cart_items table so selected colors and sizes are persisted
-- through the cart → order conversion flow.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_name = 'cart_items'
      and column_name = 'selected_color'
  ) then
    alter table cart_items add column selected_color text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_name = 'cart_items'
      and column_name = 'selected_size'
  ) then
    alter table cart_items add column selected_size text;
  end if;
end $$;
