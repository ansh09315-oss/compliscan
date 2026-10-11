/**
 * Automated Verification Script: Auth Rate Limiting & Temporary Lockout
 * Tests:
 * 1. Login flow (5 attempts / 15 min per IP+email). Confirms attempt 6 is blocked with HTTP 429 & Retry-After.
 * 2. Signup flow (3 attempts / 15 min). Confirms attempt 4 is blocked with HTTP 429.
 * 3. Password-Reset flow (3 attempts / 15 min). Confirms attempt 4 is blocked with HTTP 429.
 */

const BASE_URL = 'http://localhost:3000';

async function testLoginLockout() {
  console.log('\n======================================================');
  console.log('TEST 1: LOGIN FLOW RATE LIMITING & TEMPORARY LOCKOUT');
  console.log('Policy: 5 failed attempts / 15 min -> 15 min lockout on 6th attempt');
  console.log('======================================================');

  const testOfficer = 'TEST_OFFICER_LOCKOUT_' + Date.now();

  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '192.168.1.50', // Consistent simulated client IP
      },
      body: JSON.stringify({
        officerId: testOfficer,
        password: 'WrongPassword123!',
      }),
    });

    const data = await res.json().catch(() => ({}));
    const retryAfter = res.headers.get('retry-after');
    const limit = res.headers.get('x-ratelimit-limit');
    const remaining = res.headers.get('x-ratelimit-remaining');

    console.log(
      `Attempt #${attempt} -> HTTP ${res.status} | Remaining: ${remaining} | Retry-After: ${retryAfter || 'N/A'} | Locked: ${data.locked || false}`
    );
    console.log(`   Message: "${data.error}"`);

    if (attempt <= 4) {
      if (res.status !== 401) throw new Error(`Expected HTTP 401 on attempt ${attempt}, got ${res.status}`);
    } else if (attempt === 5) {
      // 5th failed attempt triggers the lockout
      if (res.status !== 429 && res.status !== 401) {
        throw new Error(`Expected HTTP 429 or 401 on attempt 5, got ${res.status}`);
      }
    } else if (attempt === 6) {
      // 6th attempt MUST be blocked with HTTP 429
      if (res.status !== 429) {
        throw new Error(`FAIL: Attempt 6 was not blocked! Expected HTTP 429, got ${res.status}`);
      }
      if (!retryAfter) {
        throw new Error('FAIL: Missing Retry-After header on 6th attempt');
      }
      console.log('SUCCESS: 6th attempt was BLOCKED with HTTP 429 and temporary lockout active!');
    }
  }
}

async function testSignupRateLimit() {
  console.log('\n======================================================');
  console.log('TEST 2: SIGNUP FLOW RATE LIMITING');
  console.log('Policy: 3 attempts / 15 min per IP -> 4th attempt blocked');
  console.log('======================================================');

  const testIp = '192.168.1.75';

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': testIp,
      },
      body: JSON.stringify({
        badgeNumber: `BADGE_${attempt}_${Date.now()}`,
        fullName: 'Test Officer',
        email: `officer_${attempt}_${Date.now()}@delhi.gov.in`,
        password: 'short', // intentional invalid to trigger failure
      }),
    });

    const data = await res.json().catch(() => ({}));
    const retryAfter = res.headers.get('retry-after');
    const remaining = res.headers.get('x-ratelimit-remaining');

    console.log(
      `Signup Attempt #${attempt} -> HTTP ${res.status} | Remaining: ${remaining} | Retry-After: ${retryAfter || 'N/A'}`
    );
    console.log(`   Message: "${data.error}"`);

    if (attempt === 4) {
      if (res.status !== 429) {
        throw new Error(`FAIL: Signup attempt 4 was not blocked! Got HTTP ${res.status}`);
      }
      console.log('SUCCESS: 4th signup attempt was BLOCKED with HTTP 429!');
    }
  }
}

async function testPasswordResetRateLimit() {
  console.log('\n======================================================');
  console.log('TEST 3: PASSWORD-RESET FLOW RATE LIMITING');
  console.log('Policy: 3 attempts / 15 min per IP+email -> 4th attempt blocked');
  console.log('======================================================');

  const testEmail = `reset_target_${Date.now()}@delhi.gov.in`;
  const testIp = '192.168.1.99';

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`${BASE_URL}/api/auth/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': testIp,
      },
      body: JSON.stringify({
        action: 'confirm',
        email: testEmail,
        otp: '000000', // Invalid OTP
        newPassword: 'NewSecurePassword123!',
      }),
    });

    const data = await res.json().catch(() => ({}));
    const retryAfter = res.headers.get('retry-after');
    const remaining = res.headers.get('x-ratelimit-remaining');

    console.log(
      `Password-Reset Attempt #${attempt} -> HTTP ${res.status} | Remaining: ${remaining} | Retry-After: ${retryAfter || 'N/A'}`
    );
    console.log(`   Message: "${data.error}"`);

    if (attempt === 4) {
      if (res.status !== 429) {
        throw new Error(`FAIL: Password-reset attempt 4 was not blocked! Got HTTP ${res.status}`);
      }
      console.log('SUCCESS: 4th password-reset attempt was BLOCKED with HTTP 429!');
    }
  }
}

async function runAll() {
  try {
    await testLoginLockout();
    await testSignupRateLimit();
    await testPasswordResetRateLimit();
    console.log('\n======================================================');
    console.log('ALL AUTH RATE LIMITING & TEMPORARY LOCKOUT TESTS PASSED');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\nTEST FAILED:', err.message);
    process.exit(1);
  }
}

runAll();
