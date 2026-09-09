-- ===================================================
-- AURORA DESTINY AI — MIGRATION 005: HISTORICAL EVENTS & BACKTEST
-- ===================================================

CREATE TABLE IF NOT EXISTS historical_events (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    impact VARCHAR(64) NOT NULL,
    intensity INTEGER NOT NULL,
    description TEXT,
    evidence_note TEXT,
    user_confidence INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_events_profile ON historical_events(profile_id);

CREATE TABLE IF NOT EXISTS backtest_results (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculation_id VARCHAR(64) REFERENCES calculations(id) ON DELETE SET NULL,
    destiny_consistency_score INTEGER NOT NULL,
    historical_hit_rate INTEGER NOT NULL DEFAULT 0,
    statistical_disclaimer TEXT,
    confidence_band VARCHAR(64) NOT NULL,
    total_events_analyzed INTEGER NOT NULL,
    matched_events_count INTEGER NOT NULL,
    divergent_events_count INTEGER NOT NULL,
    neutral_events_count INTEGER NOT NULL,
    comparisons JSONB NOT NULL,
    strengths_summary JSONB NOT NULL,
    anomalies_summary JSONB NOT NULL,
    uncertainty_factors JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_backtest_profile ON backtest_results(profile_id);
