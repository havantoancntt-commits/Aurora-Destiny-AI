-- ===================================================
-- AURORA DESTINY AI — MIGRATION 007: PERFORMANCE COMPOSITE INDEXES
-- Optimizes historical event sorting, profile calculations, and chat queries
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_events_profile_year ON historical_events(profile_id, year ASC);
CREATE INDEX IF NOT EXISTS idx_chat_profile_timestamp ON chat_messages(profile_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_calculations_profile_timestamp ON calculations(profile_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_primary ON profiles(user_id, is_primary);
