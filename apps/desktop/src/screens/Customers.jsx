import { useState } from 'react';
import { Search, Plus, Phone, Mail, MapPin, Banknote, X, Users, AlertCircle, Check, CreditCard } from 'lucide-react';
import useCustomers from '../store/useCustomers';
import KPICard from '../components/KPICard';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function Customers() {
  const cust = useCustomers();
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showPay, setShowPay] = useState(null); // customer object
  const [payAmt, setPayAmt] = useState('');
  const [payNote, setPayNote] = useState('');
  const [showHistory, setShowHistory] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [editId, setEditId] = useState(null);

  const filtered = cust.customers.filter((c) => {
    const q = query.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const debtors = cust.getDebtors();
  const totalDebt = cust.getTotalDebt();

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) { cust.updateCustomer(editId, form); }
    else { cust.addCustomer(form); }
    setShowAdd(false);
    setEditId(null);
    setForm({ name: '', phone: '', email: '', address: '' });
  };

  const handleCollect = () => {
    if (!showPay || !payAmt) return;
    cust.collectPayment(showPay.id, Number(payAmt), payNote);
    setShowPay(null);
    setPayAmt('');
    setPayNote('');
  };

  const openEdit = (c) => {
    setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address });
    setEditId(c.id);
    setShowAdd(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Customers</h1>
          <p className="text-gray-500 text-sm">{cust.customers.length} customers · {debtors.length} with outstanding balance</p>
        </div>
        <button onClick={() => { setForm({ name: '', phone: '', email: '', address: '' }); setEditId(null); setShowAdd(true); }} className="btn-primary !text-xs flex items-center gap-1.5"><Plus size={13} />Add Customer</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard icon={Users} label="Total Customers" value={String(cust.customers.length)} color="blue" />
        <KPICard icon={AlertCircle} label="Active Debtors" value={String(debtors.length)} color="red" />
        <KPICard icon={CreditCard} label="Total Outstanding" value={fmt(totalDebt)} color="yellow" />
        <KPICard icon={Banknote} label="Collections Today" value={fmt(cust.transactions.filter(t => t.type === 'PAYMENT' && t.date.startsWith(new Date().toISOString().slice(0, 10))).reduce((s, t) => s + t.amount, 0))} color="green" />
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers…" className="input-default !pl-8 !py-2 !text-xs" />
      </div>

      {/* Table */}
      <div className="white-card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {['Customer', 'Phone', 'Email', 'Balance Owed', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] text-gray-400 uppercase tracking-wide font-semibold text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">{c.name}</div>
                      <div className="text-[10px] text-gray-400">{c.address || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{c.phone || '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{c.email || '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`font-bold text-xs ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {c.balance > 0 ? fmt(c.balance) : 'Settled'}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    {c.balance > 0 && (
                      <button onClick={() => { setShowPay(c); setPayAmt(''); setPayNote(''); }} className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-[10px] font-bold hover:bg-green-100 transition-colors border-none">Collect</button>
                    )}
                    <button onClick={() => setShowHistory(c)} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold hover:bg-blue-100 transition-colors border-none">History</button>
                    <button onClick={() => openEdit(c)} className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md text-[10px] font-bold hover:bg-gray-100 transition-colors border-none">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">{editId ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowAdd(false)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 border-none"><X size={14} /></button>
            </div>
            <div className="flex flex-col gap-3">
              {[['Customer Name *', 'name', 'e.g. Mama Tolu', Users], ['Phone', 'phone', '08012345678', Phone], ['Email', 'email', 'customer@email.com', Mail], ['Address', 'address', 'e.g. Wuse Market, Abuja', MapPin]].map(([label, key, ph, Icon]) => (
                <div key={key}>
                  <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">{label}</label>
                  <div className="relative">
                    <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={ph} className="input-default !pl-9" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} className="btn-primary flex-1 !text-xs">{editId ? 'Update' : 'Add Customer'}</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 !text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showPay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowPay(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[380px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Collect Payment</h3>
              <button onClick={() => setShowPay(null)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 border-none"><X size={14} /></button>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <div className="text-xs text-red-500 font-bold mb-0.5">{showPay.name}</div>
              <div className="text-lg font-extrabold text-red-600">Owes {fmt(showPay.balance)}</div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Amount Collected (₦)</label>
                <input type="number" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} placeholder="0.00" className="input-default" autoFocus max={showPay.balance} />
              </div>
              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Note (Optional)</label>
                <input value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="e.g. Cash collected at shop" className="input-default" />
              </div>
            </div>
            <button onClick={handleCollect} disabled={!payAmt || Number(payAmt) <= 0} className="btn-primary w-full mt-4 !text-xs flex items-center justify-center gap-1.5"><Check size={13} />Record Payment</button>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowHistory(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[70vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">{showHistory.name} — Transaction History</h3>
              <button onClick={() => setShowHistory(null)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 border-none"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cust.getCustomerTransactions(showHistory.id).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No transactions yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {cust.getCustomerTransactions(showHistory.id).sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                      <div>
                        <div className={`text-xs font-bold ${t.type === 'DEBT' ? 'text-red-600' : 'text-green-600'}`}>
                          {t.type === 'DEBT' ? 'Credit Sale' : 'Payment Collected'}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{t.note} · {new Date(t.date).toLocaleDateString('en-GB')}</div>
                      </div>
                      <div className={`font-bold text-sm ${t.type === 'DEBT' ? 'text-red-600' : 'text-green-600'}`}>
                        {t.type === 'DEBT' ? '+' : '-'}{fmt(t.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
