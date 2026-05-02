import { create } from 'zustand';

// Demo/seed products
const SEED_PRODUCTS = [
  { id: '1', name: 'Mzor B2 Tablet', barcode: '9865895465', selling_price: 500, cost_price: 400, stock_qty: 200, low_stock_at: 10, category: 'Electronics', supplier: 'Arbishop', is_active: true },
  { id: '2', name: 'Homebar Chocolate', barcode: '256658545', selling_price: 200, cost_price: 150, stock_qty: 474, low_stock_at: 10, category: 'Confectionery', supplier: '—', is_active: true },
  { id: '3', name: 'Indomie Noodles', barcode: '112233445', selling_price: 150, cost_price: 100, stock_qty: 320, low_stock_at: 10, category: 'Food', supplier: 'Dufil', is_active: true },
  { id: '4', name: 'Peak Milk 400g', barcode: '998877665', selling_price: 800, cost_price: 620, stock_qty: 85, low_stock_at: 50, category: 'Dairy', supplier: 'FrieslandCampina', is_active: true },
  { id: '5', name: 'Coca-Cola 500ml', barcode: '556677889', selling_price: 300, cost_price: 220, stock_qty: 600, low_stock_at: 20, category: 'Beverages', supplier: 'NBC', is_active: true },
  { id: '6', name: 'Semovita 1kg', barcode: '334455667', selling_price: 950, cost_price: 780, stock_qty: 40, low_stock_at: 15, category: 'Food', supplier: 'Flour Mills', is_active: true },
  { id: '7', name: 'Dettol Soap', barcode: '778899001', selling_price: 400, cost_price: 300, stock_qty: 150, low_stock_at: 10, category: 'FMCG', supplier: 'Reckitt', is_active: true },
  { id: '8', name: 'Hollandia Yoghurt', barcode: '445566778', selling_price: 350, cost_price: 260, stock_qty: 92, low_stock_at: 20, category: 'Dairy', supplier: 'Chi Ltd', is_active: true },
  { id: '9', name: 'Golden Penny Rice 5kg', barcode: '667788990', selling_price: 4500, cost_price: 3800, stock_qty: 60, low_stock_at: 10, category: 'Food', supplier: 'Flour Mills', is_active: true },
  { id: '10', name: 'Bigi Cola 600ml', barcode: '889900112', selling_price: 200, cost_price: 140, stock_qty: 450, low_stock_at: 30, category: 'Beverages', supplier: 'Rite Foods', is_active: true },
];

const useInventory = create((set, get) => ({
  products: SEED_PRODUCTS,
  stockMovements: [
    { id: 'm-1', productId: '1', productName: 'Mzor B2 Tablet', type: 'IN', qty: 200, balance: 200, reason: 'Initial Stock', time: '10:00 AM', date: '2026-05-01' },
    { id: 'm-2', productId: '2', productName: 'Homebar Chocolate', type: 'IN', qty: 500, balance: 500, reason: 'Initial Stock', time: '10:05 AM', date: '2026-05-01' },
  ],
  loading: false,
  searchQuery: '',
  categoryFilter: 'All',

  setSearch: (q) => set({ searchQuery: q }),
  setCategoryFilter: (cat) => set({ categoryFilter: cat }),

  getFiltered: () => {
    const { products, searchQuery, categoryFilter } = get();
    return products.filter(p => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery));
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchCat && p.is_active;
    });
  },

  getCategories: () => {
    const cats = [...new Set(get().products.map(p => p.category))];
    return ['All', ...cats.sort()];
  },

  getLowStock: () => get().products.filter(p => p.stock_qty <= p.low_stock_at && p.is_active),

  addMovement: (productId, productName, type, qty, balance, reason) => {
    const now = new Date();
    const movement = {
      id: crypto.randomUUID(),
      productId,
      productName,
      type,
      qty,
      balance,
      reason,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0],
    };
    set(state => ({ stockMovements: [movement, ...state.stockMovements].slice(0, 100) }));
  },

  addProduct: (product) => {
    const id = crypto.randomUUID();
    set((state) => ({ products: [...state.products, { ...product, id, is_active: true }] }));
    get().addMovement(id, product.name, 'IN', product.stock_qty, product.stock_qty, 'New Product Added');
  },

  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, is_active: false } : p),
  })),

  getUnits: () => ['Pcs', 'Boxes', 'Sqm', 'Kg', 'Litres', 'Yards', 'Pack', 'Roll'],

  adjustStock: (id, delta) => {
    set((state) => {
      const products = state.products.map(p => {
        if (p.id === id) {
          const newQty = Math.max(0, p.stock_qty + delta);
          get().addMovement(id, p.name, delta > 0 ? 'IN' : 'OUT', Math.abs(delta), newQty, 'Manual Adjustment');
          return { ...p, stock_qty: newQty };
        }
        return p;
      });
      return { products };
    });
  },

  deductStock: (cartItems) => {
    set((state) => {
      const products = state.products.map(p => {
        const cartItem = cartItems.find(i => i.id === p.id);
        if (cartItem) {
          const newQty = Math.max(0, p.stock_qty - cartItem.qty);
          get().addMovement(p.id, p.name, 'OUT', cartItem.qty, newQty, 'POS Sale');
          return { ...p, stock_qty: newQty };
        }
        return p;
      });
      return { products };
    });
  },
}));

export default useInventory;
