ALTER TABLE web_users ADD COLUMN IF NOT EXISTS role_type text NOT NULL DEFAULT 'user';
ALTER TABLE web_users ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id) ON DELETE SET NULL;