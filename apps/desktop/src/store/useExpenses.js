import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CATEGORIES = [
  'Fuel / Diesel',
  'Electricity',
  'Rent',
  'Staff Salary',
  'Transportation',
  'Repairs & Maintenance',
  'Marketing',
  'Supplies / Stationery',
  'Internet / Telecom',
  'Taxes & Levies',
  'Miscellaneous',
];

const useExpenses = create(
  persist(
    (set, get) => ({
      expenses: [],
      categories: CATEGORIES,
      totalExpenses: 0,

      addExpense: (data) =>
        set((s) => ({
          expenses: [
            ...s.expenses,
            {
              id: crypto.randomUUID(),
              category: data.category || 'Miscellaneous',
              description: data.description || '',
              amount: Number(data.amount) || 0,
              date: data.date || new Date().toISOString().slice(0, 10),
              recorded_by: data.recorded_by || 'Admin',
              created_at: new Date().toISOString(),
            },
          ],
          totalExpenses: s.totalExpenses + (Number(data.amount) || 0),
        })),

      deleteExpense: (id) =>
        set((s) => {
          const item = s.expenses.find(e => e.id === id);
          return {
            expenses: s.expenses.filter((e) => e.id !== id),
            totalExpenses: s.totalExpenses - (item ? item.amount : 0)
          };
        }),

      // Totals
      getTotalExpenses: () => get().totalExpenses,

      getExpensesByCategory: () => {
        const map = {};
        get().expenses.forEach((e) => {
          map[e.category] = (map[e.category] || 0) + e.amount;
        });
        return Object.entries(map)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount);
      },

      getMonthlyTotal: (month, year) => {
        return get().expenses
          .filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getFilteredExpenses: (categoryFilter, dateFrom, dateTo) => {
        return get().expenses.filter((e) => {
          const matchCat =
            !categoryFilter || categoryFilter === 'All' || e.category === categoryFilter;
          const matchFrom = !dateFrom || e.date >= dateFrom;
          const matchTo = !dateTo || e.date <= dateTo;
          return matchCat && matchFrom && matchTo;
        });
      },
    }),
    { name: 'treabyn-expenses' }
  )
);

export default useExpenses;
