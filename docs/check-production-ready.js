#!/usr/bin/env node

/**
 * Remember Me Feature - Production Readiness Check
 * Run this script to verify all files are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Remember Me Feature - Production Readiness Check\n');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, error) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
    checks.push({ name, status: 'pass' });
  } else {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error}\n`);
    failed++;
    checks.push({ name, status: 'fail', error });
  }
}

// Check 1: Storage utility exists
const storagePath = path.join(__dirname, '../client/public/src/js/utils/storage.js');
check(
  'Storage utility file exists',
  fs.existsSync(storagePath),
  'File not found: client/public/src/js/utils/storage.js'
);

// Check 2: Storage utility has required exports
if (fs.existsSync(storagePath)) {
  const storageContent = fs.readFileSync(storagePath, 'utf8');
  const hasSetAuthData = storageContent.includes('export function setAuthData');
  const hasGetAuthToken = storageContent.includes('export function getAuthToken');
  const hasClearAuthData = storageContent.includes('export function clearAuthData');
  const hasGetUserId = storageContent.includes('export function getUserId');
  
  check(
    'Storage utility exports all required functions',
    hasSetAuthData && hasGetAuthToken && hasClearAuthData && hasGetUserId,
    'Missing required exports: setAuthData, getAuthToken, clearAuthData, or getUserId'
  );
}

// Check 3: Login page imports storage utility
const loginPath = path.join(__dirname, '../client/public/src/js/pages/auth/login.js');
if (fs.existsSync(loginPath)) {
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  check(
    'Login page imports storage utility',
    loginContent.includes('from "../../utils/storage.js"'),
    'Login.js does not import from utils/storage.js'
  );
  
  check(
    'Login page uses setAuthData',
    loginContent.includes('setAuthData('),
    'Login.js does not call setAuthData function'
  );
  
  check(
    'Login page has Remember Me checkbox',
    loginContent.includes('remember-me'),
    'Login page does not have remember-me checkbox'
  );
}

// Check 4: API layer imports storage utility
const apiPath = path.join(__dirname, '../client/public/src/js/api.js');
if (fs.existsSync(apiPath)) {
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  check(
    'API layer imports storage utility',
    apiContent.includes('from "./utils/storage.js"'),
    'api.js does not import from utils/storage.js'
  );
  
  check(
    'API layer uses getAuthToken',
    apiContent.includes('getAuthToken()'),
    'api.js does not use getAuthToken function'
  );
  
  check(
    'API layer uses clearAuthData',
    apiContent.includes('clearAuthData()'),
    'api.js does not use clearAuthData function'
  );
}

// Check 5: App.js imports storage utility
const appPath = path.join(__dirname, '../client/public/src/js/app.js');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  check(
    'App.js imports storage utility',
    appContent.includes('from "./utils/storage.js"'),
    'app.js does not import from utils/storage.js'
  );
  
  check(
    'App.js uses getAuthToken for auth check',
    appContent.includes('getAuthToken()'),
    'app.js does not use getAuthToken for authentication check'
  );
}

// Check 6: Dashboard imports storage utility
const dashboardPath = path.join(__dirname, '../client/public/src/js/pages/dashboard.js');
if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  check(
    'Dashboard imports storage utility',
    dashboardContent.includes('from "../utils/storage.js"'),
    'dashboard.js does not import from utils/storage.js'
  );
  
  check(
    'Dashboard uses clearAuthData on logout',
    dashboardContent.includes('clearAuthData()'),
    'dashboard.js does not use clearAuthData for logout'
  );
}

// Check 7: OAuth callback imports storage utility
const callbackPath = path.join(__dirname, '../client/public/src/js/pages/auth/callback.js');
if (fs.existsSync(callbackPath)) {
  const callbackContent = fs.readFileSync(callbackPath, 'utf8');
  check(
    'OAuth callback imports storage utility',
    callbackContent.includes('from "../../utils/storage.js"'),
    'callback.js does not import from utils/storage.js'
  );
  
  check(
    'OAuth callback uses setAuthData',
    callbackContent.includes('setAuthData('),
    'callback.js does not use setAuthData function'
  );
}

// Check 8: Auth controller accepts rememberMe
const authControllerPath = path.join(__dirname, '../api/_app/controllers/auth.controller.js');
if (fs.existsSync(authControllerPath)) {
  const authContent = fs.readFileSync(authControllerPath, 'utf8');
  check(
    'Auth controller accepts rememberMe parameter',
    authContent.includes('rememberMe'),
    'auth.controller.js does not handle rememberMe parameter'
  );
  
  check(
    'Auth controller sets dynamic token expiration',
    authContent.includes('rememberMe ? "7d" : "1d"'),
    'auth.controller.js does not set dynamic token expiration based on rememberMe'
  );
}

// Check 9: Service worker updated
const swPath = path.join(__dirname, '../client/public/sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  check(
    'Service worker cache version updated to v2',
    swContent.includes('salin-cache-v2'),
    'Service worker still using old cache version'
  );
  
  check(
    'Service worker includes storage.js in cache',
    swContent.includes('/src/js/utils/storage.js'),
    'Service worker does not cache storage.js file'
  );
}

// Check 10: CSS styles for Remember Me
const cssPath = path.join(__dirname, '../client/public/src/styles/main.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  check(
    'CSS includes Remember Me styles',
    cssContent.includes('.remember-me-container') && cssContent.includes('.remember-me-checkbox'),
    'main.css does not include Remember Me styles'
  );
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 PRODUCTION READINESS SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! Feature is ready for production deployment.');
  console.log('\n📋 Next Steps:');
  console.log('1. Review docs/REMEMBER_ME_FEATURE.md for testing checklist');
  console.log('2. Test manually in development environment');
  console.log('3. Clear service worker and browser cache');
  console.log('4. Run validation script in browser console');
  console.log('5. Deploy to production');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}
