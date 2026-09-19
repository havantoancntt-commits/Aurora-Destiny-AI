-- ===================================================
-- AURORA DESTINY AI — MIGRATION 009: PATRONS & PAYMENT INTEGRITY
-- Enterprise schema for verified patrons, pledges & anti-replay webhooks
-- ===================================================

CREATE TABLE IF NOT EXISTS patrons (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    tier VARCHAR(32) NOT NULL DEFAULT 'tam_tinh',
    amount NUMERIC(15, 2),
    message TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    verification_type VARCHAR(64) NOT NULL DEFAULT 'UNVERIFIED',
    seal_hash VARCHAR(64) NOT NULL,
    payment_reference VARCHAR(128),
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_patrons_status ON patrons(status);
CREATE INDEX IF NOT EXISTS idx_patrons_created_at ON patrons(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patrons_payment_reference ON patrons(payment_reference) WHERE payment_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id VARCHAR(64) PRIMARY KEY,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    provider VARCHAR(64) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_idempotency ON payment_webhook_events(idempotency_key);
