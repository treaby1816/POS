import { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Package } from 'lucide-react';
import useInventory from '../store/useInventory';
import ProductModal from '../components/ProductModal';
import KPICard from '../components/KPICard';
import { getSmartIcon } from '../utils/icons';

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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      inv.deleteProduct(id);
    }
  };

  const [tab, setTab] = useState('products');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Inventory</h1><p className="text-gray-500 text-sm">{active.length} products · {lowStock.length} low stock</p></div>
        <div className="flex gap-2 bg-gray-900/5 p-1.5 rounded-xl border border-gray-100">
          <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="btn-primary !text-[11px] !px-3 !py-1.5">Add Product</button>
          <button onClick={() => setTab(tab === 'products' ? 'ledger' : 'products')} className="btn-secondary !text-[11px] !px-3 !py-1.5 !bg-white">
            {tab === 'products' ? 'View Stock Ledger' : 'View Product List'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KPICard icon={Package} label="Total Products" value={String(active.length)} color="blue" />
        <KPICard icon={Package} label="Low Stock Items" value={String(lowStock.length)} color="red" />
        <KPICard icon={Package} label="Stock Value (Retail)" value={fmt(totalValue)} color="green" />
        <KPICard icon={Package} label="Stock Value (Cost)" value={fmt(totalCost)} color="teal" />
      </div>

      {tab === 'products' ? (
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
              {['ID', 'Product', 'Barcode', 'Selling Price', 'Cost', 'Stock', 'Category', ''].map(h => (
                <th key={h} className="px-3.5 py-2 text-[11px] text-gray-400 uppercase tracking-wide font-semibold text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(p => {
                const Icon = getSmartIcon(p);
                return (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3.5 py-2.5 font-mono text-gray-400 text-[10px]">{p.id.slice(0, 8)}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-[30px] h-[30px] rounded-lg bg-amber-500/[0.12] flex items-center justify-center flex-shrink-0">
                          <Icon size={12} className="text-amber-500" />
                        </div>
                        <span className="font-semibold text-gray-900 text-xs">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-gray-500 text-[11px]">{p.barcode || '—'}</td>
                    <td className="px-3.5 py-2.5 font-bold text-gray-900">{fmt(p.selling_price)}</td>
                    <td className="px-3.5 py-2.5 text-gray-500">{fmt(p.cost_price)}</td>
                    <td className="px-3.5 py-2.5">
                      {adjustId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="±" className="input-default !w-12 !text-xs !py-1" autoFocus />
                          <button onClick={() => handleAdjust(p.id)} className="text-[10px] bg-green-500 text-white px-2 py-1 rounded border-none font-bold">OK</button>
                        </div>
                      ) : (
                        <button onClick={() => setAdjustId(p.id)} className={`px-2 py-0.5 rounded-md text-[11px] font-bold border-none ${p.stock_qty <= p.low_stock_at ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-50 text-gray-600'}`}>
                          {p.stock_qty} <span className="text-[9px] opacity-60 font-normal">{p.unit || 'Pcs'}</span>
                        </button>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-xs text-gray-500">{p.category}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="w-6 h-6 rounded-md border border-gray-100 bg-transparent text-gray-400 hover:text-amber-500 hover:border-amber-500 flex items-center justify-center transition-colors"><Edit2 size={11} /></button>
                        <button onClick={() => handleDelete(p.id)} className="w-6 h-6 rounded-md border border-gray-100 bg-transparent text-gray-400 hover:text-red-500 hover:border-red-500 flex items-center justify-center transition-colors"><Trash2 size={11} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="white-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              {['Time', 'Product', 'Type', 'Change', 'Balance', 'Reason'].map(h => (
                <th key={h} className="px-3.5 py-2 text-[11px] text-gray-400 uppercase tracking-wide font-semibold text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {inv.stockMovements.map(m => (
                <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-3.5 py-2.5 text-[10px] text-gray-400">{m.time}<br/>{m.date}</td>
                  <td className="px-3.5 py-2.5 font-bold text-gray-900 text-xs">{m.productName}</td>
                  <td className="px-3.5 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.type}</span></td>
                  <td className={`px-3.5 py-2.5 font-bold text-xs ${m.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{m.type === 'IN' ? '+' : '-'}{m.qty}</td>
                  <td className="px-3.5 py-2.5 font-mono text-gray-900 font-bold text-xs">{m.balance}</td>
                  <td className="px-3.5 py-2.5 text-gray-500 text-xs italic">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <ProductModal product={editProduct} onSave={handleSave} onClose={() => { setShowModal(false); setEditProduct(null); }} />}
    </div>
  );
}
