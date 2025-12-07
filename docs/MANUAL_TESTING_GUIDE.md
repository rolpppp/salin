# 🧪 Quick Manual Testing Guide - Remember Me Feature

## Before You Start
1. Make sure your backend server is running on port 3000
2. Make sure your frontend is accessible
3. Open browser DevTools (F12)

## Test Scenario 1: Remember Me CHECKED ✅
**Expected: Persistent session lasting 7 days**

### Steps:
1. Open login page in **Incognito/Private window**
2. Open DevTools → Application → Storage
3. Enter valid email and password
4. **✅ CHECK the "Remember me for 7 days" checkbox**
5. Click Login

### Verify:
- [ ] ✅ Login successful, redirected to dashboard
- [ ] ✅ In DevTools → Application → Local Storage → you see:
  - `token` (JWT string)
  - `user` (JSON object)
  - `user_id` (string)
- [ ] ❌ In DevTools → Application → Session Storage → EMPTY (nothing stored here)

### Browser Close Test:
6. **Close the entire browser** (not just tab)
7. **Reopen browser** and navigate to your app

### Verify:
- [ ] ✅ Still logged in (automatically on dashboard)
- [ ] ✅ Can access all protected pages
- [ ] ✅ Token still in Local Storage

### Token Expiration Check:
8. Open DevTools → Console
9. Paste and run:
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const expiresAt = new Date(payload.exp * 1000);
console.log('Token expires at:', expiresAt);
console.log('Days until expiry:', (payload.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
```

### Verify:
- [ ] ✅ Expiration is approximately 7 days from now

---

## Test Scenario 2: Remember Me UNCHECKED ❌
**Expected: Temporary session, cleared when browser closes**

### Steps:
1. **Logout** from previous test
2. Open login page
3. Open DevTools → Application → Storage
4. Enter valid email and password
5. **❌ LEAVE "Remember me for 7 days" UNCHECKED**
6. Click Login

### Verify:
- [ ] ✅ Login successful, redirected to dashboard
- [ ] ❌ In DevTools → Application → Local Storage → EMPTY (nothing here)
- [ ] ✅ In DevTools → Application → Session Storage → you see:
  - `token` (JWT string)
  - `user` (JSON object)
  - `user_id` (string)

### Browser Close Test:
7. **Close the entire browser** (not just tab)
8. **Reopen browser** and navigate to your app

### Verify:
- [ ] ✅ Logged out (redirected to login page)
- [ ] ✅ Session Storage is empty
- [ ] ✅ Cannot access protected pages without logging in again

### Token Expiration Check:
9. Login again without Remember Me
10. Open DevTools → Console
11. Paste and run:
```javascript
const token = sessionStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const expiresAt = new Date(payload.exp * 1000);
console.log('Token expires at:', expiresAt);
console.log('Hours until expiry:', (payload.exp * 1000 - Date.now()) / (1000 * 60 * 60));
```

### Verify:
- [ ] ✅ Expiration is approximately 24 hours (1 day) from now

---

## Test Scenario 3: Google OAuth Login
**Expected: OAuth defaults to persistent session**

### Steps:
1. Logout if logged in
2. Click "Continue with Google"
3. Complete Google authentication
4. Open DevTools → Application → Storage

### Verify:
- [ ] ✅ Login successful
- [ ] ✅ Token in Local Storage (persistent by default)
- [ ] ❌ Session Storage empty

### Browser Close Test:
5. Close and reopen browser

### Verify:
- [ ] ✅ Still logged in

---

## Test Scenario 4: Logout Clears Both Storages
**Expected: Both localStorage and sessionStorage cleared**

### Steps:
1. Login with Remember Me (creates localStorage)
2. Open DevTools → Console
3. Manually add something to sessionStorage:
```javascript
sessionStorage.setItem('test', 'value');
```
4. Click Logout button

### Verify:
- [ ] ✅ Redirected to login page
- [ ] ✅ Local Storage cleared (no token, user, user_id)
- [ ] ✅ Session Storage cleared (including test item)

---

## Test Scenario 5: Token Expiration / 401 Handling
**Expected: Auto-logout on expired/invalid token**

### Steps:
1. Login with any method
2. Open DevTools → Application → Storage
3. Find the `token` and copy it
4. Modify the token (change a few characters)
5. Try to navigate to dashboard or make any API call

### Verify:
- [ ] ✅ Automatically logged out
- [ ] ✅ Both storages cleared
- [ ] ✅ Redirected to login page
- [ ] ✅ Toast/error message shown

---

## Test Scenario 6: UI/UX Check
**Expected: Clean, professional appearance**

### Steps:
1. Open login page
2. Inspect the Remember Me checkbox area

### Verify:
- [ ] ✅ Checkbox is properly styled (not browser default)
- [ ] ✅ Label text is clear: "Remember me for 7 days"
- [ ] ✅ Checkbox is unchecked by default
- [ ] ✅ Clicking label toggles checkbox
- [ ] ✅ Checkbox aligns well with other form elements
- [ ] ✅ Mobile responsive (check on small screen)

---

## Test Scenario 7: Service Worker Cache
**Expected: No "fetch failed" errors**

### Steps:
1. Open login page
2. Open DevTools → Network tab
3. Check "Disable cache"
4. Refresh page
5. Try Google login button

### Verify:
- [ ] ✅ All JS files load without errors
- [ ] ✅ `/src/js/utils/storage.js` loads successfully
- [ ] ✅ No "fetch failed" or module errors in console
- [ ] ✅ Google OAuth request goes through

---

## Test Scenario 8: Multiple Tabs
**Expected: Consistent state across tabs**

### Steps:
1. Login with Remember Me in Tab 1
2. Open Tab 2 to your app

### Verify:
- [ ] ✅ Tab 2 shows logged in state
- [ ] ✅ Both tabs access same localStorage

### Logout Test:
3. Logout in Tab 1
4. Refresh Tab 2

### Verify:
- [ ] ✅ Tab 2 now shows logged out

---

## Quick Validation Script

Paste this in browser console on login page:

```javascript
// Quick validation
console.log('🔍 Remember Me Feature Check');
console.log('✅ Checkbox exists:', !!document.getElementById('remember-me'));
console.log('✅ localStorage available:', typeof localStorage !== 'undefined');
console.log('✅ sessionStorage available:', typeof sessionStorage !== 'undefined');

// After login, check storage
console.log('\nAfter login, run:');
console.log('localStorage.getItem("token") // Should have value if Remember Me checked');
console.log('sessionStorage.getItem("token") // Should have value if Remember Me unchecked');
```

---

## ✅ Production Ready Checklist

Before deploying to production:

- [ ] All 8 test scenarios passed
- [ ] Tested on Chrome/Edge
- [ ] Tested on Firefox (if possible)
- [ ] Tested on mobile device
- [ ] Service worker cache updated (v2)
- [ ] No console errors
- [ ] Backend JWT_SECRET configured
- [ ] Database connections verified
- [ ] Reviewed code changes one final time

---

## 🚨 Common Issues & Solutions

### Issue: "Fetch failed" on Google login
**Solution**: Clear service worker and browser cache
```javascript
// Run in console:
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
```

### Issue: Token in wrong storage
**Solution**: Clear both storages and re-test
```javascript
localStorage.clear();
sessionStorage.clear();
```

### Issue: Token expiration not correct
**Solution**: Check JWT payload
```javascript
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

---

## 📝 Report Template

After testing, document results:

```
Remember Me Feature Test Results
Date: [Date]
Tester: [Name]
Environment: [Dev/Staging/Local]

✅ Remember Me Checked (Persistent): PASS/FAIL
✅ Remember Me Unchecked (Temporary): PASS/FAIL
✅ Google OAuth Login: PASS/FAIL
✅ Logout Functionality: PASS/FAIL
✅ Token Expiration Handling: PASS/FAIL
✅ UI/UX Quality: PASS/FAIL
✅ Service Worker: PASS/FAIL
✅ Multiple Tabs: PASS/FAIL

Issues Found: [None / List issues]

Ready for Production: YES / NO
```
