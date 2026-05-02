import { create } from 'zustand';

const DEMO_LIMITS = { maxSalesPerDay: 10, maxProducts: 5, maxUsers: 1 };

const useLicense = create((set, get) => ({
  licenseKey: null,
  plan: null,
  isDemo: true,
  isActivated: false,
  tenantName: null,
  expiresAt: null,
  maxStores: 1,
  maxDevices: 2,
  maxCashiers: 3,
  loading: false,
  error: null,
  demoLimits: DEMO_LIMITS,

  activate: async (key) => {
    set({ loading: true, error: null });
    try {
      // Try Electron API first, fallback to mock
      let result;
      if (window.treabynAPI?.validateLicense) {
        result = await window.treabynAPI.validateLicense(key);
      } else {
        // Web/dev fallback — mock validation
        await new Promise(r => setTimeout(r, 1500));
        if (key && key.startsWith('TRB-')) {
          result = { valid: true, plan: 'business', tenant_name: 'Demo Business', max_stores: 5, max_devices: 10, max_cashiers: 25 };
        } else {
          result = { valid: false, reason: 'Invalid license key format' };
        }
      }
      if (result.valid) {
        set({ licenseKey: key, plan: result.plan, isDemo: false, isActivated: true, tenantName: result.tenant_name, expiresAt: result.expires_at, maxStores: result.max_stores || 1, maxDevices: result.max_devices || 2, maxCashiers: result.max_cashiers || 3, loading: false });
        return { success: true };
      }
      set({ loading: false, error: result.reason });
      return { success: false, reason: result.reason };
    } catch (err) {
      set({ loading: false, error: 'Validation failed. Please try again.' });
      return { success: false, reason: err.message };
    }
  },

  enterDemo: () => {
    set({ isDemo: true, isActivated: true, plan: 'demo', tenantName: 'Demo Store' });
  },

  logout: () => {
    set({ licenseKey: null, plan: null, isDemo: true, isActivated: false, tenantName: null, expiresAt: null, error: null });
  },

  canAccess: (feature) => {
    const { isDemo } = get();
    if (!isDemo) return true;
    const allowed = ['dashboard', 'pos', 'sales', 'inventory'];
    return allowed.includes(feature);
  },
}));

export default useLicense;
