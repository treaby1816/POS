import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import { TrendingUp, DollarSign, Package, TrendingDown } from 'lucide-react';
import useSales from '../store/useSales';
import useExpenses from '../store/useExpenses';
import useInventory from '../store/useInventory';
import useCustomers from '../store/useCustomers';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
const tipStyle = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 } };

export default function Accounting() {
  const sales = useSales();
  const expenses = useExpenses();
  const inv = useInventory();
  const cust = useCustomers();

  // Real revenue from sales store
  const totalRevenue = sales.sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalCOGS = inv.products.filter(p => p.is_active).reduce((s, p) => s + p.cost_price * (p.stock_qty || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.getTotalExpenses();
  const vatCollected = totalRevenue * 0.075;
  const netProfit = grossProfit - totalExpenses;
  const totalDebt = cust.getTotalDebt();

  // Weekly revenue breakdown (from sales data, grouped by day)
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyRev = DAYS.map(d => ({ d, r: 0, c: 0 }));
  sales.sales.forEach(s => {
    try {
      const dayIdx = new Date(s.created_at).getDay();
      weeklyRev[dayIdx].r += s.total || 0;
    } catch {}
  });

  // P&L rows — now driven by real data
  const PNL = [
    { item: 'Total Revenue', amount: totalRevenue, type: 'income' },
    { item: 'Cost of Goods (Inventory)', amount: totalCOGS, type: 'expense' },
    { item: 'Gross Profit', amount: grossProfit, type: 'profit' },
    { item: 'VAT Collected (7.5%)', amount: vatCollected, type: 'tax' },
    { item: 'Operating Expenses', amount: totalExpenses, type: 'expense' },
    { item: 'Net Profit', amount: netProfit, type: 'profit' },
  ];

  // Expense breakdown
  const expByCat = expenses.getExpensesByCategory();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-extrabold text-gray-900">Accounting</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3.5">
        <KPICard icon={TrendingUp} label="Total Revenue" value={fmt(totalRevenue)} sub={`${sales.sales.length} sales recorded`} color="blue" />
        <KPICard icon={DollarSign} label="Total Expenses" value={fmt(totalExpenses)} sub={`${expenses.expenses.length} records`} color="red" />
        <KPICard icon={TrendingUp} label="Net Profit" value={fmt(netProfit)} sub={totalRevenue ? `Margin: ${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '—'} color="green" />
        <KPICard icon={TrendingDown} label="Outstanding Debt" value={fmt(totalDebt)} sub={`${cust.getDebtors().length} debtors`} color="yellow" />
      </div>

      {/* Revenue Chart */}
      <div className="white-card">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Weekly Revenue</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyRev}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="d" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tipStyle} formatter={(v) => [fmt(v), 'Revenue']} />
            <Bar dataKey="r" fill="#f59e0b" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {/* P&L Summary */}
        <div className="white-card">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Profit & Loss Summary</h3>
          <table className="w-full text-sm">
            <tbody>
              {PNL.map((row) => (
                <tr key={row.item} className={`border-t border-gray-100 ${row.type === 'profit' ? 'font-bold' : ''}`}>
                  <td className={`py-2.5 ${row.type === 'profit' ? 'text-gray-900' : row.type === 'expense' ? 'text-red-600' : row.type === 'tax' ? 'text-blue-600' : 'text-green-600'}`}>{row.item}</td>
                  <td className={`py-2.5 text-right font-semibold ${row.type === 'profit' ? (row.amount >= 0 ? 'text-green-600' : 'text-red-600') : row.type === 'expense' ? 'text-red-500' : 'text-gray-900'}`}>{fmt(Math.abs(row.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expense Breakdown */}
        <div className="white-card">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Expense Breakdown</h3>
          {expByCat.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No expenses recorded yet. Go to Expenses to add records.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                {['Category', 'Amount', '% of Total'].map(h => <th key={h} className="px-3 py-2 text-[11px] text-gray-400 uppercase font-semibold text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {expByCat.map(row => (
                  <tr key={row.category} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-xs text-gray-700 font-semibold">{row.category}</td>
                    <td className="px-3 py-2 text-xs text-red-600 font-bold">{fmt(row.amount)}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{totalExpenses ? ((row.amount / totalExpenses) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
