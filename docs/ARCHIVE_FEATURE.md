# Archive/Soft-Delete Feature

## Overview

This feature implements intelligent delete/archive functionality for accounts and categories to preserve data integrity and transaction history.

## How It Works

### Accounts

When deleting an account:

- **Archive** if the account has:
  - Non-zero balance (positive or negative)
  - Any transaction history
- **Permanently Delete** if:
  - Balance is zero
  - No transactions exist

### Categories

When deleting a category:

- **Archive** if the category has:
  - Any transactions using this category
- **Permanently Delete** if:
  - No transactions exist

## Database Changes

### Migration SQL

Run the migration file: `migrations/add_archive_columns.sql`

This adds:

- `is_archived` column to `accounts` table
- `is_archived` column to `categories` table
- Indexes for better query performance

### Indexes Created

- `idx_accounts_is_archived` - General archive status
- `idx_categories_is_archived` - General archive status
- `idx_accounts_active` - Partial index for active accounts (most common query)
- `idx_categories_active` - Partial index for active categories (most common query)

## API Changes

### Account Endpoints

#### GET /api/accounts

- **Default**: Returns only non-archived accounts
- **With `?include_archived=true`**: Returns all accounts including archived

#### DELETE /api/accounts/:id

**Response includes:**

```json
{
  "message": "Account archived successfully",
  "action": "archived",  // or "deleted"
  "reason": "Account has a non-zero balance",  // only for archived
  "data": { ... }  // account data (for archived only)
}
```

### Category Endpoints

#### GET /api/categories

- **Default**: Returns only non-archived categories
- **With `?include_archived=true`**: Returns all categories including archived

#### GET /api/categories/type/:type

- **Default**: Returns only non-archived categories of the specified type
- **With `?include_archived=true`**: Returns all categories including archived

#### DELETE /api/categories/:id

**Response includes:**

```json
{
  "message": "Category archived successfully",
  "action": "archived",  // or "deleted"
  "reason": "Category has transaction history",  // only for archived
  "data": { ... }  // category data (for archived only)
}
```

### Dashboard Changes

The dashboard now:

- Calculates total balance from **active accounts only** (excludes archived)
- Still shows all transactions (including those with archived accounts/categories)

## Frontend Changes

### User Experience

1. **Delete Confirmation**:
   - Shows a note that items with history will be archived
   - Informs user about the smart delete behavior

2. **Toast Messages**:
   - **Archived**: "Account/Category archived: [reason]" (info toast)
   - **Deleted**: "Account/Category deleted successfully" (success toast)

3. **Dropdown Filters**:
   - Transaction forms only show active (non-archived) accounts
   - Transaction forms only show active (non-archived) categories
   - Archived items are hidden from selection

4. **Transaction History**:
   - Transactions still display archived account/category names
   - Historical data is preserved

## Benefits

1. **Data Integrity**: Never lose transaction history
2. **User Safety**: Prevents accidental data loss
3. **Audit Trail**: Maintain complete financial records
4. **Flexibility**: Clean deletion when safe, archiving when needed
5. **Performance**: Archived items don't clutter active lists but remain queryable

## Testing Checklist

### Accounts

- [ ] Create account with zero balance and no transactions → Should delete permanently
- [ ] Create account with non-zero balance → Should archive when deleting
- [ ] Create account, add transaction, set balance to zero → Should archive when deleting
- [ ] Archived accounts should not appear in dropdowns
- [ ] Archived accounts should not count in dashboard balance
- [ ] Transactions should still show archived account names

### Categories

- [ ] Create category with no transactions → Should delete permanently
- [ ] Create category, add transaction → Should archive when deleting
- [ ] Archived categories should not appear in dropdowns
- [ ] Transactions should still show archived category names

### API

- [ ] GET /api/accounts returns only active accounts
- [ ] GET /api/accounts?include_archived=true returns all accounts
- [ ] GET /api/categories returns only active categories
- [ ] GET /api/categories?include_archived=true returns all categories
- [ ] DELETE responses correctly indicate action taken (archived/deleted)

## Future Enhancements

Potential additions:

- [ ] "Show Archived" toggle in account/category management pages
- [ ] Ability to unarchive accounts/categories
- [ ] Archive date/timestamp tracking
- [ ] Archive reason logging
- [ ] Bulk archive/unarchive operations
- [ ] Archive notification emails
