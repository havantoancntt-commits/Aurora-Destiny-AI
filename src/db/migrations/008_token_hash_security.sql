-- ===================================================
-- AURORA DESTINY AI — MIGRATION 008: TOKEN HASH SECURITY
-- Store SHA-256 hashes instead of raw session/reset tokens
-- ===================================================

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64);
CREATE INDEX IF NOT EXISTS idx_reset_token_hash ON password_reset_tokens(token_hash);
