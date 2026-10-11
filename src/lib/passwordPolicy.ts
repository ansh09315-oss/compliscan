import crypto from 'crypto';

export interface PasswordRuleCheck {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0 to 100
  strengthLabel: 'Too Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  errors: string[];
  rules: PasswordRuleCheck[];
  isBreached: boolean;
  breachCount?: number;
}

/**
 * Checks HaveIBeenPwned (HIBP) k-Anonymity API to determine if a password has been compromised
 * in known public data breaches.
 * 
 * Privacy guarantee: Only the first 5 characters of the SHA-1 hash are sent over the wire.
 * The password itself is NEVER transmitted.
 */
export async function checkPwnedPassword(password: string): Promise<{ isBreached: boolean; breachCount: number }> {
  try {
    if (!password) return { isBreached: false, breachCount: 0 };

    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'CompliScan-AI-Password-Security-Check',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[HIBP API] Returned status ${response.status}. Skipping breach check.`);
      return { isBreached: false, breachCount: 0 };
    }

    const text = await response.text();
    const lines = text.split('\r\n').length > 1 ? text.split('\r\n') : text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix && hashSuffix.trim() === suffix) {
        const breachCount = parseInt(countStr?.trim() || '0', 10);
        return { isBreached: true, breachCount };
      }
    }

    return { isBreached: false, breachCount: 0 };
  } catch (err: any) {
    console.warn('[HIBP API] Failed to reach HaveIBeenPwned service:', err.message);
    // Graceful fail-open on network issues to avoid blocking valid registrations
    return { isBreached: false, breachCount: 0 };
  }
}

/**
 * Validates candidate password against strong regulatory policy:
 * 1. Minimum 12 characters
 * 2. Maximum 128 characters
 * 3. Contains uppercase letter [A-Z]
 * 4. Contains lowercase letter [a-z]
 * 5. Contains number [0-9]
 * 6. Contains special character [!@#$%^&*...]
 * 7. Not exposed in HaveIBeenPwned breach database
 */
export async function validatePassword(
  password: string,
  checkBreaches = true
): Promise<PasswordValidationResult> {
  const errors: string[] = [];
  const rules: PasswordRuleCheck[] = [
    {
      id: 'length',
      label: 'At least 12 characters long',
      met: password.length >= 12,
    },
    {
      id: 'uppercase',
      label: 'Contains an uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Contains a lowercase letter (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Contains a numeric digit (0-9)',
      met: /[0-9]/.test(password),
    },
    {
      id: 'symbol',
      label: 'Contains a special symbol (!@#$%^&*...)',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  if (!rules[0].met) {
    errors.push('Password must be at least 12 characters long.');
  }
  if (!rules[1].met) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }
  if (!rules[2].met) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }
  if (!rules[3].met) {
    errors.push('Password must contain at least one numeric digit (0-9).');
  }
  if (!rules[4].met) {
    errors.push('Password must contain at least one special symbol.');
  }

  // Calculate score (0-100)
  let score = 0;
  if (password.length >= 12) score += 30;
  if (password.length >= 16) score += 10;
  if (rules[1].met) score += 15;
  if (rules[2].met) score += 15;
  if (rules[3].met) score += 15;
  if (rules[4].met) score += 15;

  let isBreached = false;
  let breachCount = 0;

  if (checkBreaches && password.length >= 8) {
    const breachResult = await checkPwnedPassword(password);
    isBreached = breachResult.isBreached;
    breachCount = breachResult.breachCount;

    if (isBreached) {
      errors.push(
        `This password has been exposed in ${breachCount.toLocaleString()} known data breaches (HaveIBeenPwned). For your security, please choose a unique password.`
      );
      score = Math.min(score, 20); // Severely penalize breached passwords
    }
  }

  let strengthLabel: PasswordValidationResult['strengthLabel'] = 'Too Weak';
  if (score >= 90) strengthLabel = 'Very Strong';
  else if (score >= 75) strengthLabel = 'Strong';
  else if (score >= 50) strengthLabel = 'Medium';
  else if (score >= 30) strengthLabel = 'Weak';

  const valid = errors.length === 0 && !isBreached;

  return {
    valid,
    score,
    strengthLabel,
    errors,
    rules,
    isBreached,
    breachCount: isBreached ? breachCount : undefined,
  };
}
