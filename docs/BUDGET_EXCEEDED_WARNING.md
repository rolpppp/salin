# Budget Exceeded Warning Feature

## Overview

This feature provides visual warnings and alerts when users exceed their monthly budget, helping them stay aware of overspending.

## Implementation Date

December 3, 2025

## Feature Scenario

**Given** I have a monthly budget of ₱800  
**And** I have already spent ₱820 this month  
**When** I view my dashboard  
**Then** the budget progress bar should show "103% used"  
**And** the remaining amount should display "-₱20.00" in red color  
**And** I should see an alert "You have exceeded your monthly budget"

## Technical Implementation

### Dashboard Changes (`client/public/src/js/pages/dashboard.js`)

#### Budget Calculations

```javascript
const budgetAmount = data.budget?.amount || 0;
const budgetSpent = data.budget?.spent || 0;
const budgetPercent = budgetAmount > 0 ? (budgetSpent / budgetAmount) * 100 : 0;
const budgetRemaining = budgetAmount - budgetSpent;
const isBudgetExceeded = budgetAmount > 0 && budgetSpent > budgetAmount;
```

#### Warning Alert Banner

- **Condition**: Only shown when `isBudgetExceeded === true`
- **Position**: Below header, above all content
- **Content**:
  - Warning icon (⚠️)
  - "Budget Exceeded!" heading
  - Amount exceeded message with formatted currency

#### Enhanced Budget Card

1. **Visual Indicator**:
   - Red left border when exceeded
   - Class: `budget-exceeded`

2. **Progress Bar**:
   - Normal: Blue gradient
   - Exceeded: Red gradient
   - Width capped at 100% (even if percentage > 100%)

3. **Budget Details Section**:
   - **Used**: Shows percentage (e.g., "103%")
   - **Remaining**: Shows amount with conditional color
     - Positive (within budget): Green text
     - Negative (exceeded): Red text with minus sign

### Styling Changes (`client/public/src/styles/main.css`)

#### Alert Component

```css
.alert {
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--space-md);
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.alert-danger {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}
```

#### Budget Exceeded Styles

```css
.budget-progress-bar.exceeded {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.budget-exceeded {
  border-left: 4px solid #ef4444;
}

.text-danger {
  color: #ef4444 !important;
}

.text-success {
  color: #10b981 !important;
}
```

#### Budget Details Layout

```css
.budget-details {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}
```

## UI Components

### Normal Budget State (Within Budget)

```
┌─────────────────────────────────────┐
│  Monthly Budget                     │
│  ₱600 / ₱800                        │
│  [████████░░] 75%                   │
│  ─────────────────────────────      │
│  Used: 75%          Remaining:      │
│                     ₱200.00 (green) │
└─────────────────────────────────────┘
```

### Exceeded Budget State

```
┌─────────────────────────────────────┐
│ ⚠️ Budget Exceeded!                 │
│ You have exceeded your monthly      │
│ budget by ₱20.00.                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│█ Monthly Budget                     │ <- Red border
│  ₱820 / ₱800                        │
│  [██████████] 103% (red)            │
│  ─────────────────────────────      │
│  Used: 103%         Remaining:      │
│                     -₱20.00 (red)   │
└─────────────────────────────────────┘
```

## Visual Indicators

### Color Coding

- **Green (#10b981)**: Remaining positive amount (within budget)
- **Red (#ef4444)**:
  - Remaining negative amount (exceeded)
  - Progress bar when exceeded
  - Left border on budget card
  - Alert background tint

### Progress Bar

- **Normal**: Blue gradient (primary color)
- **Exceeded**: Red gradient
- **Width**: Capped at 100% to prevent overflow

### Typography

- **Percentage**: Large, semibold
- **Remaining Amount**: Large, semibold with conditional color
- **Labels**: Small, uppercase, light gray

## User Experience Flow

### Within Budget Scenario

1. User views dashboard
2. Budget card shows blue progress bar
3. Percentage shows actual usage (e.g., 75%)
4. Remaining amount in green
5. No warning banner

### Exceeded Budget Scenario

1. User views dashboard
2. **Warning banner appears** at top with exceeded amount
3. Budget card has red left border
4. Progress bar is red and at 100%
5. Percentage shows over 100% (e.g., 103%)
6. Remaining amount in red with minus sign (e.g., -₱20.00)

### No Budget Scenario

1. User views dashboard
2. Budget card shows ₱0 / ₱0
3. No budget details section
4. No warning banner

## Testing Checklist

### Test Case 1: Within Budget

- [ ] Set budget to ₱1000
- [ ] Add expenses totaling ₱600
- [ ] View dashboard
- [ ] Verify no alert banner
- [ ] Verify progress bar is blue
- [ ] Verify "Used: 60%" is displayed
- [ ] Verify "Remaining: ₱400.00" in green

### Test Case 2: Exactly At Budget

- [ ] Set budget to ₱800
- [ ] Add expenses totaling ₱800
- [ ] View dashboard
- [ ] Verify no alert banner
- [ ] Verify progress bar is at 100% (blue)
- [ ] Verify "Used: 100%" is displayed
- [ ] Verify "Remaining: ₱0.00" in green

### Test Case 3: Exceeded Budget (Scenario from Requirements)

- [ ] Set budget to ₱800
- [ ] Add expenses totaling ₱820
- [ ] View dashboard
- [ ] ✅ Verify alert banner appears: "Budget Exceeded!"
- [ ] ✅ Verify alert shows exceeded amount: "₱20.00"
- [ ] ✅ Verify budget card has red left border
- [ ] ✅ Verify progress bar is red and at 100%
- [ ] ✅ Verify "Used: 103%" is displayed
- [ ] ✅ Verify "Remaining: -₱20.00" in red color

### Test Case 4: Far Exceeded Budget

- [ ] Set budget to ₱500
- [ ] Add expenses totaling ₱1000
- [ ] View dashboard
- [ ] Verify alert shows "₱500.00" exceeded
- [ ] Verify "Used: 200%" is displayed
- [ ] Verify "Remaining: -₱500.00" in red

### Test Case 5: No Budget Set

- [ ] Delete or don't set any budget
- [ ] View dashboard
- [ ] Verify no alert banner
- [ ] Verify budget card shows ₱0 / ₱0
- [ ] Verify no "Used" or "Remaining" details

### Test Case 6: Budget Update

- [ ] Start with budget ₱800, spent ₱820 (exceeded)
- [ ] Verify warning shows
- [ ] Update budget to ₱1000
- [ ] Verify warning disappears
- [ ] Verify remaining is now ₱180 in green

## Accessibility

- **Color Coding**: Red/green colors for exceeded/remaining
- **Icons**: Warning emoji (⚠️) for visual emphasis
- **Text Labels**: Clear "Budget Exceeded!" heading
- **Numeric Values**: Always shown alongside colors

## Performance Considerations

- **Calculations**: Done once during render
- **Conditional Rendering**: Alert only rendered when needed
- **No Additional API Calls**: Uses existing dashboard data

## Edge Cases Handled

1. **No budget set**: Budget details section hidden
2. **Zero budget**: Prevents division by zero
3. **Percentage > 100%**: Progress bar capped at 100% width
4. **Negative remaining**: Shows minus sign explicitly
5. **Decimal percentages**: Rounded to nearest whole number

## Future Enhancements (Optional)

- [ ] Push notifications when budget is exceeded
- [ ] Weekly budget status emails
- [ ] Budget forecast based on spending trends
- [ ] Category-wise budget breakdown
- [ ] Historical exceeded budget tracking

## Related Files

### Modified

- `/client/public/src/js/pages/dashboard.js`
- `/client/public/src/styles/main.css`

### Related Features

- Budget creation/update feature
- Budget deletion feature
- Dashboard data fetching
- Transaction tracking

## Git Branch

`feature/transaction-sorting-pagination` (implemented alongside pagination and delete features)

## Notes

- Alert appears only when budget exists AND is exceeded
- All monetary values use `formatCurrency()` helper for consistency
- Progress bar visual is capped at 100% but percentage text shows actual value
- Red color theme matches existing danger buttons for consistency
