/**
 * @treabyn/license-core
 *
 * Shared license key generation and validation logic
 * used by both the desktop app and Supabase edge functions.
 */

const {
  generateLicenseKey,
  hashLicenseKey,
  encryptLicenseKey,
  decryptLicenseKey,
  PLANS,
} = require('./generate');

const {
  validateLicenseFormat,
  extractPlanFromKey,
  verifyLicenseHash,
  isNotExpired,
  LICENSE_KEY_REGEX,
  DEMO_LIMITS,
} = require('./validate');

module.exports = {
  // Generation
  generateLicenseKey,
  hashLicenseKey,
  encryptLicenseKey,
  decryptLicenseKey,
  PLANS,

  // Validation
  validateLicenseFormat,
  extractPlanFromKey,
  verifyLicenseHash,
  isNotExpired,
  LICENSE_KEY_REGEX,
  DEMO_LIMITS,
};
