import { useState } from 'react';
import { Search, Bell, Calculator as CalcIcon, MapPin, AlertTriangle, Package, CreditCard } from 'lucide-react';
import Calculator from './Calculator';
import useInventory from '../store/useInventory';
import useCustomers from '../store/useCustomers';
import useSuppliers from '../store/useSuppliers';

const NAV_LABELS = {
  dashboard: 'Dashboard', pos: 'POS Terminal', sales: 'Sales', inventory: 'Inventory',
  accounting: 'Accounting', suppliers: 'Suppliers & Purchase Orders', users: 'Users & Roles', settings: 'Settings',
  customers: 'Customer Management', expenses: 'Expenses', 'audit-logs': 'Audit Logs',
};

const BRANCHES = [
  { id: 'abuja', name: 'Treabyn Abuja', status: 'online' },
  { id: 'lagos', name: 'Treabyn Lagos', status: 'online' },
  { id: 'portharcourt', name: 'Treabyn PH', status: 'offline' },
];

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function Topbar({ view }) {
  const [showCalc, setShowCalc] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showBranch, setShowBranch] = useState(false);
  const [branch, setBranch] = useState(BRANCHES[0]);

  const inv = useInventory();
  const cust = useCustomers();
  const sup = useSuppliers();

  const label = NAV_LABELS[view] || 'Dashboard';

  // Build notifications
  const lowStockItems = inv.getLowStock();
  const debtors = cust.getDebtors();
  const pendingPOs = sup.getPendingPOs();

  const notifications = [
    ...lowStockItems.map(p => ({
      id: `ls-${p.id}`,
      type: 'warning',
      icon: Package,
      title: `Low Stock: ${p.name}`,
      detail: `Only ${p.stock_qty} ${p.unit || 'pcs'} left (threshold: ${p.low_stock_at})`,
      color: 'yellow',
    })),
    ...debtors.slice(0, 5).map(c => ({
      id: `debt-${c.id}`,
      type: 'info',
      icon: CreditCard,
      title: `${c.name} owes ${fmt(c.balance)}`,
      detail: 'Outstanding credit balance',
      color: 'red',
    })),
    ...pendingPOs.slice(0, 3).map(po => ({
      id: `po-${po.id}`,
      type: 'info',
      icon: AlertTriangle,
      title: `PO ${po.poNumber} pending`,
      detail: `${po.supplierName} · ${po.items.length} items`,
      color: 'blue',
    })),
  ];

  const totalAlerts = notifications.length;

  return (
    <header className="h-[55px] flex-shrink-0 border-b border-gray-100 bg-white flex items-center px-5 gap-3 shadow-[0_1px_8px_rgba(44,62,107,0.06)] relative z-50">
      <div className="flex-1 flex items-center gap-3">
        <div className="text-[11px] text-gray-400">Home / <span className="text-gray-900 font-semibold">{label}</span></div>

        {/* Branch Switcher */}
        <div className="relative">
          <button onClick={() => setShowBranch(!showBranch)} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 transition-colors">
            <MapPin size={11} className="text-amber-500" />
            <span className="font-semibold">{branch.name}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${branch.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
          </button>
          {showBranch && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBranch(false)} />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-[200px] p-1.5 z-50 animate-fade-in">
                {BRANCHES.map(b => (
                  <button key={b.id} onClick={() => { setBranch(b); setShowBranch(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors border-none ${branch.id === b.id ? 'bg-amber-50 text-amber-600 font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}>
                    <MapPin size={11} />
                    <span className="flex-1">{b.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${b.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input 
          placeholder="Global Search…" 
          className="input-default !w-[170px] !pl-7 !py-1.5 !text-xs" 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              alert(`Searching for: ${e.target.value}\n(Global search integration in progress)`);
            }
          }}
        />
      </div>
      
      <button onClick={() => setShowCalc(!showCalc)} className={`relative w-[34px] h-[34px] rounded-[9px] border flex items-center justify-center transition-colors ${showCalc ? 'bg-amber-500 border-amber-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-amber-50 hover:border-amber-500 hover:text-amber-500'}`}>
        <CalcIcon size={15} />
      </button>

      {/* Notification Bell */}
      <div className="relative">
        <button onClick={() => setShowNotif(!showNotif)} className={`relative w-[34px] h-[34px] rounded-[9px] border flex items-center justify-center transition-colors ${showNotif ? 'bg-amber-500 border-amber-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-amber-50 hover:border-amber-500 hover:text-amber-500'}`}>
          <Bell size={15} />
          {totalAlerts > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">{totalAlerts > 9 ? '9+' : totalAlerts}</span>}
        </button>

        {showNotif && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl w-[320px] max-h-[400px] overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-full text-[10px] font-bold">{totalAlerts} alerts</span>
              </div>
              <div className="overflow-y-auto max-h-[320px]">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-gray-400 text-sm">All clear! No alerts right now.</p>
                ) : (
                  notifications.map(n => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className="flex items-start gap-2.5 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                          ${n.color === 'yellow' ? 'bg-yellow-100' : n.color === 'red' ? 'bg-red-100' : 'bg-blue-100'}`}>
                          <Icon size={12} className={n.color === 'yellow' ? 'text-yellow-600' : n.color === 'red' ? 'text-red-600' : 'text-blue-600'} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-900">{n.title}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{n.detail}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[11px] font-extrabold text-white shadow-[0_2px_8px_rgba(245,158,11,0.4)]">A</div>
        <div>
          <div className="text-gray-900 font-bold text-xs leading-tight">Admin</div>
          <div className="text-gray-400 text-[10px]">Administrator</div>
        </div>
      </div>

      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
    </header>
  );
}
