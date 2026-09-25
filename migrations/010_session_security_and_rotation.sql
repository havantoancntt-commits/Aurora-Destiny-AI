-- ===================================================
-- AURORA DESTINY AI — MIGRATION 010: SESSIONS & TOKEN FAMILIES
-- Adds client_type, refresh_token_hash, token_family, and revoked_at
-- ===================================================

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS client_type VARCHAR(16) DEFAULT 'browser';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(64);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS token_family VARCHAR(64);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sessions_refresh_hash ON sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_family ON sessions(token_family);
CREATE INDEX IF NOT EXISTS idx_sessions_revoked ON sessions(revoked_at);
