-- Migration: 006_expense_splitting
-- Purpose: Personal tracking of split expenses (e.g., shared rent, group food orders)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
--
-- NOTE: This is NOT a multi-user feature. It lets a student record
-- their net share of a shared expense without needing their roommate
-- to also use the app.

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS split_with   TEXT,
  ADD COLUMN IF NOT EXISTS split_amount NUMERIC(12, 2);
