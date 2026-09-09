-- ===================================================
-- AURORA DESTINY AI — MIGRATION 001: INITIAL SCHEMA
-- Users & Preferences
-- ===================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER',
    subscription_tier VARCHAR(32) NOT NULL DEFAULT 'Free',
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(32) NOT NULL DEFAULT 'dark',
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    enable_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    enable_ai_learning BOOLEAN NOT NULL DEFAULT FALSE,
    anonymize_data BOOLEAN NOT NULL DEFAULT FALSE,
    scientific_confidence_mode BOOLEAN NOT NULL DEFAULT TRUE,
    high_contrast BOOLEAN NOT NULL DEFAULT FALSE
);
