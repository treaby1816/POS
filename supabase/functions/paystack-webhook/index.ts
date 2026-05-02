import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac, createHash, randomBytes } from 'node:crypto';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY')!;
const LICENSE_SECRET = Deno.env.get('LICENSE_SECRET')!;

const PLAN_LIMITS: Record<string, { stores: number; devices: number; cashiers: number; prefix: string }> = {
  starter:    { stores: 1,  devices: 2,  cashiers: 3,  prefix: 'TRB-S' },
  business:   { stores: 5,  devices: 10, cashiers: 25, prefix: 'TRB-B' },
  enterprise: { stores: 99, devices: 99, cashiers: 99, prefix: 'TRB-E' },
};

function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
  return hash === signature;
}

function generateLicenseKey(tenantId: string, plan: string): string {
  const entropy = `${tenantId}-${Date.now()}-${randomBytes(16).toString('hex')}`;
  const hash = createHash('sha256').update(entropy).digest('hex').toUpperCase();
  const prefix = PLAN_LIMITS[plan]?.prefix || 'TRB';
  return `${prefix}-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
}

function hashLicenseKey(key: string): string {
  return createHmac('sha256', LICENSE_SECRET).update(key).digest('hex');
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

serve(async (req: Request) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';

    // Verify Paystack webhook signature
    if (!verifyPaystackSignature(body, signature)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const payload = JSON.parse(body);

    if (payload.event === 'charge.success') {
      const { email, metadata, reference, amount } = payload.data;
      const {
        owner_name,
        business_name,
        phone,
        state,
        plan = 'starter',
        billing = 'monthly',
      } = metadata || {};

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // 1. Create tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: business_name || 'My Business',
          owner_name: owner_name || 'Owner',
          email,
          phone: phone || '',
          state: state || '',
          plan,
          status: 'active',
        })
        .select()
        .single();

      if (tenantError) {
        console.error('Tenant creation error:', tenantError);
        return new Response(JSON.stringify({ error: 'Failed to create tenant' }), { status: 500 });
      }

      // 2. Generate license key
      const licenseKey = generateLicenseKey(tenant.id, plan);
      const keyHash = hashLicenseKey(licenseKey);

      // 3. Calculate expiry
      const now = new Date();
      let expiresAt: Date | null = null;
      if (billing === 'monthly') expiresAt = addMonths(now, 1);
      else if (billing === 'yearly') expiresAt = addYears(now, 1);
      // lifetime = null (never expires)

      // 4. Save license
      const { data: license, error: licenseError } = await supabase
        .from('licenses')
        .insert({
          tenant_id: tenant.id,
          license_key: licenseKey,
          key_hash: keyHash,
          plan,
          max_stores: PLAN_LIMITS[plan]?.stores || 1,
          max_devices: PLAN_LIMITS[plan]?.devices || 2,
          max_cashiers: PLAN_LIMITS[plan]?.cashiers || 3,
          expires_at: expiresAt?.toISOString() || null,
          is_active: true,
        })
        .select()
        .single();

      if (licenseError) {
        console.error('License creation error:', licenseError);
      }

      // 5. Save subscription
      await supabase.from('subscriptions').insert({
        tenant_id: tenant.id,
        license_id: license?.id,
        paystack_ref: reference,
        plan,
        amount_ngn: amount,
        billing_cycle: billing,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: expiresAt?.toISOString() || null,
      });

      // 6. Create default store
      await supabase.from('stores').insert({
        tenant_id: tenant.id,
        name: `${business_name || 'My'} Store`,
        state: state || '',
      });

      // 7. Send welcome email via Resend
      const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
      if (RESEND_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${RESEND_KEY}`,
            },
            body: JSON.stringify({
              from: Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@treabyn.com',
              to: [email],
              subject: 'Your Treabyn License Key is Ready 🎉',
              html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #f59e0b, #f97316); line-height: 48px; color: white; font-weight: 800; font-size: 22px;">T</div>
                    <h1 style="color: #1e293b; margin: 12px 0 4px;">Welcome to Treabyn!</h1>
                    <p style="color: #64748b;">Your ${plan} license is now active.</p>
                  </div>

                  <div style="background: #0a0f1e; border-radius: 16px; padding: 28px; text-align: center; margin: 24px 0;">
                    <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Your License Key</p>
                    <div style="background: #1e2d52; border: 1px solid #374b7c; border-radius: 12px; padding: 16px; font-family: monospace; font-size: 20px; font-weight: 700; color: #f59e0b; letter-spacing: 2px;">${licenseKey}</div>
                  </div>

                  <h3 style="color: #1e293b;">Steps to get started:</h3>
                  <ol style="color: #475569; line-height: 2;">
                    <li>Download Treabyn: <a href="https://github.com/treaby1816/POS/releases/latest" style="color: #f59e0b;">Download</a></li>
                    <li>Install on your Windows PC</li>
                    <li>Enter your license key when prompted</li>
                    <li>Add your products and start selling!</li>
                  </ol>

                  <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <table style="width: 100%; color: #475569; font-size: 14px;">
                      <tr><td style="padding: 4px 0;"><strong>Plan:</strong></td><td>${plan.charAt(0).toUpperCase() + plan.slice(1)}</td></tr>
                      <tr><td style="padding: 4px 0;"><strong>Valid until:</strong></td><td>${expiresAt ? expiresAt.toLocaleDateString() : 'Lifetime'}</td></tr>
                      <tr><td style="padding: 4px 0;"><strong>Stores:</strong></td><td>${PLAN_LIMITS[plan]?.stores || 1}</td></tr>
                      <tr><td style="padding: 4px 0;"><strong>Devices:</strong></td><td>${PLAN_LIMITS[plan]?.devices || 2}</td></tr>
                    </table>
                  </div>

                  <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">
                    Need help? <a href="mailto:support@treabyn.com" style="color: #f59e0b;">support@treabyn.com</a>
                  </p>
                </div>
              `,
            }),
          });
        } catch (emailErr) {
          console.error('Email sending failed:', emailErr);
        }
      }

      return new Response(JSON.stringify({ ok: true, tenantId: tenant.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle subscription events
    if (payload.event === 'subscription.disable') {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const subCode = payload.data?.subscription_code;
      if (subCode) {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('paystack_sub_code', subCode);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
