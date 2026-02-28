-- Migration: 002_recurring_transactions
-- Purpose: Add recurring transaction support
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================================
-- 1. ADD COLUMNS TO transactions TABLE
-- ============================================================
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS is_recurring        BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_interval TEXT        CHECK (recurrence_interval IN ('daily', 'weekly', 'monthly')),
  ADD COLUMN IF NOT EXISTS next_recurrence_date DATE,
  ADD COLUMN IF NOT EXISTS parent_recurring_id UUID        REFERENCES transactions(id) ON DELETE SET NULL;

-- Index for the scheduled Edge Function to quickly find due recurring transactions
CREATE INDEX IF NOT EXISTS idx_transactions_next_recurrence
  ON transactions (next_recurrence_date)
  WHERE is_recurring = TRUE AND next_recurrence_date IS NOT NULL;
