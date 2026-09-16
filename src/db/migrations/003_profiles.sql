-- ===================================================
-- AURORA DESTINY AI — MIGRATION 003: PROFILES
-- ===================================================

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_seed VARCHAR(255),
    birth_data JSONB NOT NULL,
    behavioral_context JSONB NOT NULL,
    latest_calculation_id VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
