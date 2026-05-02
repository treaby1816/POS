const crypto = require('crypto');

/**
 * License key format regex: TRB-{PLAN_CHAR}{3CHARS}-XXXX-XXXX-XXXX
 * Examples: TRB-SA7K2-9PL4-MN83-QR51, TRB-B1234-ABCD-EF56-7890
 */
const LICENSE_KEY_REGEX = /^TRB-[SBE][A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * Validates that a license key matches the expected format.
 *
 * @param {string} key - The license key to validate
 * @returns {{ valid: boolean, error?: string }}
 */
function validateLicenseFormat(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'License key is required' };
  }

  const trimmed = key.trim().toUpperCase();

  if (!LICENSE_KEY_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid license key format. Expected: TRB-XXXX-XXXX-XXXX-XXXX',
    };
  }

  return { valid: true };
}

/**
 * Extracts the plan tier from a license key prefix.
 *
 * @param {string} key - The license key
 * @returns {string|null} Plan name or null
 */
function extractPlanFromKey(key) {
  if (!key) return null;
  const trimmed = key.trim().toUpperCase();
  const planChar = trimmed.charAt(4); // After "TRB-"
  const planMap = { S: 'starter', B: 'business', E: 'enterprise' };
  return planMap[planChar] || null;
}

/**
 * Verifies a license key against its stored HMAC hash.
 *
 * @param {string} key - The plaintext license key
 * @param {string} storedHash - The stored HMAC hash
 * @param {string} [secret] - The HMAC secret
 * @returns {boolean}
 */
function verifyLicenseHash(key, storedHash, secret) {
  const s = secret || process.env.LICENSE_SECRET;
  if (!s) throw new Error('LICENSE_SECRET is required for verification');

  const computed = crypto.createHmac('sha256', s).update(key).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(computed, 'hex'),
    Buffer.from(storedHash, 'hex')
  );
}

/**
 * Checks if a license expiry date has passed.
 *
 * @param {string|Date|null} expiresAt - Expiry timestamp (null = lifetime)
 * @returns {boolean} True if still valid
 */
function isNotExpired(expiresAt) {
  if (!expiresAt) return true; // Lifetime license
  const expiry = new Date(expiresAt);
  return expiry.getTime() > Date.now();
}

/**
 * Demo mode limits for unlicensed/expired usage.
 */
const DEMO_LIMITS = {
  maxSalesPerDay: 10,
  maxProducts: 5,
  maxUsers: 1,
  features: ['pos', 'dashboard'], // Only these screens available
};

module.exports = {
  validateLicenseFormat,
  extractPlanFromKey,
  verifyLicenseHash,
  isNotExpired,
  LICENSE_KEY_REGEX,
  DEMO_LIMITS,
};
