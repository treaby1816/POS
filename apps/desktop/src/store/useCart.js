import { create } from 'zustand';

const useCart = create((set, get) => ({
  items: [],
  paymentMethod: 'cash',
  discount: 0,

  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.id === product.id);
    if (existing) {
      return { items: state.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
    }
    return { items: [...state.items, { ...product, qty: 1 }] };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id),
  })),

  updateQty: (id, delta) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0),
  })),

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setDiscount: (amount) => set({ discount: Number(amount) || 0 }),
  clearCart: () => set({ items: [], discount: 0 }),

  get subtotal() { return get().items.reduce((sum, i) => sum + i.selling_price * i.qty, 0); },
  get vat() { return get().subtotal * 0.075; },
  get total() { return get().subtotal + get().vat - get().discount; },

  getSubtotal: () => get().items.reduce((sum, i) => sum + (i.selling_price || i.price) * i.qty, 0),
  getVat: () => get().getSubtotal() * 0.075,
  getTotal: () => get().getSubtotal() + get().getVat() - get().discount,
}));

export default useCart;
