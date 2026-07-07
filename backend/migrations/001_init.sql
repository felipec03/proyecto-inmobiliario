-- MiLocal Database Initialization
-- Run on first deploy to set up the schema and seed data

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('entrepreneur', 'owner')),
    level INT DEFAULT 0 CHECK (level IN (0, 1)),
    sub_type VARCHAR(20) DEFAULT 'natural' CHECK (sub_type IN ('natural', 'juridica')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('identity', 'income', 'legal', 'property')),
    status VARCHAR(20) DEFAULT 'empty' CHECK (status IN ('empty', 'pending', 'verified')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CLP',
    sqm INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    lat DECIMAL(10,6),
    lng DECIMAL(10,6),
    image TEXT,
    description TEXT,
    has_gas BOOLEAN DEFAULT false,
    power_capacity VARCHAR(20) DEFAULT 'Básica',
    water_connection BOOLEAN DEFAULT false,
    grease_trap BOOLEAN DEFAULT false,
    frontage_size INT DEFAULT 0,
    foot_traffic VARCHAR(10) DEFAULT 'Bajo',
    permitted_uses TEXT[],
    nearby_pois TEXT[],
    past_business TEXT,
    renovation_needed TEXT,
    owner_notes TEXT,
    negotiable BOOLEAN DEFAULT false,
    neighborhood_insights TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches table (audit trail of calculated matches)
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    property_id VARCHAR(36) REFERENCES properties(id) ON DELETE CASCADE,
    rubro VARCHAR(50),
    score INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_permitted ON properties USING GIN (permitted_uses);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_property ON matches(property_id);
