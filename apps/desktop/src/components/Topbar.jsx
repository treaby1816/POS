import { Search, Bell } from 'lucide-react';

const NAV_LABELS = {
  dashboard: 'Dashboard', pos: 'POS Terminal', sales: 'Sales', inventory: 'Inventory',
  accounting: 'Accounting', suppliers: 'Suppliers & Agents', users: 'Users & Roles', settings: 'Settings',
};

export default function Topbar({ view }) {
  const label = NAV_LABELS[view] || 'Dashboard';
  return (
    <header className="h-[55px] flex-shrink-0 border-b border-gray-100 bg-white flex items-center px-5 gap-3 shadow-[0_1px_8px_rgba(44,62,107,0.06)]">
      <div className="flex-1">
        <div className="text-[11px] text-gray-400">Home / <span className="text-gray-900 font-semibold">{label}</span></div>
      </div>
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input placeholder="Search…" className="input-default !w-[170px] !pl-7 !py-1.5 !text-xs" />
      </div>
      <button className="relative w-[34px] h-[34px] rounded-[9px] border border-gray-200 bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-amber-50 hover:border-amber-500 hover:text-amber-500 transition-colors">
        <Bell size={15} />
        <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-red-500 border-2 border-white" />
      </button>
      <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[11px] font-extrabold text-white shadow-[0_2px_8px_rgba(245,158,11,0.4)]">A</div>
        <div>
          <div className="text-gray-900 font-bold text-xs leading-tight">Admin</div>
          <div className="text-gray-400 text-[10px]">Administrator</div>
        </div>
      </div>
    </header>
  );
}
