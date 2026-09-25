-- ===================================================
-- AURORA DESTINY AI — MIGRATION 011: PROFILE IDEMPOTENCY UNIQUE CONSTRAINTS
-- Guarantees atomic, tamper-proof idempotency across concurrent creation requests
-- ===================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_profile_id VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_idempotency
  ON profiles (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_client_id
  ON profiles (user_id, client_profile_id)
  WHERE client_profile_id IS NOT NULL;
