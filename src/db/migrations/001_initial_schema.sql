-- ==============================================================================
-- AURORA DESTINY AI — POSTGRESQL PRODUCTION DDL MIGRATION (001_initial_schema.sql)
-- Complete schema with UUID primary keys, Foreign Keys with ON DELETE CASCADE,
-- Indexes, Constraints, and Timestamps.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN')),
    subscription_tier VARCHAR(32) NOT NULL DEFAULT 'Free' CHECK (subscription_tier IN ('Free', 'Premium', 'Pro', 'Enterprise')),
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) NOT NULL DEFAULT 'dark',
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    enable_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    enable_ai_learning BOOLEAN NOT NULL DEFAULT FALSE,
    anonymize_data BOOLEAN NOT NULL DEFAULT FALSE,
    scientific_confidence_mode BOOLEAN NOT NULL DEFAULT TRUE,
    high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_seed VARCHAR(128) NOT NULL,
    behavioral_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 4. BIRTH DATA
CREATE TABLE IF NOT EXISTS birth_data (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    solar_year INT NOT NULL CHECK (solar_year BETWEEN 1900 AND 2100),
    solar_month INT NOT NULL CHECK (solar_month BETWEEN 1 AND 12),
    solar_day INT NOT NULL CHECK (solar_day BETWEEN 1 AND 31),
    solar_hour INT NOT NULL CHECK (solar_hour BETWEEN 0 AND 23),
    solar_minute INT NOT NULL CHECK (solar_minute BETWEEN 0 AND 59),
    has_exact_hour BOOLEAN NOT NULL DEFAULT TRUE,
    lunar_year INT,
    lunar_month INT,
    lunar_day INT,
    is_leap_month BOOLEAN DEFAULT FALSE,
    birth_city VARCHAR(100) NOT NULL,
    birth_country VARCHAR(100) NOT NULL,
    timezone_offset NUMERIC(4, 2) NOT NULL DEFAULT 7.0,
    timezone_name VARCHAR(100) NOT NULL,
    gender VARCHAR(32) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other', 'PreferNotToSay')),
    calendar_system VARCHAR(16) NOT NULL DEFAULT 'solar' CHECK (calendar_system IN ('solar', 'lunar')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CALCULATIONS (Single Source of Truth)
CREATE TABLE IF NOT EXISTS calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculation_version VARCHAR(32) NOT NULL,
    astrology_rules_version VARCHAR(32) NOT NULL,
    analysis_model_version VARCHAR(32) NOT NULL,
    input_snapshot JSONB NOT NULL,
    bazi JSONB NOT NULL,
    ziwei JSONB NOT NULL,
    decades JSONB NOT NULL,
    annual_transits JSONB NOT NULL,
    confidence JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calculations_profile_id ON calculations(profile_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);

-- 6. HISTORICAL EVENTS (Retrospective Analysis)
CREATE TABLE IF NOT EXISTS historical_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    year INT NOT NULL CHECK (year BETWEEN 1920 AND 2100),
    month INT CHECK (month BETWEEN 1 AND 12),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(64) NOT NULL,
    impact VARCHAR(32) NOT NULL,
    intensity INT NOT NULL CHECK (intensity BETWEEN 1 AND 5),
    description TEXT,
    user_confidence INT NOT NULL DEFAULT 5 CHECK (user_confidence BETWEEN 1 AND 5),
    evidence_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_historical_events_profile_id ON historical_events(profile_id);

-- 7. BACKTEST RESULTS (Pattern Alignment Snapshot)
CREATE TABLE IF NOT EXISTS backtest_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculation_id UUID REFERENCES calculations(id) ON DELETE SET NULL,
    total_events_analyzed INT NOT NULL DEFAULT 0,
    destiny_consistency_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    matched_events_count INT NOT NULL DEFAULT 0,
    divergent_events_count INT NOT NULL DEFAULT 0,
    neutral_events_count INT NOT NULL DEFAULT 0,
    confidence_band VARCHAR(64) NOT NULL,
    comparisons JSONB NOT NULL DEFAULT '[]'::jsonb,
    strengths_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    anomalies_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    uncertainty_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_backtest_results_profile_id ON backtest_results(profile_id);

-- 8. CONVERSATIONS & CHAT MESSAGES
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT 'Destiny Analysis Session',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender VARCHAR(16) NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    confidence_score NUMERIC(5, 2),
    suggested_questions JSONB DEFAULT '[]'::jsonb,
    grounded_facts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_profile_id ON chat_messages(profile_id, created_at ASC);

-- 9. AUDIT LOGS (Security & Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    resource VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    ip_hash VARCHAR(64),
    status VARCHAR(32) NOT NULL,
    request_id VARCHAR(64),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- 10. FEATURE FLAGS
CREATE TABLE IF NOT EXISTS feature_flags (
    key VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
