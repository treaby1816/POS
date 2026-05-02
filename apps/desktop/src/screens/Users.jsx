import { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, User, Lock } from 'lucide-react';
import useLicense from '../store/useLicense';

const SEED_USERS = [
  { id: '1', name: 'Admin', email: 'admin@treabyn.com', role: 'owner', pin: '••••', is_active: true, store: 'Treabyn Abuja' },
  { id: '2', name: 'Emeka Okafor', email: 'emeka@treabyn.com', role: 'manager', pin: '••••', is_active: true, store: 'Treabyn Enugu' },
  { id: '3', name: 'Amina Yusuf', email: 'amina@treabyn.com', role: 'cashier', pin: '••••', is_active: true, store: 'Treabyn Abuja' },
  { id: '4', name: 'Chinedu Eze', email: 'chinedu@treabyn.com', role: 'cashier', pin: '••••', is_active: false, store: 'Treabyn Abuja' },
];

const ROLE_COLORS = { owner: 'bg-purple-100 text-purple-700', admin: 'bg-blue-100 text-blue-700', manager: 'bg-amber-100 text-amber-700', cashier: 'bg-gray-100 text-gray-600' };

export default function Users() {
  const [users, setUsers] = useState(SEED_USERS);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'cashier', pin: '', store: 'Treabyn Abuja' });
  const { isDemo } = useLicense();

  const openAdd = () => { setForm({ name: '', email: '', role: 'cashier', pin: '', store: 'Treabyn Abuja' }); setEditUser(null); setShowForm(true); };
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, role: u.role, pin: '', store: u.store }); setEditUser(u); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form, pin: form.pin || u.pin } : u));
    } else {
      setUsers(prev => [...prev, { ...form, id: crypto.randomUUID(), pin: form.pin || '••••', is_active: true }]);
    }
    setShowForm(false);
  };

  const toggleActive = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-extrabold text-gray-900 mb-0.5">Users & Roles</h1><p className="text-gray-500 text-sm">{users.filter(u => u.is_active).length} active users</p></div>
        <button onClick={openAdd} className="btn-primary !text-xs flex items-center gap-1.5"><Plus size={13} />Add User</button>
      </div>

      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-xs flex items-center gap-2">
          <ShieldCheck size={14} />Demo mode: User management is limited to 1 user. Upgrade to unlock.
        </div>
      )}

      <div className="white-card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50">
            {['User', 'Email', 'Role', 'Store', 'PIN', 'Status', ''].map(h => (
              <th key={h} className="px-4 py-2.5 text-[11px] text-gray-400 uppercase tracking-wide font-semibold text-left">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs">{u.name.charAt(0)}</div>
                    <span className="font-semibold text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.store}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.pin}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u.id)} className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border-none ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)} className="w-6 h-6 rounded-md border border-gray-100 bg-transparent text-gray-300 hover:text-amber-500 hover:border-amber-500 flex items-center justify-center transition-colors"><Edit2 size={11} /></button>
                    <button onClick={() => window.confirm(`Delete user ${u.name}?`) && setUsers(prev => prev.filter(x => x.id !== u.id))} className="w-6 h-6 rounded-md border border-gray-100 bg-transparent text-gray-300 hover:text-red-500 hover:border-red-500 flex items-center justify-center transition-colors"><Trash2 size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[440px] p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><User size={16} className="text-amber-500" />{editUser ? 'Edit User' : 'Add User'}</h3>
            <div className="flex flex-col gap-3">
              <div><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Full Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Amina Yusuf" className="input-default" /></div>
              <div><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Email *</label><input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="user@example.com" className="input-default" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input-default">
                    {['owner', 'admin', 'manager', 'cashier'].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </div>
                <div><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">4-Digit POS PIN</label><input value={form.pin} onChange={e => setForm(p => ({ ...p, pin: e.target.value.slice(0, 4) }))} placeholder="1234" maxLength={4} type="password" className="input-default" /></div>
              </div>
              <div><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Assigned Store</label>
                <select value={form.store} onChange={e => setForm(p => ({ ...p, store: e.target.value }))} className="input-default">
                  <option>Treabyn Abuja</option><option>Treabyn Enugu</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} className="btn-primary flex-1 !text-xs">{editUser ? 'Update User' : 'Add User'}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 !text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
