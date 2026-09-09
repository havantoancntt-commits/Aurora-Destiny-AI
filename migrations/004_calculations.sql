-- ===================================================
-- AURORA DESTINY AI — MIGRATION 004: CALCULATIONS
-- ===================================================

CREATE TABLE IF NOT EXISTS calculations (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculation_version VARCHAR(32) NOT NULL,
    astrology_rules_version VARCHAR(32) NOT NULL,
    analysis_model_version VARCHAR(32) NOT NULL,
    input_snapshot JSONB NOT NULL,
    bazi JSONB NOT NULL,
    ziwei JSONB NOT NULL,
    decades JSONB NOT NULL,
    annual_transits JSONB NOT NULL,
    confidence JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_calculations_profile ON calculations(profile_id);
