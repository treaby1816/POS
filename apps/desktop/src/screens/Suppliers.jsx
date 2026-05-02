import { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, Package, X, FileText, Check, Clock, XCircle, ChevronRight } from 'lucide-react';
import useSuppliers from '../store/useSuppliers';
import useInventory from '../store/useInventory';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function Suppliers() {
  const sup = useSuppliers();
  const inv = useInventory();
  const [tab, setTab] = useState('suppliers'); // suppliers | orders
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', address: '' });

  // PO creation state
  const [showPO, setShowPO] = useState(false);
  const [poSupplier, setPOSupplier] = useState('');
  const [poItems, setPOItems] = useState([{ name: '', qty: '', unitCost: '' }]);
  const [poNotes, setPONotes] = useState('');

  const openAdd = () => { setForm({ name: '', contact: '', phone: '', email: '', address: '' }); setEditSupplier(null); setShowForm(true); };
  const openEdit = (s) => { setForm({ name: s.name, contact: s.contact, phone: s.phone, email: s.email, address: s.address }); setEditSupplier(s); setShowForm(true); };

  const handleSave = () => {
    if (!form.name) return;
    if (editSupplier) { sup.updateSupplier(editSupplier.id, form); }
    else { sup.addSupplier(form); }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this supplier record?')) sup.deleteSupplier(id);
  };

  // PO handlers
  const addPOLine = () => setPOItems(p => [...p, { name: '', qty: '', unitCost: '' }]);
  const updatePOLine = (idx, field, value) => setPOItems(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  const removePOLine = (idx) => setPOItems(p => p.filter((_, i) => i !== idx));

  const createPO = () => {
    const supplier = sup.suppliers.find(s => s.id === poSupplier);
    if (!supplier || !poItems.some(i => i.name && i.qty)) return;
    const validItems = poItems.filter(i => i.name && i.qty).map(i => ({ name: i.name, qty: Number(i.qty), unitCost: Number(i.unitCost) || 0 }));
    sup.createPO({ supplierId: supplier.id, supplierName: supplier.name, items: validItems, notes: poNotes });
    setShowPO(false);
    setPOItems([{ name: '', qty: '', unitCost: '' }]);
    setPONotes('');
    setTab('orders');
  };

  const handleReceive = (poId) => {
    sup.receivePO(poId, (items) => {
      // Auto-update inventory
      items.forEach(item => {
        const product = inv.products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
        if (product) {
          inv.adjustStock(product.id, item.qty);
        }
      });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Suppliers & Purchase Orders</h1>
          <p className="text-gray-500 text-sm">{sup.suppliers.length} suppliers · {sup.getPendingPOs().length} pending orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPO(true)} className="btn-secondary !text-xs flex items-center gap-1.5 !bg-white"><FileText size={13} />New Purchase Order</button>
          <button onClick={openAdd} className="btn-primary !text-xs flex items-center gap-1.5"><Plus size={13} />Add Supplier</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 w-fit">
        <button onClick={() => setTab('suppliers')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'suppliers' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Suppliers</button>
        <button onClick={() => setTab('orders')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'orders' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Purchase Orders
          {sup.getPendingPOs().length > 0 && <span className="ml-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] inline-flex items-center justify-center">{sup.getPendingPOs().length}</span>}
        </button>
      </div>

      {tab === 'suppliers' ? (
        <div className="grid grid-cols-2 gap-3">
          {sup.suppliers.map(s => {
            const poCount = sup.getPOsBySupplier(s.id).length;
            return (
              <div key={s.id} className="white-card flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">{s.name.charAt(0)}</div>
                    <div><div className="font-bold text-gray-900 text-sm">{s.name}</div><div className="text-gray-500 text-xs">{s.contact}</div></div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="w-7 h-7 rounded-lg border border-gray-100 text-gray-300 hover:text-amber-500 hover:border-amber-500 flex items-center justify-center bg-transparent transition-colors"><Edit2 size={12} /></button>
                    <button onClick={() => handleDelete(s.id)} className="w-7 h-7 rounded-lg border border-gray-100 text-gray-300 hover:text-red-500 hover:border-red-500 flex items-center justify-center bg-transparent transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><Phone size={11} className="text-gray-400" />{s.phone}</div>
                  <div className="flex items-center gap-2"><Mail size={11} className="text-gray-400" />{s.email}</div>
                  <div className="flex items-center gap-2"><MapPin size={11} className="text-gray-400" />{s.address}</div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="flex items-center gap-1 text-gray-500"><FileText size={11} />{poCount} purchase order{poCount !== 1 ? 's' : ''}</span>
                  <button onClick={() => { setPOSupplier(s.id); setShowPO(true); }} className="text-amber-500 font-bold text-[11px] hover:text-amber-600 bg-transparent border-none flex items-center gap-0.5">New PO <ChevronRight size={11} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="white-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['PO #', 'Supplier', 'Items', 'Total Cost', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[11px] text-gray-400 uppercase tracking-wide font-semibold text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sup.purchaseOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(po => (
                <tr key={po.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-bold text-xs text-gray-900">{po.poNumber}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-700 font-semibold">{po.supplierName}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{po.items.length} item{po.items.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-gray-900">{fmt(po.totalCost)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1
                      ${po.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : po.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {po.status === 'pending' && <Clock size={9} />}
                      {po.status === 'received' && <Check size={9} />}
                      {po.status === 'cancelled' && <XCircle size={9} />}
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[10px] text-gray-400">{new Date(po.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2.5">
                    {po.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleReceive(po.id)} className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-[10px] font-bold hover:bg-green-100 transition-colors border-none">Receive</button>
                        <button onClick={() => sup.cancelPO(po.id)} className="bg-red-50 text-red-500 px-2.5 py-1 rounded-md text-[10px] font-bold hover:bg-red-100 transition-colors border-none">Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {sup.purchaseOrders.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No purchase orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[440px] p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-base mb-4">{editSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <div className="flex flex-col gap-3">
              {[['Company Name *', 'name', 'e.g. Dufil Foods'], ['Contact Person', 'contact', 'e.g. Alhaji Musa'], ['Phone', 'phone', '08012345678'], ['Email', 'email', 'sales@company.com'], ['Address', 'address', 'Location']].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">{label}</label>
                  <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} className="input-default" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} className="btn-primary flex-1 !text-xs">{editSupplier ? 'Update' : 'Add Supplier'}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 !text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showPO && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowPO(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2"><FileText size={16} className="text-amber-500" />New Purchase Order</h3>
              <button onClick={() => setShowPO(false)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 border-none"><X size={14} /></button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Supplier *</label>
                <select value={poSupplier} onChange={e => setPOSupplier(e.target.value)} className="input-default">
                  <option value="">Select supplier…</option>
                  {sup.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-2">Order Items</label>
                <div className="flex flex-col gap-2">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input value={item.name} onChange={e => updatePOLine(idx, 'name', e.target.value)} placeholder="Product name" className="input-default flex-1 !text-xs" />
                      <input type="number" value={item.qty} onChange={e => updatePOLine(idx, 'qty', e.target.value)} placeholder="Qty" className="input-default !w-16 !text-xs" />
                      <input type="number" value={item.unitCost} onChange={e => updatePOLine(idx, 'unitCost', e.target.value)} placeholder="Cost ₦" className="input-default !w-20 !text-xs" />
                      {poItems.length > 1 && (
                        <button onClick={() => removePOLine(idx)} className="w-6 h-6 rounded-md bg-red-50 text-red-400 flex items-center justify-center border-none hover:bg-red-100"><X size={11} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addPOLine} className="text-amber-500 text-[11px] font-bold mt-2 bg-transparent border-none hover:text-amber-600"><Plus size={11} className="inline" /> Add another item</button>
              </div>

              <div>
                <label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Notes</label>
                <input value={poNotes} onChange={e => setPONotes(e.target.value)} placeholder="e.g. Urgent delivery needed" className="input-default" />
              </div>

              {poItems.some(i => i.qty && i.unitCost) && (
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Estimated Total</span><span className="font-extrabold text-gray-900">{fmt(poItems.reduce((sum, i) => sum + (Number(i.qty) || 0) * (Number(i.unitCost) || 0), 0))}</span></div>
                </div>
              )}
            </div>

            <button onClick={createPO} disabled={!poSupplier || !poItems.some(i => i.name && i.qty)} className="btn-primary w-full mt-4 !text-xs">Create Purchase Order</button>
          </div>
        </div>
      )}
    </div>
  );
}
