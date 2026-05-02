import { LayoutDashboard, ShoppingCart, BarChart3, Package, TrendingUp, Users, Settings, LogOut, ChevronRight } from 'lucide-react';
import useLicense from '../store/useLicense';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS Terminal', icon: ShoppingCart },
  { id: 'sales', label: 'Sales', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'accounting', label: 'Accounting', icon: TrendingUp },
  { id: 'suppliers', label: 'Suppliers & Agents', icon: Users, section: 'SYSTEM' },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ view, setView, collapsed, setCollapsed, onLogout }) {
  const { plan, isDemo, tenantName } = useLicense();
  const planLabel = isDemo ? 'DEMO' : (plan || 'starter').toUpperCase();

  return (
    <aside className={`${collapsed ? 'w-[62px]' : 'w-[218px]'} flex-shrink-0 gradient-navy flex flex-col transition-all duration-300 shadow-[4px_0_20px_rgba(44,62,107,0.2)]`}>
      {/* Logo */}
      <div className="px-3 py-4 border-b border-white/[0.07] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] gradient-primary flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_rgba(245,158,11,0.4)]">
          <span className="text-[15px] font-extrabold text-white">T</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-white whitespace-nowrap">Treabyn</div>
            <div className="text-[9px] text-white/[0.35] tracking-[0.5px]">RETAIL POS</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="w-6 h-6 rounded-md bg-white/[0.07] hover:bg-white/[0.15] border-none text-white/[0.4] flex items-center justify-center flex-shrink-0 ml-auto transition-colors">
          <ChevronRight size={13} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="mx-2 mt-2.5 mb-1 bg-white/[0.07] rounded-[11px] px-3 py-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0">A</div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white truncate">Admin</div>
            <div className="text-[9px] text-white/[0.35] tracking-[0.5px]">{planLabel}</div>
          </div>
        </div>
      )}

      {!collapsed && <div className="px-4 pt-3 pb-1 text-[9px] font-bold text-white/[0.3] tracking-[1.5px]">WORKSPACE</div>}

      {/* Navigation */}
      <nav className="flex-1 px-[7px] py-1 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item, i) => {
          const isActive = view === item.id;
          const Icon = item.icon;
          const locked = isDemo && !['dashboard', 'pos', 'sales', 'inventory'].includes(item.id);
          return (
            <div key={item.id}>
              {item.section && !collapsed && <div className="px-2 pt-2 pb-1 text-[9px] font-bold text-white/[0.3] tracking-[1.5px]">{item.section}</div>}
              <button
                onClick={() => !locked && setView(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[9px] border-none text-left text-xs transition-all
                  ${isActive ? 'bg-amber-500/[0.15] text-white font-bold border-l-[3px] border-l-amber-500' : 'bg-transparent text-white/50 hover:bg-white/[0.07] hover:text-white/[0.85] border-l-[3px] border-l-transparent'}
                  ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon size={14} className={`flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-white/[0.45]'}`} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && locked && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/40">PRO</span>}
                {!collapsed && isActive && <div className="w-[5px] h-[5px] rounded-full bg-amber-500" />}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-[7px] py-2 pb-3 border-t border-white/[0.07] flex flex-col gap-0.5">
        <div className="flex items-center gap-2 px-3 py-[7px] text-[10px] text-white/[0.35]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] flex-shrink-0" />
          {!collapsed && <span>Online · Synced</span>}
        </div>
        <button onClick={onLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-[9px] border-none bg-transparent text-white/[0.35] text-xs hover:bg-red-500/[0.15] hover:text-red-400 transition-colors">
          <LogOut size={13} className="flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
