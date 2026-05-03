import { useState } from 'react';
import { Plus, Trash2, X, DollarSign, TrendingDown, Calendar, Tag, Filter } from 'lucide-react';
import useExpenses from '../store/useExpenses';
import KPICard from '../components/KPICard';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function Expenses() {
  const exp = useExpenses();
  const [showAdd, setShowAdd] = useState(false);
  const [limit, setLimit] = useState(30);
  const [catFilter, setCatFilter] = useState('All');
  const [form, setForm] = useState({ category: 'Fuel / Diesel', description: '', amount: '', date: new Date().toISOString().slice(0, 10) });

  const total = exp.getTotalExpenses();
  const byCategory = exp.getExpensesByCategory();
  const filtered = catFilter === 'All' ? exp.expenses : exp.expenses.filter((e) => e.category === catFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const displayed = sorted.slice(0, limit);

  const thisMonth = new Date();
  const monthlyTotal = exp.getMonthlyTotal(thisMonth.getMonth(), thisMonth.getFullYear());

  const handleSave = () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    exp.addExpense(form);
    setShowAdd(false);
    setForm({ category: 'Fuel / Diesel', description: '', amount: '', date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Expenses</h1>
          <p className="text-gray-500 text-sm">{exp.expenses.length} records · Track operating costs</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary !text-xs flex items-center gap-1.5"><Plus size={13} />Record Expense</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard icon={DollarSign} label="Total Expenses" value={fmt(total)} color="red" />
        <KPICard icon={Calendar} label="This Month" value={fmt(monthlyTotal)} color="yellow" />
        <KPICard icon={Tag} label="Categories Used" value={String(byCategory.length)} color="blue" />
        <KPICard icon={TrendingDown} label="Avg per Record" value={fmt(exp.expenses.length ? total / exp.expenses.length : 0)} color="teal" />
      </div>

      {/* Category Breakdown */}
      {byCategory.length > 0 && (
        <div className="white-card">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Spending by Category</h3>
          <div className="flex flex-wrap gap-2">
            {byCategory.map((c) => (
              <div key={c.category} className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2 flex-shrink-0">
                <div className="text-[10px] text-gray-400 font-bold uppercase">{c.category}</div>
                <div className="text-sm font-extrabold text-gray-900">{fmt(c.amount)}</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5">
                  <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${Math.min(100, (c.amount / total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter + Table */}
      <div className="flex items-center gap-2 mb-1">
        <Filter size={13} className="text-gray-400" />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input-default !w-auto !text-xs !py-1.5">
          <option>All</option>
          {exp.categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="white-card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {['Date', 'Category', 'Description', 'Amount', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] text-gray-400 uppercase tracking-wide font-semibold text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((e) => (
              <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5 text-xs text-gray-500">{e.date}</td>
                <td className="px-4 py-2.5">
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{e.category}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-700">{e.description || '—'}</td>
                <td className="px-4 py-2.5 font-bold text-red-600 text-xs">{fmt(e.amount)}</td>
                <td className="px-4 py-2">
                  <button onClick={() => exp.deleteExpense(e.id)} className="w-6 h-6 rounded-md border border-gray-100 bg-transparent text-gray-400 hover:text-red-500 hover:border-red-500 flex items-center justify-center transition-colors"><Trash2 size={11} /></button>
                </td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">No expenses recorded yet.</td></tr>
            )}
          </tbody>
        </table>
        {sorted.length > limit && (
          <div className="p-4 border-t border-gray-100 text-center">
            <button onClick={() => setLimit(l => l + 30)} className="bg-transparent border-none text-amber-600 font-bold text-xs hover:text-amber-700">Load More Records (+30)</button>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Record Expense</h3>
              <button onClick={() => setShowAdd(false)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 border-none"><X size={14} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input-default">
                  {exp.categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Amount (₦) *</label>
                <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" className="input-default" autoFocus />
              </div>
              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="e.g. Diesel for generator" className="input-default" />
              </div>
              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="input-default" />
              </div>
            </div>
            <button onClick={handleSave} className="btn-primary w-full mt-4 !text-xs">Save Expense</button>
          </div>
        </div>
      )}
    </div>
  );
}
