-- ============================================================================
-- Migration: add_addresses_table
-- Description: Creates the addresses table and links it to orders.
-- 
-- Requirements:
--   - Link addresses to users
--   - Allow multiple saved addresses per user
--   - Support all address fields (full_name, phone, country, city, area, etc.)
--   - Default address flag per user
--   - Link address to order via address_id FK
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Create the addresses table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Contact information
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(50) NOT NULL,

    -- Location hierarchy
    country         VARCHAR(100) NOT NULL DEFAULT '',
    city            VARCHAR(100) NOT NULL DEFAULT '',
    area            VARCHAR(100) NOT NULL DEFAULT '',
    street          VARCHAR(255) NOT NULL DEFAULT '',
    building        VARCHAR(100) NOT NULL DEFAULT '',
    floor           VARCHAR(50)  NOT NULL DEFAULT '',
    apartment       VARCHAR(50)  NOT NULL DEFAULT '',
    postal_code     VARCHAR(20)  NOT NULL DEFAULT '',

    -- Optional fields
    notes           TEXT         NOT NULL DEFAULT '',
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,

    -- Flags
    is_default      BOOLEAN     NOT NULL DEFAULT false,

    -- Soft delete & audit (matching project convention)
    is_deleted      BOOLEAN     NOT NULL DEFAULT false,
    deleted_at      TIMESTAMPTZ,
    deleted_by      UUID REFERENCES users(id),
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. Indexes for performance
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_addresses_user_id      ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default   ON addresses(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_addresses_is_deleted   ON addresses(is_deleted) WHERE is_deleted = false;

-- ---------------------------------------------------------------------------
-- 3. Add address_id to orders table (if not already present)
-- ---------------------------------------------------------------------------
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES addresses(id);

CREATE INDEX IF NOT EXISTS idx_orders_address_id ON orders(address_id);

-- ---------------------------------------------------------------------------
-- 4. Trigger to auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_addresses_updated_at'
    ) THEN
        CREATE TRIGGER set_addresses_updated_at
            BEFORE UPDATE ON addresses
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$;
