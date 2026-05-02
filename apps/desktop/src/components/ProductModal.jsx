import { useState } from 'react';
import { X, Package } from 'lucide-react';

export default function ProductModal({ product, onSave, onClose }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '', barcode: product?.barcode || '',
    selling_price: product?.selling_price || '', cost_price: product?.cost_price || '',
    stock_qty: product?.stock_qty || 0, low_stock_at: product?.low_stock_at || 10,
    category: product?.category || 'General', supplier: product?.supplier || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.selling_price) return;
    onSave({ ...form, selling_price: Number(form.selling_price), cost_price: Number(form.cost_price), stock_qty: Number(form.stock_qty), low_stock_at: Number(form.low_stock_at) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Package size={16} className="text-amber-500" />{isEdit ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 border-none transition-colors"><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Indomie Noodles" className="input-default" />
            </div>
            <div>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">Barcode</label>
              <input value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="Scan or type" className="input-default" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">Selling Price (₦) *</label>
              <input type="number" value={form.selling_price} onChange={e => set('selling_price', e.target.value)} placeholder="0.00" className="input-default" />
            </div>
            <div>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">Cost Price (₦)</label>
              <input type="number" value={form.cost_price} onChange={e => set('cost_price', e.target.value)} placeholder="0.00" className="input-default" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">Stock Quantity</label>
              <input type="number" value={form.stock_qty} onChange={e => set('stock_qty', e.target.value)} className="input-default" />
            </div>
            <div>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">Low Stock Alert</label>
              <input type="number" value={form.low_stock_at} onChange={e => set('low_stock_at', e.target.value)} className="input-default" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-default">
                {['General', 'Food', 'Beverages', 'Dairy', 'Electronics', 'FMCG', 'Confectionery', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">Supplier</label>
              <input value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder="Supplier name" className="input-default" />
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={handleSave} className="btn-primary flex-1 !text-xs">{isEdit ? 'Update Product' : 'Add Product'}</button>
          <button onClick={onClose} className="btn-secondary flex-1 !text-xs">Cancel</button>
        </div>
      </div>
    </div>
  );
}
