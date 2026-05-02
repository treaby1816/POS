import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  try {
    const { key, deviceId } = await req.json();
    if (!key) {
      return new Response(JSON.stringify({ valid: false, reason: 'License key is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: license, error } = await supabase.from('licenses').select('*, tenants(*)').eq('license_key', key.trim().toUpperCase()).single();
    if (error || !license) {
      return new Response(JSON.stringify({ valid: false, reason: 'Invalid license key' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (!license.is_active || license.revoked_at) {
      return new Response(JSON.stringify({ valid: false, reason: 'License has been revoked' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, reason: 'License has expired', expired: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (license.tenants?.status === 'suspended') {
      return new Response(JSON.stringify({ valid: false, reason: 'Account has been suspended' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const fingerprints = license.device_fingerprints || [];
    if (deviceId && !fingerprints.includes(deviceId)) {
      if (fingerprints.length >= license.max_devices) {
        return new Response(JSON.stringify({ valid: false, reason: `Device limit reached (${license.max_devices} devices).` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      fingerprints.push(deviceId);
    }
    await supabase.from('licenses').update({ device_fingerprints: fingerprints, last_seen_at: new Date().toISOString(), activated_at: license.activated_at || new Date().toISOString() }).eq('id', license.id);
    return new Response(JSON.stringify({ valid: true, plan: license.plan, expires_at: license.expires_at, max_stores: license.max_stores, max_devices: license.max_devices, max_cashiers: license.max_cashiers, tenant_name: license.tenants?.name, tenant_id: license.tenant_id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Validate license error:', err);
    return new Response(JSON.stringify({ valid: false, reason: 'Validation service error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
