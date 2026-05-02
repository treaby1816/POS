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
        // Strict production mode: No mock fallback allowed
        result = { valid: false, reason: 'License validation service is unavailable on this platform.' };
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
