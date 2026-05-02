import { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, Package } from 'lucide-react';

const SEED_SUPPLIERS = [
  { id: '1', name: 'Dufil Prima Foods', contact: 'Alhaji Musa', phone: '08034567890', email: 'sales@dufil.com', address: 'Indomie Way, Lagos', products: 12, lastOrder: '2026-04-20' },
  { id: '2', name: 'FrieslandCampina', contact: 'Sandra Obi', phone: '08023456789', email: 'orders@friesland.ng', address: 'Ikeja, Lagos', products: 8, lastOrder: '2026-04-18' },
  { id: '3', name: 'Nigerian Bottling Co.', contact: 'Chidi Eze', phone: '08012345678', email: 'supply@nbc.com', address: 'Matori, Lagos', products: 15, lastOrder: '2026-04-22' },
  { id: '4', name: 'Flour Mills of Nigeria', contact: 'Adamu Bello', phone: '08045678901', email: 'trade@fmn.com', address: 'Apapa, Lagos', products: 6, lastOrder: '2026-04-15' },
  { id: '5', name: 'Reckitt Benckiser', contact: 'Grace Nnadi', phone: '08056789012', email: 'nigeria@reckitt.com', address: 'Victoria Island, Lagos', products: 4, lastOrder: '2026-04-10' },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(SEED_SUPPLIERS);
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', address: '' });

  const openAdd = () => { setForm({ name: '', contact: '', phone: '', email: '', address: '' }); setEditSupplier(null); setShowForm(true); };
  const openEdit = (s) => { setForm({ name: s.name, contact: s.contact, phone: s.phone, email: s.email, address: s.address }); setEditSupplier(s); setShowForm(true); };

  const handleSave = () => {
    if (!form.name) return;
    if (editSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editSupplier.id ? { ...s, ...form } : s));
    } else {
      setSuppliers(prev => [...prev, { ...form, id: crypto.randomUUID(), products: 0, lastOrder: '—' }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id) => setSuppliers(prev => prev.filter(s => s.id !== id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Suppliers & Agents</h1><p className="text-gray-500 text-sm">{suppliers.length} suppliers registered</p></div>
        <button onClick={openAdd} className="btn-primary !text-xs flex items-center gap-1.5"><Plus size={13} />Add Supplier</button>
      </div>

      {/* Grid of supplier cards */}
      <div className="grid grid-cols-2 gap-3">
        {suppliers.map(s => (
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
              <span className="flex items-center gap-1 text-gray-500"><Package size={11} />{s.products} products</span>
              <span className="text-gray-400">Last order: {s.lastOrder}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
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
    </div>
  );
}
