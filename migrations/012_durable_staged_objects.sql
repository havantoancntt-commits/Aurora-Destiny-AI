-- Migration 012: Durable Staged Objects for Serverless & Multi-Instance Object Storage
-- Replaces volatile local file storage with durable PostgreSQL row-level atomic storage

CREATE TABLE IF NOT EXISTS staged_objects (
  id VARCHAR(128) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(128),
  data BYTEA NOT NULL,
  content_type VARCHAR(128) NOT NULL DEFAULT 'application/pdf',
  size BIGINT NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  download_count INT NOT NULL DEFAULT 0,
  max_downloads INT NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staged_objects_expires ON staged_objects(expires_at);
CREATE INDEX IF NOT EXISTS idx_staged_objects_user ON staged_objects(user_id);
