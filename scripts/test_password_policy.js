/**
 * Test Suite: Strong Password Policy & HaveIBeenPwned (HIBP) Leaked-Password Defense
 * Verifies via Next.js API server (http://localhost:3000):
 * 1. Minimum 12-character enforcement (< 12 rejected)
 * 2. Character complexity enforcement (missing symbol/uppercase/number rejected)
 * 3. HaveIBeenPwned (HIBP) k-Anonymity detection of known breached passwords
 * 4. Sign-up endpoint /api/auth/signup rejection of breached passwords
 * 5. Sign-up endpoint acceptance of clean, strong 12+ character passphrases
 */

const BASE_URL = 'http://localhost:3000';

async function validateViaApi(password) {
  const res = await fetch(`${BASE_URL}/api/auth/validate-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return await res.json();
}

async function runPolicyTests() {
  console.log('\n=============================================================');
  console.log('TEST 1: PASSWORD POLICY LENGTH ENFORCEMENT (< 12 CHARACTERS)');
  console.log('=============================================================');
  const shortResult = await validateViaApi('P@ssword1');
  console.log('Input: "P@ssword1" (9 chars)');
  console.log('Valid:', shortResult.valid);
  console.log('Errors:', shortResult.errors);

  if (shortResult.valid || !shortResult.errors.some(e => e.includes('12 characters'))) {
    throw new Error('FAIL: Short password was not rejected!');
  }
  console.log('PASS: Correctly rejected for length < 12.');

  console.log('\n=============================================================');
  console.log('TEST 2: CHARACTER COMPLEXITY ENFORCEMENT');
  console.log('=============================================================');
  const noSymbolResult = await validateViaApi('Password12345678');
  console.log('Input: "Password12345678" (16 chars, no symbol)');
  console.log('Valid:', noSymbolResult.valid);
  console.log('Errors:', noSymbolResult.errors);

  if (noSymbolResult.valid || !noSymbolResult.errors.some(e => e.includes('special symbol'))) {
    throw new Error('FAIL: Missing symbol was not rejected!');
  }
  console.log('PASS: Correctly rejected for missing special symbol.');

  console.log('\n=============================================================');
  console.log('TEST 3: HAVEIBEENPWNED (HIBP) BREACH DETECTION (KNOWN BREACHED)');
  console.log('=============================================================');
  const breachedPwd = 'Password123456!'; // 15 chars, meets complexity, but in HIBP database!
  console.log(`Checking known breached password: "${breachedPwd}"`);
  const breachResult = await validateViaApi(breachedPwd);
  console.log('Is Breached:', breachResult.isBreached);
  console.log('Breach Count in HIBP:', breachResult.breachCount);
  console.log('Errors returned:', breachResult.errors);

  if (!breachResult.isBreached || !breachResult.breachCount || breachResult.valid) {
    throw new Error('FAIL: Known breached password was not detected by HIBP!');
  }
  console.log(`PASS: HaveIBeenPwned detected ${breachResult.breachCount.toLocaleString()} breaches and rejected the password!`);

  console.log('\n=============================================================');
  console.log('TEST 4: STRONG UNIQUE UNCOMPROMISED PASSPHRASE');
  console.log('=============================================================');
  const strongPwd = 'CompliScan#GovIndia!Metrology2026';
  console.log(`Checking strong passphrase: "${strongPwd}"`);
  const strongResult = await validateViaApi(strongPwd);
  console.log('Valid:', strongResult.valid);
  console.log('Score:', strongResult.score);
  console.log('Strength Label:', strongResult.strengthLabel);
  console.log('Breached:', strongResult.isBreached);

  if (!strongResult.valid || strongResult.isBreached) {
    throw new Error('FAIL: Strong passphrase was rejected unexpectedly!');
  }
  console.log('PASS: Strong unique passphrase accepted with high strength score.');

  console.log('\n=============================================================');
  console.log('TEST 5: SIGNUP API ENDPOINT REJECTION OF BREACHED PASSWORD');
  console.log('=============================================================');
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '192.168.1.188',
    },
    body: JSON.stringify({
      badgeNumber: 'TEST_BREACH_' + Date.now(),
      fullName: 'Security Test Officer',
      email: `test_breach_${Date.now()}@delhi.gov.in`,
      password: breachedPwd, // Breached password
    }),
  });

  const apiData = await res.json();
  console.log('HTTP Status:', res.status);
  console.log('API Error:', apiData.error);
  console.log('Is Breached Flag:', apiData.isBreached);
  console.log('Breach Count:', apiData.breachCount);

  if (res.status !== 400 || !apiData.isBreached) {
    throw new Error(`FAIL: API did not reject breached password with HTTP 400! Got ${res.status}`);
  }
  console.log('PASS: Signup API rejected breached password with HTTP 400 and clear HIBP alert.');

  console.log('\n=============================================================');
  console.log('TEST 6: SIGNUP API ENDPOINT ACCEPTANCE OF STRONG PASSWORD');
  console.log('=============================================================');
  const cleanEmail = `officer_valid_${Date.now()}@delhi.gov.in`;
  const cleanBadge = `DL-LM-${Date.now().toString().slice(-4)}`;
  const goodRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '192.168.1.189',
    },
    body: JSON.stringify({
      badgeNumber: cleanBadge,
      fullName: 'Valid Inspector',
      email: cleanEmail,
      password: strongPwd,
      assignedDistrict: 'South Delhi',
    }),
  });

  const goodData = await goodRes.json();
  const setCookie = goodRes.headers.get('set-cookie');
  console.log('HTTP Status:', goodRes.status);
  console.log('Inspector Created:', goodData.inspector?.badgeNumber);
  console.log('Session Cookie Issued:', Boolean(setCookie));

  if (goodRes.status !== 201 || !goodData.success || !setCookie) {
    throw new Error(`FAIL: Signup API rejected strong password! Got ${goodRes.status}`);
  }
  console.log('PASS: Successful signup with strong passphrase, session cookie issued.');

  console.log('\n=============================================================');
  console.log('ALL PASSWORD POLICY & HAVEIBEENPWNED TESTS PASSED SUCCESSFULLY');
  console.log('=============================================================\n');
}

runPolicyTests().catch(err => {
  console.error('\nTEST SUITE ERROR:', err.message);
  process.exit(1);
});
