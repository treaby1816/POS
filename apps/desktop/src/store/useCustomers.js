import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCustomers = create(
  persist(
    (set, get) => ({
      customers: [],
      transactions: [], // debt payments / collections

      addCustomer: (data) =>
        set((s) => ({
          customers: [
            ...s.customers,
            {
              id: crypto.randomUUID(),
              name: data.name,
              phone: data.phone || '',
              email: data.email || '',
              address: data.address || '',
              balance: 0, // positive = customer owes us
              created_at: new Date().toISOString(),
            },
          ],
        })),

      updateCustomer: (id, data) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteCustomer: (id) =>
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
        })),

      // Called when a POS sale is made on credit
      addDebt: (customerId, amount, receiptNo) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === customerId ? { ...c, balance: c.balance + amount } : c
          ),
          transactions: [
            ...s.transactions,
            {
              id: crypto.randomUUID(),
              customerId,
              type: 'DEBT',
              amount,
              receiptNo: receiptNo || '',
              note: `Credit sale #${receiptNo || '—'}`,
              date: new Date().toISOString(),
            },
          ],
        })),

      // Called when customer pays off some/all of their debt
      collectPayment: (customerId, amount, note) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === customerId
              ? { ...c, balance: Math.max(0, c.balance - amount) }
              : c
          ),
          transactions: [
            ...s.transactions,
            {
              id: crypto.randomUUID(),
              customerId,
              type: 'PAYMENT',
              amount,
              receiptNo: '',
              note: note || 'Debt collection',
              date: new Date().toISOString(),
            },
          ],
        })),

      getCustomer: (id) => get().customers.find((c) => c.id === id),
      getDebtors: () => get().customers.filter((c) => c.balance > 0),
      getTotalDebt: () => get().customers.reduce((sum, c) => sum + c.balance, 0),
      getCustomerTransactions: (id) =>
        get().transactions.filter((t) => t.customerId === id),
    }),
    { name: 'treabyn-customers' }
  )
);

export default useCustomers;
