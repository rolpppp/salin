-- Migration: 004_semester_budgets
-- Purpose: Extend budgets table to support semester-length budget periods
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS period_type TEXT     NOT NULL DEFAULT 'monthly'
    CHECK (period_type IN ('monthly', 'semester')),
  ADD COLUMN IF NOT EXISTS start_date  DATE,
  ADD COLUMN IF NOT EXISTS end_date    DATE;

-- Index for range-based budget queries
CREATE INDEX IF NOT EXISTS idx_budgets_date_range
  ON budgets (user_id, start_date, end_date)
  WHERE start_date IS NOT NULL;
