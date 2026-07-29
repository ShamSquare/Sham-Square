-- =============================================================================
-- Migration: Add has_sizes, sizes, has_colors, colors columns to products table
-- =============================================================================
-- Run this in your Supabase SQL Editor if you already have the products table
-- created from an older migration that didn't include these columns.
-- =============================================================================

do $$
begin
  -- Add has_sizes column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'has_sizes'
  ) then
    alter table products add column has_sizes boolean not null default false;
  end if;

  -- Add sizes column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'sizes'
  ) then
    alter table products add column sizes text[] not null default '{}';
  end if;

  -- Add has_colors column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'has_colors'
  ) then
    alter table products add column has_colors boolean not null default false;
  end if;

  -- Add colors column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'colors'
  ) then
    alter table products add column colors text[] not null default '{}';
  end if;
end $$;