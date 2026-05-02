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
  loading: false,
  searchQuery: '',
  categoryFilter: 'All',

  setSearch: (q) => set({ searchQuery: q }),
  setCategoryFilter: (cat) => set({ categoryFilter: cat }),

  getFiltered: () => {
    const { products, searchQuery, categoryFilter } = get();
    return products.filter(p => {
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery));
      const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCat && p.is_active;
    });
  },

  getCategories: () => {
    const cats = [...new Set(get().products.map(p => p.category))];
    return ['All', ...cats.sort()];
  },

  getLowStock: () => get().products.filter(p => p.stock_qty <= p.low_stock_at && p.is_active),

  addProduct: (product) => set((state) => ({
    products: [...state.products, { ...product, id: crypto.randomUUID(), is_active: true }],
  })),

  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, is_active: false } : p),
  })),

  adjustStock: (id, delta) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, stock_qty: Math.max(0, p.stock_qty + delta) } : p),
  })),

  deductStock: (cartItems) => set((state) => ({
    products: state.products.map(p => {
      const cartItem = cartItems.find(i => i.id === p.id);
      return cartItem ? { ...p, stock_qty: Math.max(0, p.stock_qty - cartItem.qty) } : p;
    }),
  })),
}));

export default useInventory;
