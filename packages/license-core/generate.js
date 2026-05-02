const crypto = require('crypto');

/**
 * Plan definitions with license prefix and feature limits.
 */
const PLANS = {
  starter: {
    prefix: 'TRB-S',
    stores: 1,
    devices: 2,
    cashiers: 3,
    label: 'Starter',
    monthly: 990000,   // ₦9,900 in kobo
    yearly: 9900000,   // ₦99,000 in kobo
    lifetime: 14900000, // ₦149,000 in kobo
  },
  business: {
    prefix: 'TRB-B',
    stores: 5,
    devices: 10,
    cashiers: 25,
    label: 'Business',
    monthly: 2490000,
    yearly: 24900000,
    lifetime: 34900000,
  },
  enterprise: {
    prefix: 'TRB-E',
    stores: 99,
    devices: 99,
    cashiers: 99,
    label: 'Enterprise',
    monthly: 0,  // Custom pricing
    yearly: 0,
    lifetime: 0,
  },
};

/**
 * Generates a unique license key for a tenant and plan.
 * Format: TRB-{P}{XXX}-XXXX-XXXX-XXXX
 * Example: TRB-SA7K2-9PL4-MN83-QR51
 *
 * @param {string} tenantId - UUID of the tenant
 * @param {string} plan - Plan tier: starter | business | enterprise
 * @returns {string} License key
 */
function generateLicenseKey(tenantId, plan) {
  // Build entropy from tenant + timestamp + random bytes
  const entropy = `${tenantId}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(entropy).digest('hex').toUpperCase();

  // Extract 4 segments of 4 characters each
  const seg1 = hash.slice(0, 4);
  const seg2 = hash.slice(4, 8);
  const seg3 = hash.slice(8, 12);
  const seg4 = hash.slice(12, 16);

  const prefix = PLANS[plan]?.prefix || 'TRB';
  return `${prefix}-${seg1}-${seg2}-${seg3}-${seg4}`;
}

/**
 * Creates a cryptographic hash of a license key for secure storage.
 * Uses HMAC-SHA256 with a server-side secret.
 *
 * @param {string} key - The plaintext license key
 * @param {string} [secret] - The HMAC secret (defaults to env var)
 * @returns {string} Hex-encoded HMAC hash
 */
function hashLicenseKey(key, secret) {
  const s = secret || process.env.LICENSE_SECRET;
  if (!s) throw new Error('LICENSE_SECRET is required for hashing');
  return crypto.createHmac('sha256', s).update(key).digest('hex');
}

/**
 * Encrypts a license key using AES-256-CBC for local storage.
 *
 * @param {string} key - The plaintext license key
 * @param {string} password - Encryption password (device-specific)
 * @returns {{ iv: string, encrypted: string }} Encrypted data
 */
function encryptLicenseKey(key, password) {
  const derivedKey = crypto.scryptSync(password, 'treabyn-salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encrypted };
}

/**
 * Decrypts an AES-256-CBC encrypted license key.
 *
 * @param {{ iv: string, encrypted: string }} data - Encrypted data
 * @param {string} password - Decryption password (device-specific)
 * @returns {string} Plaintext license key
 */
function decryptLicenseKey(data, password) {
  const derivedKey = crypto.scryptSync(password, 'treabyn-salt', 32);
  const iv = Buffer.from(data.iv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  generateLicenseKey,
  hashLicenseKey,
  encryptLicenseKey,
  decryptLicenseKey,
  PLANS,
};
