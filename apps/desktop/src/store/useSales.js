import { create } from 'zustand';

const SEED_SALES = [
  { id: 's1', receipt_no: 'TRB-ABJ-20260426-000004', store: 'Treabyn Abuja', cashier: 'Admin', payment_method: 'cash', subtotal: 2000, discount: 0, vat_amount: 150, total: 2150, status: 'completed', created_at: '2026-04-26 09:20' },
  { id: 's2', receipt_no: 'TRB-ABJ-20260425-000003', store: 'Treabyn Abuja', cashier: 'Admin', payment_method: 'cash', subtotal: 200, discount: 0, vat_amount: 15, total: 215, status: 'completed', created_at: '2026-04-25 17:44' },
  { id: 's3', receipt_no: 'TRB-ENU-20260425-000002', store: 'Treabyn Enugu', cashier: 'Emeka', payment_method: 'transfer', subtotal: 200, discount: 0, vat_amount: 15, total: 215, status: 'completed', created_at: '2026-04-25 16:48' },
  { id: 's4', receipt_no: 'TRB-ENU-20260425-000001', store: 'Treabyn Enugu', cashier: 'Emeka', payment_method: 'card', subtotal: 2800, discount: 50, vat_amount: 206.25, total: 2956.25, status: 'completed', created_at: '2026-04-25 16:46' },
  { id: 's5', receipt_no: 'TRB-ABJ-20260424-000001', store: 'Treabyn Abuja', cashier: 'Admin', payment_method: 'cash', subtotal: 1500, discount: 0, vat_amount: 112.5, total: 1612.5, status: 'cancelled', created_at: '2026-04-24 11:00' },
];

let saleCounter = 6;

const useSales = create((set, get) => ({
  sales: SEED_SALES,
  loading: false,

  generateReceiptNo: (storeCode = 'ABJ') => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(saleCounter++).padStart(6, '0');
    return `TRB-${storeCode}-${dateStr}-${seq}`;
  },

  addSale: (sale) => set((state) => ({
    sales: [sale, ...state.sales],
  })),

  cancelSale: (id) => set((state) => ({
    sales: state.sales.map(s => s.id === id ? { ...s, status: 'cancelled' } : s),
  })),

  getTodaySales: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().sales.filter(s => s.created_at.startsWith(today) && s.status === 'completed');
  },

  getTodayRevenue: () => {
    return get().getTodaySales().reduce((sum, s) => sum + s.total, 0);
  },

  getCompletedCount: () => get().sales.filter(s => s.status === 'completed').length,
  getCancelledCount: () => get().sales.filter(s => s.status === 'cancelled').length,
  getTotalValue: () => get().sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0),

  getWeeklyBreakdown: () => {
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = DAYS.map(d => ({ d, r: 0 }));
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    get().sales.forEach(s => {
      const d = new Date(s.created_at);
      if (d >= weekAgo) {
        data[d.getDay()].r += s.total || 0;
      }
    });
    return data;
  },
}));

export default useSales;
