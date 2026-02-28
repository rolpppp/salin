# Changelog

All notable changes to **salin** are documented here. Entries follow the format:
`[vX.Y.Z] YYYY-MM-DD — Feature Title`.

---

## [Unreleased]

### [v2.1.0] — Supabase Realtime
- Added `/api/config` endpoint for public Supabase credentials
- Modified login, register, and OAuth callbacks to return `supabase_access_token`
- Added `getRealtimeToken` / `setRealtimeToken` to storage utility
- Created `client/public/src/js/realtime.js` — subscribes to `transactions` and `accounts` table changes via Supabase Realtime, dispatches `salin:realtime` events
- Dashboard and transaction pages re-render on realtime events (no polling)

### [v2.2.0] — Server-side Pagination
- `GET /api/transactions` now accepts `page` (default 1) and `limit` (default 25) query params
- Backend uses Supabase `range()` — only fetches the rows for the current page
- Response shape: `{ data, total, page, limit, totalPages }`
- Transaction page re-fetches per page click instead of slicing a local array

### [v2.3.0] — Atomic Balance Updates via DB Triggers
- Applied Supabase migration: Postgres triggers on `transactions` table handle account balance updates atomically on INSERT, UPDATE, and DELETE
- Removed fragile multi-step balance update code from `transaction.controller.js` (create, update, delete methods)
- Balance is now always consistent even if the API crashes mid-operation

### [v2.4.0] — Recurring Transactions
- Added `is_recurring` (boolean) and `recurrence_interval` (`daily`/`weekly`/`monthly`) columns to `transactions` table
- `next_recurrence_date` column tracks when the next instance should be created
- Transaction form updated with "Repeat" toggle and interval selector
- Supabase Edge Function `process-recurring` runs on schedule to auto-create due transactions

### [v2.5.0] — Zod Validation Middleware
- Installed `zod` as API dependency
- Created `api/_app/middleware/validate.js` — reusable schema validation middleware
- Created `api/_app/schemas/` with schemas for: transaction, account, category, budget, auth
- Applied validation middleware to all mutation routes (POST/PUT) across all controllers
- Validation errors return `{ error: "Validation failed", issues: [...] }` with field-level details

### [v2.6.0] — Offline Queue with Background Sync
- Created `client/public/src/js/offline-queue.js` — IndexedDB-backed queue for failed mutations
- Updated `sw.js` to handle `Background Sync` API — registers sync tags and replays queued requests on reconnect
- Updated `api.js` `request()` to detect `navigator.onLine === false` and queue mutations instead of failing
- Added online/offline banner (`#offline-banner`) shown/hidden via `online`/`offline` window events
- Cache version bumped to `salin-cache-v3`

### [v2.7.0] — Push Notifications for Budget Alerts
- Added VAPID key generation (stored in env: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`)
- New API route `POST /api/push/subscribe` — stores push subscription per user
- New `push_subscriptions` table in Supabase
- Budget alert fires when spending crosses 80% and 100% of monthly budget
- Frontend requests notification permission on dashboard load (once, stored in localStorage)

### [v2.8.0] — Quick-Add Floating Action Button (FAB)
- Added persistent `+` FAB injected by `app.js` after every authenticated page render
- FAB opens a compact transaction modal with AI parse textarea as primary input
- Visible on dashboard, transactions, accounts, and categories pages
- CSS: `client/public/src/styles/main.css` — `.fab` and `.fab-modal` classes

### [v2.9.0] — Semester Budgets
- Added `period_type` (`monthly`/`semester`), `start_date`, `end_date` columns to `budgets` table
- Budget controller `getCurrentBudget` queries by date range, supporting both period types
- `BudgetForm.js` updated with period type selector; semester mode shows date range pickers
- Dashboard budget card displays period label ("Monthly" / "Semester")

### [v2.10.0] — Rate Limiting
- Installed `express-rate-limit`
- Global limit: 100 requests per 15 minutes per IP
- Strict limit on `POST /api/auth/login` and `POST /api/auth/register`: 10 requests per 15 minutes
- Strict limit on `POST /api/parse`: 20 requests per 15 minutes (Gemini cost protection)

### [v2.11.0] — Idempotency Keys
- Added `idempotency_key` (UUID, unique) column to `transactions` table
- Client generates a UUID v4 before each transaction form submit
- Backend checks for existing key before INSERT — returns existing transaction if duplicate
- Prevents double-submission from slow network + impatient double-tap

### [v2.12.0] — Skeleton Loaders
- Added skeleton loader CSS (`@keyframes shimmer`, `.skeleton`, `.skeleton-*` classes) to `variables.css`
- Dashboard and transaction page show skeleton HTML matching final layout during data fetch
- Replaces plain `loading-spinner` div for better perceived performance

### [v2.13.0] — Expense Splitting
- Added `split_with` (text, nullable) and `split_amount` (numeric, nullable) to `transactions` table
- Transaction form has optional "Split expense" section (name + share amount)
- Transaction list shows split badge on rows with split data
- Dashboard recent transactions show split indicator

---

## [v2.0.0] — 2025 (Pre-improvement baseline)
Features at the start of the improvement cycle:
- JWT auth (email/password + Google OAuth)
- Multi-account balance tracking
- Transaction CRUD with filtering, sorting, client-side pagination
- Monthly budgets with exceeded warnings
- AI-powered transaction parsing (Google Gemini)
- Category management with soft-delete
- Account management with archive/soft-delete
- Onboarding email on signup
- "Remember Me" persistent sessions
- PWA with basic service worker caching
