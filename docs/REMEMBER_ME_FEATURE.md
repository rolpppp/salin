# Remember Me Feature - Implementation & Testing Guide

## Overview
Implemented session management with "Remember Me" functionality that allows users to choose between persistent (7 days) and temporary (browser session) authentication.

## Implementation Details

### Backend Changes
- **File**: `api/_app/controllers/auth.controller.js`
- **Change**: Modified `loginUser` to accept `rememberMe` parameter
- **Token Expiration**: 
  - `rememberMe: true` → 7 days
  - `rememberMe: false` → 1 day (default)

### Frontend Changes

#### 1. Storage Utility (`client/public/src/js/utils/storage.js`)
- New module for managing localStorage vs sessionStorage
- Functions:
  - `setAuthData(token, user, rememberMe)` - stores auth data in appropriate storage
  - `getAuthToken()` - retrieves token from either storage
  - `getUserId()` - retrieves user ID from either storage
  - `getUser()` - retrieves user object from either storage
  - `clearAuthData()` - clears auth data from both storages
  - `isAuthenticated()` - checks if user has valid session

#### 2. Login UI (`client/public/src/js/pages/auth/login.js`)
- Added "Remember me for 7 days" checkbox
- Integrated `setAuthData` utility
- Passes `rememberMe` value to API

#### 3. API Layer (`client/public/src/js/api.js`)
- Updated `loginUser()` to accept and send `rememberMe` parameter
- Replaced all `localStorage` references with storage utilities
- Updated `request()` to use `clearAuthData()` on 401 errors

#### 4. Router (`client/public/src/js/app.js`)
- Uses `getAuthToken()` to check both storage types

#### 5. OAuth Callback (`client/public/src/js/pages/auth/callback.js`)
- Uses `setAuthData()` with `rememberMe: true` (OAuth logins default to persistent)

#### 6. Dashboard (`client/public/src/js/pages/dashboard.js`)
- Logout uses `clearAuthData()` to clear both storages

#### 7. Service Worker (`client/public/sw.js`)
- Cache version bumped to `v2`
- Added `/src/js/utils/storage.js` to cache

#### 8. Styling (`client/public/src/styles/main.css`)
- Added `.remember-me-container` styles
- Added `.remember-me-label` and `.remember-me-checkbox` styles

## Testing Checklist

### Pre-Production Tests

#### Test 1: Remember Me Checked (Persistent Session)
- [ ] Navigate to login page
- [ ] Check "Remember me for 7 days" checkbox
- [ ] Enter valid credentials and login
- [ ] **Verify**: Token stored in `localStorage` (not `sessionStorage`)
- [ ] Close browser completely
- [ ] Reopen browser and navigate to app
- [ ] **Expected**: User should still be logged in
- [ ] **Verify**: Session persists for up to 7 days

#### Test 2: Remember Me Unchecked (Temporary Session)
- [ ] Logout if logged in
- [ ] Navigate to login page
- [ ] Leave "Remember me for 7 days" unchecked
- [ ] Enter valid credentials and login
- [ ] **Verify**: Token stored in `sessionStorage` (not `localStorage`)
- [ ] Close browser completely
- [ ] Reopen browser and navigate to app
- [ ] **Expected**: User should be logged out
- [ ] **Expected**: Redirected to login page

#### Test 3: Google OAuth Login (Default Persistent)
- [ ] Click "Continue with Google"
- [ ] Complete Google authentication
- [ ] **Verify**: Token stored in `localStorage`
- [ ] Close and reopen browser
- [ ] **Expected**: User still logged in

#### Test 4: Token Expiration
- [ ] Login with Remember Me checked
- [ ] **Verify**: JWT token has 7-day expiration in payload
- [ ] Login without Remember Me
- [ ] **Verify**: JWT token has 1-day expiration in payload

#### Test 5: Logout Functionality
- [ ] Login with any method
- [ ] Click logout button
- [ ] **Verify**: Both `localStorage` and `sessionStorage` cleared
- [ ] **Expected**: Redirected to login page
- [ ] Try to access protected routes
- [ ] **Expected**: Redirected to login page

#### Test 6: 401 Unauthorized Handling
- [ ] Login successfully
- [ ] Manually expire or invalidate token
- [ ] Make any API request
- [ ] **Expected**: Auto-logout with both storages cleared
- [ ] **Expected**: Redirected to login page

#### Test 7: Service Worker Cache
- [ ] Clear browser cache and service worker
- [ ] Navigate to app
- [ ] **Verify**: Service worker installs with cache v2
- [ ] **Verify**: `storage.js` loads without errors
- [ ] Login works without "fetch failed" errors

#### Test 8: Registration Flow
- [ ] Register new account
- [ ] **Verify**: Token stored in `sessionStorage` (default non-persistent)
- [ ] Complete onboarding
- [ ] Close browser
- [ ] **Expected**: Session cleared, user logged out

#### Test 9: Concurrent Tabs
- [ ] Login in Tab 1 with Remember Me
- [ ] Open Tab 2 to same app
- [ ] **Expected**: Tab 2 shows user as logged in
- [ ] Logout in Tab 1
- [ ] Refresh Tab 2
- [ ] **Expected**: Tab 2 shows user as logged out

#### Test 10: Mixed Storage Scenario
- [ ] Manually clear both storages
- [ ] Login without Remember Me (uses sessionStorage)
- [ ] Logout
- [ ] Login with Remember Me (uses localStorage)
- [ ] **Expected**: No conflicts, works correctly

### Browser Compatibility Tests
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

### Security Tests
- [ ] Inspect localStorage/sessionStorage - no sensitive data except JWT
- [ ] Verify JWT tokens have proper expiration claims
- [ ] Test XSS protection (tokens not exposed in URLs)
- [ ] Test CSRF protection on login endpoint

## Production Deployment Steps

1. **Clear Service Worker Cache**
   ```
   - Update CACHE_NAME version in sw.js (already done: v2)
   - Users' browsers will auto-update on next visit
   ```

2. **Environment Variables**
   - Ensure `JWT_SECRET` is properly set in production
   - Verify Supabase credentials are correct

3. **Database**
   - No database migrations required
   - Existing users will work seamlessly

4. **Monitoring**
   - Monitor for 401 errors (token expiration issues)
   - Track login success rates
   - Monitor storage-related errors in logs

5. **User Communication**
   - Optional: Notify users of new "Remember Me" feature
   - Update any user documentation/help pages

## Rollback Plan

If issues occur:
1. Revert service worker cache version to v1
2. Revert to direct localStorage usage
3. Remove Remember Me checkbox from UI
4. Revert backend to always use 1-day expiration

## Known Limitations

- Token refresh not implemented (user must re-login after expiration)
- No "Remember Me" preference saved (user must check each time if needed)
- OAuth logins always use persistent sessions (can be changed if needed)

## Future Enhancements

- Add automatic token refresh before expiration
- Save user's Remember Me preference
- Add "Extend Session" option when nearing expiration
- Add "Active Sessions" management in user settings
- Implement "Remember this device" with device fingerprinting
