import { useState } from 'react';
import { Download, Banknote, CreditCard, Smartphone, Eye } from 'lucide-react';
import KPICard from '../components/KPICard';
import ReceiptModal from '../components/ReceiptModal';
import useSales from '../store/useSales';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function Sales() {
  const sales = useSales();
  const [storeFilter, setStoreFilter] = useState('All');
  const [viewReceipt, setViewReceipt] = useState(null);

  const filtered = sales.sales.filter(s => storeFilter === 'All' || s.store === storeFilter);

  const exportCSV = () => {
    const headers = 'Receipt No,Store,Cashier,Method,Subtotal,Discount,VAT,Total,Status,Date\n';
    const rows = filtered.map(s => `${s.receipt_no},${s.store},${s.cashier},${s.payment_method},${s.subtotal},${s.discount},${s.vat_amount},${s.total},${s.status},${s.created_at}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'treabyn-sales.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const PayIcon = ({ method }) => {
    if (method === 'cash') return <Banknote size={11} />;
    if (method === 'card') return <CreditCard size={11} />;
    return <Smartphone size={11} />;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Sales</h1><p className="text-gray-500 text-sm">All transaction records</p></div>
        <button onClick={exportCSV} className="btn-secondary !text-xs flex items-center gap-1.5"><Download size={12} />Export CSV</button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard icon={Download} label="Sales Records" value={String(sales.sales.length)} color="yellow" />
        <KPICard icon={Download} label="Completed" value={String(sales.getCompletedCount())} color="green" />
        <KPICard icon={Download} label="Cancelled" value={String(sales.getCancelledCount())} color="red" />
        <KPICard icon={Download} label="Total Value" value={fmt(sales.getTotalValue())} color="blue" />
      </div>

      {/* Table */}
      <div className="white-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          <input type="date" defaultValue="2026-04-01" className="input-default !w-auto !text-xs !py-1.5" />
          <span className="text-gray-300 text-xs">to</span>
          <input type="date" defaultValue="2026-04-27" className="input-default !w-auto !text-xs !py-1.5" />
          <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="input-default !w-auto !text-xs !py-1.5">
            <option>All</option><option>Treabyn Abuja</option><option>Treabyn Enugu</option>
          </select>
          <button className="btn-primary !text-xs !px-4 !py-1.5 ml-auto">Apply Filter</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50">
            {['Receipt No', 'Store', 'Cashier', 'Method', 'Subtotal', 'Disc', 'Total', 'Status', 'Date', ''].map(h => (
              <th key={h} className="px-3.5 py-2 text-[11px] text-gray-400 uppercase tracking-wide font-semibold text-left">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-3.5 py-2.5 font-mono text-amber-500 text-[11px] font-semibold">{s.receipt_no}</td>
                <td className="px-3.5 py-2.5 text-gray-500 text-xs">{s.store}</td>
                <td className="px-3.5 py-2.5 text-gray-600">{s.cashier}</td>
                <td className="px-3.5 py-2.5"><span className="flex items-center gap-1 text-gray-500 text-xs capitalize"><PayIcon method={s.payment_method} />{s.payment_method}</span></td>
                <td className="px-3.5 py-2.5 text-gray-500">{fmt(s.subtotal)}</td>
                <td className="px-3.5 py-2.5 text-green-600">{s.discount > 0 ? `-${fmt(s.discount)}` : '—'}</td>
                <td className="px-3.5 py-2.5 font-bold text-gray-900">{fmt(s.total)}</td>
                <td className="px-3.5 py-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
                </td>
                <td className="px-3.5 py-2.5 text-gray-400 text-[11px]">{s.created_at}</td>
                <td className="px-3.5 py-2.5">
                  <button onClick={() => setViewReceipt(s)} className="w-6 h-6 rounded-md border border-gray-100 bg-transparent text-gray-300 hover:text-blue-500 hover:border-blue-500 flex items-center justify-center transition-colors"><Eye size={11} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewReceipt && <ReceiptModal sale={viewReceipt} items={[]} onClose={() => setViewReceipt(null)} />}
    </div>
  );
}
