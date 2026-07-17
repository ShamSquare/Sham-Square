-- name: up

-- Creates a dedicated table for website users (web users have a separate authentication system from mobile users)
-- This table is independent of the existing "users" table to avoid conflicts

CREATE TABLE IF NOT EXISTS web_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User identification
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  avatar text,
  phone text,
  
  -- User status and metadata
  role text NOT NULL DEFAULT 'USER',
  status text NOT NULL DEFAULT 'ACTIVE',
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  
  -- Soft delete tracking
  deleted_at timestamptz,
  
  -- Audit trail
  deleted_by uuid,
  created_by uuid,
  updated_by uuid,
  
  -- Timestamps for tracking user activity
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Soft delete functionality
  is_deleted boolean NOT NULL DEFAULT false,
  
  -- Version control for optimistic locking
  version integer NOT NULL DEFAULT 1
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_web_users_email ON web_users(email);
CREATE INDEX IF NOT EXISTS idx_web_users_status ON web_users(status);
CREATE INDEX IF NOT EXISTS idx_web_users_created_at ON web_users(created_at);
