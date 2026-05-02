import { useState } from 'react';
import { Search, Plus, Upload, Download, Package, Eye, Edit2, Trash2 } from 'lucide-react';
import useInventory from '../store/useInventory';
import ProductModal from '../components/ProductModal';
import KPICard from '../components/KPICard';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function Inventory() {
  const inv = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [adjustId, setAdjustId] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');

  const filtered = inv.getFiltered();
  const active = inv.products.filter(p => p.is_active);
  const lowStock = inv.getLowStock();
  const totalValue = active.reduce((s, p) => s + p.selling_price * p.stock_qty, 0);
  const totalCost = active.reduce((s, p) => s + p.cost_price * p.stock_qty, 0);

  const handleSave = (data) => {
    if (editProduct) { inv.updateProduct(editProduct.id, data); }
    else { inv.addProduct(data); }
    setShowModal(false); setEditProduct(null);
  };

  const handleAdjust = (id) => {
    if (adjustQty) { inv.adjustStock(id, Number(adjustQty)); setAdjustId(null); setAdjustQty(''); }
  };

  const exportCSV = () => {
    const h = 'Name,Barcode,Selling Price,Cost Price,Stock,Category,Supplier\n';
    const r = active.map(p => `${p.name},${p.barcode},${p.selling_price},${p.cost_price},${p.stock_qty},${p.category},${p.supplier}`).join('\n');
    const blob = new Blob([h + r], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'treabyn-inventory.csv'; a.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Inventory</h1><p className="text-gray-500 text-sm">{active.length} products · {lowStock.length} low stock</p></div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary !text-xs flex items-center gap-1.5"><Upload size={12} />Import</button>
          <button onClick={exportCSV} className="btn-secondary !text-xs flex items-center gap-1.5"><Download size={12} />Export CSV</button>
          <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="btn-primary !text-xs flex items-center gap-1.5"><Plus size={13} />Add Product</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard icon={Package} label="Total Products" value={String(active.length)} color="blue" />
        <KPICard icon={Package} label="Low Stock Items" value={String(lowStock.length)} color="red" />
        <KPICard icon={Package} label="Stock Value (Retail)" value={fmt(totalValue)} color="green" />
        <KPICard icon={Package} label="Stock Value (Cost)" value={fmt(totalCost)} color="teal" />
      </div>

      {/* Table */}
      <div className="white-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="relative flex-1 max-w-[280px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={inv.searchQuery} onChange={e => inv.setSearch(e.target.value)} placeholder="Search products…" className="input-default !pl-8 !py-2 !text-xs" />
          </div>
          <select value={inv.categoryFilter} onChange={e => inv.setCategoryFilter(e.target.value)} className="input-default !w-auto !text-xs !py-2">
            {inv.getCategories().map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50">
            {['Product', 'Barcode', 'Sell Price', 'Cost', 'Margin', 'Stock', 'Category', 'Supplier', ''].map(h => (
              <th key={h} className="px-3.5 py-2 text-[11px] text-gray-400 uppercase tracking-wide font-semibold text-left">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(p => {
              const margin = p.selling_price > 0 ? (((p.selling_price - p.cost_price) / p.selling_price) * 100).toFixed(1) : '0.0';
              return (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-[30px] h-[30px] rounded-lg bg-amber-500/[0.12] flex items-center justify-center flex-shrink-0"><Package size={12} className="text-amber-500" /></div>
                      <span className="font-semibold text-gray-900 text-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-gray-400 text-[11px]">{p.barcode}</td>
                  <td className="px-3.5 py-2.5 font-bold text-gray-900">{fmt(p.selling_price)}</td>
                  <td className="px-3.5 py-2.5 text-gray-500">{fmt(p.cost_price)}</td>
                  <td className="px-3.5 py-2.5 text-green-600 font-semibold">{margin}%</td>
                  <td className="px-3.5 py-2.5">
                    {adjustId === p.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="±qty" className="input-default !w-16 !text-xs !py-1" autoFocus />
                        <button onClick={() => handleAdjust(p.id)} className="text-[10px] bg-green-500 text-white px-2 py-1 rounded border-none font-bold">OK</button>
                        <button onClick={() => setAdjustId(null)} className="text-[10px] text-gray-400 border-none bg-transparent">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setAdjustId(p.id)} className={`px-2 py-0.5 rounded-md text-[11px] font-bold border-none ${p.stock_qty <= p.low_stock_at ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-50 text-gray-600'}`}>
                        {p.stock_qty}{p.stock_qty <= p.low_stock_at ? ' ⚠' : ''}
                      </button>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5"><span className="bg-blue-500/[0.08] text-blue-500 border border-blue-500/[0.18] rounded-full px-2 py-0.5 text-[11px] font-semibold">{p.category}</span></td>
                  <td className="px-3.5 py-2.5 text-gray-500 text-xs">{p.supplier}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="w-6 h-6 rounded-md border border-gray-100 bg-transparent text-gray-300 hover:text-amber-500 hover:border-amber-500 flex items-center justify-center transition-colors"><Edit2 size={11} /></button>
                      <button onClick={() => inv.deleteProduct(p.id)} className="w-6 h-6 rounded-md border border-gray-100 bg-transparent text-gray-300 hover:text-red-500 hover:border-red-500 flex items-center justify-center transition-colors"><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <ProductModal product={editProduct} onSave={handleSave} onClose={() => { setShowModal(false); setEditProduct(null); }} />}
    </div>
  );
}
