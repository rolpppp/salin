-- Migration: 001_transaction_balance_triggers
-- Purpose: Atomic account balance updates via Postgres triggers
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
--
-- WHY: Previously, balance updates happened in application code as two separate
-- UPDATE calls. If the server crashed between them, data was left inconsistent.
-- DB triggers run inside the same transaction as the INSERT/UPDATE/DELETE,
-- so balance is always correct.

-- ============================================================
-- 1. TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Apply new transaction effect
    IF NEW.type = 'income' THEN
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    -- Reverse the original transaction effect
    IF OLD.type = 'income' THEN
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Step 1: Reverse the old transaction on the old account
    IF OLD.type = 'income' THEN
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    END IF;

    -- Step 2: Apply the new transaction on the new account
    IF NEW.type = 'income' THEN
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. DROP EXISTING TRIGGERS (idempotent re-run)
-- ============================================================
DROP TRIGGER IF EXISTS trg_transaction_insert ON transactions;
DROP TRIGGER IF EXISTS trg_transaction_delete ON transactions;
DROP TRIGGER IF EXISTS trg_transaction_update ON transactions;

-- ============================================================
-- 3. TRIGGERS
-- ============================================================

-- After INSERT: apply balance effect
CREATE TRIGGER trg_transaction_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();

-- After DELETE: reverse balance effect
CREATE TRIGGER trg_transaction_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();

-- After UPDATE: only fires when amount, type, or account_id changes
CREATE TRIGGER trg_transaction_update
  AFTER UPDATE OF amount, type, account_id ON transactions
  FOR EACH ROW
  WHEN (
    OLD.amount IS DISTINCT FROM NEW.amount OR
    OLD.type   IS DISTINCT FROM NEW.type   OR
    OLD.account_id IS DISTINCT FROM NEW.account_id
  )
  EXECUTE FUNCTION update_account_balance();
