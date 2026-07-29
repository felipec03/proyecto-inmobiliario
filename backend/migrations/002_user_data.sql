-- MiLocal Migration 002: User data tables and property ownership
-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_type VARCHAR(20) NOT NULL,
    step INT NOT NULL DEFAULT 0,
    data JSONB NOT NULL DEFAULT '{}',
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    rubro VARCHAR(50),
    max_budget DECIMAL(12,2),
    min_size INT,
    max_size INT,
    commune_id VARCHAR(5),
    preferred_location TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Owner ID on properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_id VARCHAR(36) REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
