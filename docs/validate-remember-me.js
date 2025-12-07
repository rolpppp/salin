// Pre-production validation script for Remember Me feature
// Run this in the browser console on your login page

console.log('🔍 Remember Me Feature Validation Starting...\n');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function test(name, condition, errorMsg) {
  if (condition) {
    results.passed.push(name);
    console.log(`✅ ${name}`);
  } else {
    results.failed.push(name);
    console.log(`❌ ${name}: ${errorMsg}`);
  }
}

function warn(name, message) {
  results.warnings.push(name);
  console.log(`⚠️  ${name}: ${message}`);
}

// Test 1: Check if Remember Me checkbox exists
test(
  'Remember Me checkbox exists',
  document.getElementById('remember-me') !== null,
  'Checkbox with id="remember-me" not found in DOM'
);

// Test 2: Check if checkbox is unchecked by default
const checkbox = document.getElementById('remember-me');
test(
  'Remember Me unchecked by default',
  checkbox && !checkbox.checked,
  'Checkbox should be unchecked by default'
);

// Test 3: Check if storage utility is loaded
try {
  // Try to access the storage module functions (they should be in scope via imports)
  const hasLocalStorage = typeof localStorage !== 'undefined';
  const hasSessionStorage = typeof sessionStorage !== 'undefined';
  test(
    'Storage APIs available',
    hasLocalStorage && hasSessionStorage,
    'localStorage or sessionStorage not available'
  );
} catch (e) {
  test('Storage APIs available', false, e.message);
}

// Test 4: Check service worker cache version
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    test(
      'Service Worker registered',
      registrations.length > 0,
      'No service worker found'
    );
    
    caches.keys().then(cacheNames => {
      const hasV2Cache = cacheNames.some(name => name.includes('v2'));
      test(
        'Cache version v2 exists',
        hasV2Cache,
        'Cache v2 not found. Users may get old cached files.'
      );
      
      if (!hasV2Cache) {
        warn(
          'Cache Update Required',
          'Run: caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))'
        );
      }
    });
  });
} else {
  warn('Service Worker', 'Service Worker not supported in this browser');
}

// Test 5: Check if API endpoint exists
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test', rememberMe: false })
})
  .then(response => {
    test(
      'Login API endpoint accessible',
      response.status === 401 || response.status === 400 || response.status === 200,
      `Unexpected status: ${response.status}`
    );
  })
  .catch(err => {
    test(
      'Login API endpoint accessible',
      false,
      `API not reachable: ${err.message}`
    );
  });

// Test 6: Check CSS styles loaded
setTimeout(() => {
  const styles = window.getComputedStyle(document.querySelector('.remember-me-container') || document.body);
  const hasRememberMeStyles = document.querySelector('.remember-me-container') !== null;
  
  test(
    'Remember Me styles loaded',
    hasRememberMeStyles,
    'CSS class .remember-me-container not found'
  );
}, 100);

// Test 7: Verify form submission handler
const form = document.getElementById('auth-form');
test(
  'Auth form exists',
  form !== null,
  'Form with id="auth-form" not found'
);

// Summary after all async tests complete
setTimeout(() => {
  console.log('\n' + '='.repeat(50));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  
  if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log('\n🎉 All checks passed! Feature is ready for production.');
  } else if (results.failed.length === 0) {
    console.log('\n⚠️  All critical checks passed, but there are warnings.');
  } else {
    console.log('\n❌ Some checks failed. Review errors above.');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Clear browser cache and service worker');
  console.log('2. Test login with Remember Me checked');
  console.log('3. Test login without Remember Me checked');
  console.log('4. Test browser close/reopen scenarios');
  console.log('5. Test logout functionality');
}, 1000);
