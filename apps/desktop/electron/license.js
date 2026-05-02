const crypto = require('crypto');
const os = require('os');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';

function getDeviceFingerprint() {
  const raw = `${os.hostname()}-${os.cpus()[0]?.model || 'cpu'}-${os.platform()}-${os.arch()}`;
  return crypto.createHash('md5').update(raw).digest('hex');
}

function isNotExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

async function validateLicense(key, db) {
  if (!key) return { valid: false, reason: 'License key is required' };

  // 1. Check local SQLite cache first (offline support)
  try {
    const stmt = db.prepare('SELECT * FROM local_license WHERE key = ?');
    stmt.bind([key]);
    const cached = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    if (cached && isNotExpired(cached.expires_at)) {
      // If cached within 7 days, use it
      const cacheAge = Date.now() - (cached.cached_at || 0);
      if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
        return { valid: true, plan: cached.plan, expires_at: cached.expires_at, tenant_name: cached.tenant_name, offline: true };
      }
    }

    // 2. Call Supabase edge function to validate online
    const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, deviceId: getDeviceFingerprint() }),
    });
    const data = await res.json();
    if (data.valid) {
      // Cache locally for offline use
      db.run('DELETE FROM local_license WHERE key = ?', [key]);
      db.run('INSERT INTO local_license (key, plan, expires_at, tenant_name, max_stores, max_devices, max_cashiers, cached_at) VALUES (?,?,?,?,?,?,?,?)',
        [key, data.plan, data.expires_at || '', data.tenant_name || '', data.max_stores || 1, data.max_devices || 2, data.max_cashiers || 3, Date.now()]);
      return data;
    }
    return { valid: false, reason: data.reason || 'Invalid license' };
  } catch (err) {
    // Network error — use cache if available
    try {
      const stmt = db.prepare('SELECT * FROM local_license WHERE key = ?');
      stmt.bind([key]);
      const cached = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();
      if (cached) return { valid: true, plan: cached.plan, expires_at: cached.expires_at, tenant_name: cached.tenant_name, offline: true };
    } catch {}
    return { valid: false, reason: 'Cannot validate — no internet and no cached license.' };
  }
}

module.exports = { validateLicense, getDeviceFingerprint };
