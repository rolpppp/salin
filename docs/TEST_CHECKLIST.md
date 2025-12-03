# Comprehensive Test Checklist - salin Money Tracker

**Branch**: `feature/transaction-sorting-pagination`  
**Date**: December 4, 2025  
**Test Environment**: http://localhost:8081

## 🆕 New Features to Test (Priority)

### ✅ 1. Transaction Sorting & Pagination

- [ ] Click each column header (Date, Title, Amount, Account, Category)
- [ ] Verify sort indicators (↑/↓) appear and toggle
- [ ] Verify transactions reorder correctly
- [ ] Test pagination with 30+ transactions
- [ ] Click page numbers, Previous, Next buttons
- [ ] Verify shows 25 items per page
- [ ] Verify pagination info displays correctly
- [ ] Verify page changes work without resetting
- [ ] Test filtering + pagination together
- [ ] Test sorting + pagination together

### ✅ 2. Budget Delete Feature

- [ ] Set a budget, open budget form
- [ ] Verify "Delete Budget" button appears (red)
- [ ] Click delete, verify confirmation dialog
- [ ] Click "Cancel" - verify returns to form
- [ ] Click delete and confirm - verify success
- [ ] Verify dashboard updates to ₱0 / ₱0
- [ ] Test with no budget - verify no delete button

### ✅ 3. Budget Exceeded Warning

- [ ] Set budget ₱800, spend ₱820
- [ ] Verify alert banner appears at top
- [ ] Verify red left border on budget card
- [ ] Verify progress bar is red
- [ ] Verify "Used: 103%" displays
- [ ] Verify "Remaining: -₱20.00" in red
- [ ] Test within budget - verify green/blue colors
- [ ] Test at limit - verify no warning

### ✅ 4. Desktop Responsive Layout

- [ ] Test dashboard at 1024px+ width
- [ ] Verify 900px max-width centered layout
- [ ] Verify single-column vertical arrangement
- [ ] Test transaction table on desktop
- [ ] Verify all 7 columns visible
- [ ] Test all pages on desktop
- [ ] Verify proper spacing and readability

---

## Core Features Testing

**Modified Files**:

- `client/public/src/js/pages/transaction.js` (sorting/pagination)
- `client/public/src/js/components/BudgetForm.js` (delete)
- `client/public/src/js/pages/dashboard.js` (exceeded warning)
- `client/public/src/js/api.js` (deleteBudget API)
- `client/public/src/styles/main.css` (responsive/styles)

---

## 🔐 Authentication & User Management

### Login & Registration

- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Registration creates new user
- [ ] Forgot password sends reset email
- [ ] Reset password with token works
- [ ] Logout clears session and redirects to login

### User Profile

- [ ] GET `/api/user` returns user data with username from `public.users` table
- [ ] Username displays correctly on dashboard (from `public.users.username`)
- [ ] Fallback to email prefix works if username is null
- [ ] PUT `/api/user` updates username in `public.users` table
- [ ] Username update reflects immediately on dashboard

---

## 📊 Dashboard

### Data Loading

- [ ] Dashboard loads without errors
- [ ] Total balance displays correctly
- [ ] Username displays from `public.users` table (not `user_metadata`)
- [ ] Recent transactions render (up to 5 items)
- [ ] Budget card shows monthly budget and spent amount
- [ ] Budget progress bar calculates correctly
- [ ] Account cards display with correct icons and colors

### Account Cards

- [ ] Horizontal scroll works on account cards
- [ ] Each account shows correct name, type, and balance
- [ ] Icons map correctly:
  - Cash → cash.svg
  - Bank → bank.svg
  - E-Wallet → e-wallet.svg
  - Credit Card → credit_card.svg
  - Custom types fallback to appropriate icon
- [ ] Gradient colors match account types

### Recent Transactions

- [ ] Displays up to 5 most recent transactions
- [ ] Shows "No recent transactions" when empty
- [ ] Transaction details display correctly (title, category, amount, date)
- [ ] Income shows with green color (+)
- [ ] Expense shows with red color (-)
- [ ] Date formats correctly

### Budget Section

- [ ] Budget amount displays correctly
- [ ] Spent amount displays correctly
- [ ] Remaining amount calculates correctly
- [ ] Progress bar percentage is accurate
- [ ] "Set Budget" button appears when no budget exists
- [ ] "Update Budget" button appears when budget exists

---

## 💰 Accounts Management

### List View

- [ ] All accounts display in list
- [ ] Account name, type, and balance show correctly
- [ ] Edit button is visible for each account
- [ ] Delete button is visible for each account

### Create Account

- [ ] "+" FAB button opens create form
- [ ] Form validation works (required fields)
- [ ] Predefined account types available (Cash, Bank, E-Wallet, Credit Card)
- [ ] Custom type option works
- [ ] Custom type input appears when "Custom..." selected
- [ ] Account creation succeeds with valid data
- [ ] Success toast notification appears
- [ ] List refreshes with new account
- [ ] Modal closes after creation

### Edit Account

- [ ] **Edit button click detects correctly** (fixed: using `target.closest()`)
- [ ] **Edit form loads with correct account data** (fixed: `accounts.data.find()`)
- [ ] Account name is editable
- [ ] Account type is editable
- [ ] Balance field is disabled (not editable)
- [ ] Update succeeds with valid data
- [ ] Success toast notification appears
- [ ] List refreshes with updated data
- [ ] Modal closes after update

### Delete Account

- [ ] **Delete button click detects correctly** (fixed: using `target.closest()`)
- [ ] **Modal confirmation dialog appears** (fixed: replaced `confirm()` with modal)
- [ ] Confirmation modal shows warning message
- [ ] "Delete" button in modal works
- [ ] "Cancel" button in modal works
- [ ] Delete succeeds when confirmed
- [ ] **Success toast notification appears** (fixed: using toast instead of alert)
- [ ] Error toast appears on failure
- [ ] List refreshes after deletion
- [ ] Modal closes after action

---

## 📁 Categories Management

### List View

- [ ] Expense categories display in separate section
- [ ] Income categories display in separate section
- [ ] Category names show correctly
- [ ] Edit button is visible for each category
- [ ] Delete button is visible for each category

### Create Category

- [ ] "+" FAB button opens create form
- [ ] Form validation works (required fields)
- [ ] Category name input works
- [ ] Category type dropdown works (Expense/Income)
- [ ] Category creation succeeds with valid data
- [ ] Success toast notification appears
- [ ] Lists refresh with new category
- [ ] Modal closes after creation

### Edit Category

- [ ] **Edit button click detects correctly** (fixed: using `target.closest()`)
- [ ] Edit form loads with correct category data
- [ ] Category name is editable
- [ ] Category type is disabled (not editable in edit mode)
- [ ] Update succeeds with valid data
- [ ] Success toast notification appears
- [ ] Lists refresh with updated data
- [ ] Modal closes after update

### Delete Category

- [ ] **Delete button click detects correctly** (fixed: using `target.closest()`)
- [ ] **Modal confirmation dialog appears** (fixed: replaced `confirm()` with modal)
- [ ] Confirmation modal shows warning message
- [ ] "Delete" button in modal works
- [ ] "Cancel" button in modal works
- [ ] Delete succeeds when confirmed
- [ ] **Success toast notification appears** (fixed: using toast instead of alert)
- [ ] Error toast appears on failure
- [ ] Lists refresh after deletion
- [ ] Modal closes after action

---

## 💸 Transactions

### List & Filtering

- [ ] Transactions list loads correctly
- [ ] Filter by date range works
- [ ] Filter by category works
- [ ] Filter by account works
- [ ] Filter by type (income/expense) works
- [ ] Combined filters work together

### Create Transaction

- [ ] Transaction form opens from dashboard
- [ ] Transaction form opens from transactions page
- [ ] All fields validate correctly
- [ ] Account dropdown loads accounts
- [ ] Category dropdown loads categories
- [ ] Amount accepts decimal values
- [ ] Date picker works
- [ ] Transaction creation succeeds
- [ ] Success toast notification appears
- [ ] Dashboard/list refreshes

### Edit Transaction

- [ ] Edit button opens form with transaction data
- [ ] All fields are editable
- [ ] Update succeeds with valid data
- [ ] Success toast notification appears
- [ ] List refreshes with updated data

### Delete Transaction

- [ ] Delete button works
- [ ] Confirmation appears
- [ ] Delete succeeds when confirmed
- [ ] Success toast notification appears
- [ ] List refreshes after deletion

---

## 📈 Budget Management

### Set/Update Budget

- [ ] Budget form opens from dashboard
- [ ] Amount input validates correctly
- [ ] Month/year selection works
- [ ] Budget creation succeeds
- [ ] Budget update succeeds
- [ ] Success toast notification appears
- [ ] Dashboard refreshes with new budget data
- [ ] Progress bar updates correctly

---

## 🧪 API & Data Flow

### User Data Flow

- [ ] **`getUser()` fetches from auth.users AND public.users**
- [ ] **Username merges from public.users table**
- [ ] **`updateUser()` saves to public.users table (not user_metadata)**
- [ ] Error handling works for missing username records (PGRST116)

### Dashboard Data Flow

- [ ] GET `/api/dashboard` returns correct structure:
  - `totalBalance` (number)
  - `recentTransactions` (array)
  - `budget` (object)
- [ ] Recent transactions array is directly accessible (not wrapped)
- [ ] Data refreshes after mutations

### Error Handling

- [ ] Network errors show appropriate messages
- [ ] 401 Unauthorized redirects to login
- [ ] 404 Not Found shows error message
- [ ] 500 Server Error shows error message
- [ ] Validation errors display in toast
- [ ] Database constraint violations handled gracefully

---

## 🎨 UI/UX

### Responsiveness

- [ ] Dashboard layout works on desktop
- [ ] Dashboard layout works on mobile
- [ ] Account cards scroll horizontally on mobile
- [ ] Forms are usable on mobile
- [ ] Modals display correctly on all screen sizes

### Notifications

- [ ] Toast notifications appear for success actions
- [ ] Toast notifications appear for errors
- [ ] Toast auto-dismisses after timeout
- [ ] Multiple toasts stack correctly

### Modals

- [ ] Modal opens with correct content
- [ ] Modal backdrop prevents interaction with page
- [ ] Modal close button works
- [ ] ESC key closes modal
- [ ] Click outside modal closes it
- [ ] Modal content scrolls if too tall

### Navigation

- [ ] All navigation links work
- [ ] Back buttons return to correct page
- [ ] Browser back/forward buttons work
- [ ] Page state persists correctly

---

## 🔒 Security

- [ ] JWT token stored securely in localStorage
- [ ] Auth headers sent with protected requests
- [ ] Expired tokens redirect to login
- [ ] User can only access their own data
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS prevention (proper escaping)

---

## ⚡ Performance

- [ ] Initial page load is fast (<2s)
- [ ] Dashboard loads all data in parallel (Promise.all)
- [ ] No unnecessary re-renders
- [ ] Images load efficiently
- [ ] No console errors in production mode

---

## 🐛 Known Issues to Test

### Fixed Issues (Should Pass)

1. ✅ **Dashboard username bug** - Now reads from `public.users.username`
2. ✅ **Recent transactions data access** - Fixed `data.transactions` → `data.recentTransactions`
3. ✅ **Accounts edit button** - Fixed to use `accounts.data.find()` and `target.closest()`
4. ✅ **Accounts delete** - Replaced alert with modal + toast
5. ✅ **Categories delete button** - Fixed click detection with `target.closest()`
6. ✅ **Categories delete** - Replaced alert with modal + toast
7. ✅ **User controller** - Now queries public.users for username

### Potential Edge Cases

- [ ] User with no username in public.users (should fallback to email)
- [ ] User with no accounts (should show empty state)
- [ ] User with no transactions (should show empty state)
- [ ] User with no budget (should show "Set Budget" option)
- [ ] Account with zero balance
- [ ] Transaction with very large amount
- [ ] Custom account types with special characters

---

## 📝 Manual Testing Steps

1. **Start the application**:

   ```bash
   npm run dev
   ```

2. **Test Authentication Flow**:
   - Register new user
   - Login with credentials
   - Check dashboard loads correctly
   - Verify username displays correctly

3. **Test Dashboard**:
   - Verify all data displays correctly
   - Check username comes from public.users
   - Verify recent transactions render
   - Check account cards scroll horizontally
   - Verify budget progress bar

4. **Test Accounts CRUD**:
   - Create new account with predefined type
   - Create account with custom type
   - Edit account name and type
   - Delete account with modal confirmation
   - Verify all actions show toast notifications

5. **Test Categories CRUD**:
   - Create expense category
   - Create income category
   - Edit category name
   - Delete category with modal confirmation
   - Verify all actions show toast notifications

6. **Test Transactions**:
   - Create income transaction
   - Create expense transaction
   - Edit transaction
   - Delete transaction
   - Verify budget updates accordingly

7. **Test Edge Cases**:
   - Try actions with no data
   - Try invalid inputs
   - Test with network disconnected
   - Test with expired token

---

## ✅ Pre-Push Checklist

- [ ] All modified files reviewed
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] All CRUD operations work
- [ ] Toast notifications work consistently
- [ ] Modal confirmations work
- [ ] Username flow verified (public.users table)
- [ ] Git status clean (except intended changes)
- [ ] Ready to commit and push

---

## 🚀 Deployment Notes

**Files to Commit**:

- `api/_app/controllers/user.controller.js` - Updated to query public.users table
- `client/public/src/js/pages/dashboard.js` - Fixed username display
- `client/public/src/js/pages/account.js` - Fixed edit/delete with modal + toast
- `client/public/src/js/pages/categories.js` - Fixed edit/delete with modal + toast

**Commit Message Suggestion**:

```
fix: improve user data flow and CRUD operations

- Update user controller to fetch username from public.users table
- Fix dashboard to display username from correct source
- Replace alert dialogs with modal confirmations in accounts
- Replace alert dialogs with modal confirmations in categories
- Fix edit button detection using target.closest()
- Implement toast notifications for all CRUD operations
- Fix accounts.data.find() bug in edit functionality
```
