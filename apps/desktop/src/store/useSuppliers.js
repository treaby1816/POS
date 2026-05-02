import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SEED_SUPPLIERS = [
  { id: '1', name: 'Dufil Prima Foods', contact: 'Alhaji Musa', phone: '08034567890', email: 'sales@dufil.com', address: 'Indomie Way, Lagos' },
  { id: '2', name: 'FrieslandCampina', contact: 'Sandra Obi', phone: '08023456789', email: 'orders@friesland.ng', address: 'Ikeja, Lagos' },
  { id: '3', name: 'Nigerian Bottling Co.', contact: 'Chidi Eze', phone: '08012345678', email: 'supply@nbc.com', address: 'Matori, Lagos' },
  { id: '4', name: 'Flour Mills of Nigeria', contact: 'Adamu Bello', phone: '08045678901', email: 'trade@fmn.com', address: 'Apapa, Lagos' },
  { id: '5', name: 'Reckitt Benckiser', contact: 'Grace Nnadi', phone: '08056789012', email: 'nigeria@reckitt.com', address: 'Victoria Island, Lagos' },
];

const useSuppliers = create(
  persist(
    (set, get) => ({
      suppliers: SEED_SUPPLIERS,
      purchaseOrders: [],

      // ── Supplier CRUD ──
      addSupplier: (data) =>
        set((s) => ({
          suppliers: [
            ...s.suppliers,
            { id: crypto.randomUUID(), ...data },
          ],
        })),

      updateSupplier: (id, data) =>
        set((s) => ({
          suppliers: s.suppliers.map((sup) =>
            sup.id === id ? { ...sup, ...data } : sup
          ),
        })),

      deleteSupplier: (id) =>
        set((s) => ({
          suppliers: s.suppliers.filter((sup) => sup.id !== id),
        })),

      // ── Purchase Order CRUD ──
      createPO: (data) =>
        set((s) => ({
          purchaseOrders: [
            ...s.purchaseOrders,
            {
              id: crypto.randomUUID(),
              poNumber: `PO-${String(s.purchaseOrders.length + 1).padStart(4, '0')}`,
              supplierId: data.supplierId,
              supplierName: data.supplierName,
              items: data.items, // [{ name, qty, unitCost }]
              totalCost: data.items.reduce((sum, i) => sum + i.qty * i.unitCost, 0),
              status: 'pending', // pending → received → cancelled
              notes: data.notes || '',
              created_at: new Date().toISOString(),
              received_at: null,
            },
          ],
        })),

      // Mark PO as received — this is the hook to update inventory
      receivePO: (poId, onReceiveCallback) => {
        const po = get().purchaseOrders.find((p) => p.id === poId);
        if (!po || po.status !== 'pending') return;

        set((s) => ({
          purchaseOrders: s.purchaseOrders.map((p) =>
            p.id === poId
              ? { ...p, status: 'received', received_at: new Date().toISOString() }
              : p
          ),
        }));

        // Callback to update inventory with the received items
        if (onReceiveCallback) onReceiveCallback(po.items);
      },

      cancelPO: (poId) =>
        set((s) => ({
          purchaseOrders: s.purchaseOrders.map((p) =>
            p.id === poId ? { ...p, status: 'cancelled' } : p
          ),
        })),

      getPOsBySupplier: (supplierId) =>
        get().purchaseOrders.filter((p) => p.supplierId === supplierId),

      getPendingPOs: () =>
        get().purchaseOrders.filter((p) => p.status === 'pending'),
    }),
    { name: 'treabyn-suppliers' }
  )
);

export default useSuppliers;
