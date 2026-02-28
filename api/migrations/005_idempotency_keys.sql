-- Migration: 005_idempotency_keys
-- Purpose: Prevent duplicate transactions from double-taps / slow network retries
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Index for fast duplicate-check lookups
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency
  ON transactions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
