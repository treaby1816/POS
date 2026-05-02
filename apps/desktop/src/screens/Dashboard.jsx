import { BarChart3, ShoppingCart, Package, Users, TrendingUp, CreditCard, TrendingDown } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import useSales from '../store/useSales';
import useInventory from '../store/useInventory';
import useExpenses from '../store/useExpenses';
import useCustomers from '../store/useCustomers';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

const REV_DATA = [
  { d: 'Mon', r: 12400, c: 8200 }, { d: 'Tue', r: 18600, c: 11400 }, { d: 'Wed', r: 9800, c: 7100 },
  { d: 'Thu', r: 22100, c: 14300 }, { d: 'Fri', r: 31500, c: 19800 }, { d: 'Sat', r: 28700, c: 17200 }, { d: 'Sun', r: 15900, c: 9600 },
];
const CAT_DATA = [
  { n: 'Food', v: 38, c: '#3b82f6' }, { n: 'Beverages', v: 24, c: '#06b6d4' }, { n: 'FMCG', v: 18, c: '#8b5cf6' },
  { n: 'Electronics', v: 12, c: '#f59e0b' }, { n: 'Dairy', v: 8, c: '#10b981' },
];
const TOP_PRODUCTS = [
  { n: 'Coca-Cola 500ml', em: '🥤', sold: 142, rev: '₦42,600', pct: 85, c: '#ef4444' },
  { n: 'Indomie Noodles', em: '🍜', sold: 118, rev: '₦17,700', pct: 70, c: '#f59e0b' },
  { n: 'Peak Milk 400g', em: '🥛', sold: 94, rev: '₦75,200', pct: 56, c: '#3b82f6' },
  { n: 'Dettol Soap', em: '🧴', sold: 87, rev: '₦34,800', pct: 48, c: '#8b5cf6' },
  { n: 'Hollandia Yoghurt', em: '🥛', sold: 73, rev: '₦25,550', pct: 40, c: '#10b981' },
];

const tipStyle = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 } };

export default function Dashboard({ onNavigate }) {
  const sales = useSales();
  const inventory = useInventory();
  const expenses = useExpenses();
  const customers = useCustomers();

  const totalRevenue = sales.sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const netProfit = totalRevenue - expenses.getTotalExpenses();
  const totalDebt = customers.getTotalDebt();

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome + Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-gray-500 text-sm">Welcome back, <strong className="text-gray-900">Admin</strong> · Treabyn Store 1 (Abuja)</p>
        <div className="flex gap-2">
          <button onClick={() => onNavigate?.('pos')} className="btn-primary !text-xs !px-3 !py-2">+ New Sale</button>
          <button onClick={() => onNavigate?.('inventory')} className="btn-secondary !text-xs !px-3 !py-2">📦 Add Product</button>
          <button onClick={() => alert('Generating full performance reports... Download will begin shortly.')} className="btn-secondary !text-xs !px-3 !py-2">📊 Reports</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3.5">
        <KPICard icon={BarChart3} label="Today's Revenue" value={fmt(sales.getTodayRevenue() || 0)} sub={`${sales.getCompletedCount()} sales completed`} trend={11.7} color="yellow" />
        <KPICard icon={TrendingUp} label="Net Profit" value={fmt(netProfit)} sub={totalRevenue ? `Margin: ${((netProfit / totalRevenue) * 100).toFixed(1)}%` : 'No sales yet'} color="green" />
        <KPICard icon={Package} label="Total Products" value={String(inventory.products.filter(p => p.is_active).length)} sub={`${inventory.getLowStock().length} low stock`} color="teal" />
      </div>
      <div className="grid grid-cols-3 gap-3.5">
        <KPICard icon={CreditCard} label="Outstanding Debt" value={fmt(totalDebt)} sub={`${customers.getDebtors().length} debtors`} color="red" />
        <KPICard icon={TrendingDown} label="Total Expenses" value={fmt(expenses.getTotalExpenses())} sub={`${expenses.expenses.length} records`} color="yellow" />
        <KPICard icon={Users} label="Customers" value={String(customers.customers.length)} sub="Registered customers" color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-[2fr_1fr] gap-3.5">
        {/* Revenue Chart */}
        <div className="white-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Revenue vs Cost — This Week</h3>
            <span className="text-[11px] text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={REV_DATA}>
              <defs>
                <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.18} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="d" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tipStyle} formatter={(v, n) => [fmt(v), n === 'r' ? 'Revenue' : 'Cost']} />
              <Area type="monotone" dataKey="r" stroke="#f59e0b" strokeWidth={2.5} fill="url(#rG)" />
              <Area type="monotone" dataKey="c" stroke="#06b6d4" strokeWidth={2.5} fill="url(#cG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="white-card">
          <h3 className="font-bold text-gray-900 text-sm mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={CAT_DATA} cx="50%" cy="50%" innerRadius={44} outerRadius={64} paddingAngle={3} dataKey="v">
                {CAT_DATA.map((e, i) => <Cell key={i} fill={e.c} />)}
              </Pie>
              <Tooltip {...tipStyle} formatter={v => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {CAT_DATA.map(c => (
              <div key={c.n} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm" style={{ background: c.c }} /><span className="text-gray-500">{c.n}</span></div>
                <span className="text-gray-900 font-bold">{c.v}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="white-card !p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Recent Transactions</h3>
          <button onClick={() => onNavigate?.('sales')} className="text-xs text-amber-500 font-semibold bg-transparent border-none">View All →</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50">
            {['Receipt', 'Store', 'Cashier', 'Method', 'Total', 'Status'].map(h => (
              <th key={h} className={`px-4 py-2 text-[11px] text-gray-400 uppercase tracking-wide font-semibold ${h === 'Total' || h === 'Status' ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {sales.sales.slice(0, 4).map(s => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                <td className="px-4 py-2.5 font-mono text-amber-500 text-[11px] font-semibold">{s.receipt_no}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">{s.store}</td>
                <td className="px-4 py-2.5 text-gray-600">{s.cashier}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs capitalize">{s.payment_method}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900">{fmt(s.total)}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' : s.status === 'cancelled' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Products + Quick Actions */}
      <div className="grid grid-cols-[2fr_1fr] gap-3.5">
        <div className="white-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Top Selling Products</h3>
            <button onClick={() => onNavigate?.('inventory')} className="text-xs text-amber-500 font-semibold bg-transparent border-none">View Inventory →</button>
          </div>
          {TOP_PRODUCTS.map(({ n, em, sold, rev, pct, c }) => (
            <div key={n} className="flex items-center gap-2.5 mb-2.5">
              <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0 text-base" style={{ background: `${c}12` }}>{em}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1"><span className="text-[13px] font-semibold text-gray-900 truncate">{n}</span><span className="text-xs font-bold text-gray-900 flex-shrink-0 ml-1.5">{rev}</span></div>
                <div className="flex items-center gap-2"><div className="flex-1 h-[5px] bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} /></div><span className="text-[11px] text-gray-400 flex-shrink-0">{sold} sold</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="gradient-navy border border-[#374b7c] rounded-card p-5 shadow-[0_8px_32px_rgba(44,62,107,0.25)] relative overflow-hidden">
          <div className="absolute -right-[18px] -top-[18px] w-[120px] h-[120px] rounded-full bg-white/5 pointer-events-none" />
          <h3 className="font-bold text-white text-sm mb-1 relative">⚡ Quick Actions</h3>
          <p className="text-white/[0.45] text-xs mb-4 relative">Access common POS actions quickly.</p>
          <div className="flex flex-col gap-2 relative">
            {[
              { l: 'Open POS Terminal', nav: 'pos', primary: true, em: '🛒' },
              { l: 'Add New Product', nav: 'inventory', em: '📦' },
              { l: 'Adjust Stock', nav: 'inventory', em: '🔄' },
              { l: 'View Sales Report', nav: 'sales', em: '📊' },
              { l: 'Manage Suppliers', nav: 'suppliers', em: '🤝' },
            ].map(({ l, nav, primary, em }) => (
              <button key={l} onClick={() => onNavigate?.(nav)}
                className={`px-3 py-2 rounded-[10px] border text-white text-xs flex items-center gap-2 text-left transition-all
                  ${primary ? 'gradient-primary border-transparent font-bold shadow-[0_4px_14px_rgba(245,158,11,0.4)]' : 'bg-white/[0.08] border-white/[0.15] hover:bg-white/[0.15]'}`}>
                <span className="text-sm">{em}</span>{l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
