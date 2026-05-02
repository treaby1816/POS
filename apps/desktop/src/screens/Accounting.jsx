import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import { TrendingUp, DollarSign, Package } from 'lucide-react';
import useSales from '../store/useSales';

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
const tipStyle = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 } };

const REV = [
  { d: 'Mon', r: 12400, c: 8200 }, { d: 'Tue', r: 18600, c: 11400 }, { d: 'Wed', r: 9800, c: 7100 },
  { d: 'Thu', r: 22100, c: 14300 }, { d: 'Fri', r: 31500, c: 19800 }, { d: 'Sat', r: 28700, c: 17200 }, { d: 'Sun', r: 15900, c: 9600 },
];

const PNL = [
  { item: 'Total Revenue', amount: 139000, type: 'income' },
  { item: 'Cost of Goods Sold', amount: 87400, type: 'expense' },
  { item: 'Gross Profit', amount: 51600, type: 'profit' },
  { item: 'VAT Collected (7.5%)', amount: 10425, type: 'tax' },
  { item: 'Operating Expenses', amount: 8200, type: 'expense' },
  { item: 'Net Profit', amount: 43400, type: 'profit' },
];

const VAT_REPORT = [
  { period: 'Week 1 (Apr 1-7)', sales: 42000, vat: 3150, status: 'Filed' },
  { period: 'Week 2 (Apr 8-14)', sales: 38500, vat: 2887.5, status: 'Filed' },
  { period: 'Week 3 (Apr 15-21)', sales: 31000, vat: 2325, status: 'Pending' },
  { period: 'Week 4 (Apr 22-28)', sales: 27500, vat: 2062.5, status: 'Pending' },
];

export default function Accounting() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-extrabold text-gray-900">Accounting</h1>

      {/* Revenue / COGS / Profit Cards */}
      <div className="grid grid-cols-3 gap-3.5">
        <KPICard icon={TrendingUp} label="Total Revenue" value="₦139,000" sub="+18.4% vs last month" color="blue" />
        <KPICard icon={DollarSign} label="Total COGS" value="₦87,400" sub="Cost of goods sold" color="yellow" />
        <KPICard icon={TrendingUp} label="Gross Profit" value="₦51,600" sub="Margin: 37.1%" color="green" />
      </div>

      {/* Revenue vs Cost Bar Chart */}
      <div className="white-card">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Weekly Revenue vs Cost</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={REV}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="d" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tipStyle} formatter={(v, n) => [fmt(v), n === 'r' ? 'Revenue' : 'Cost']} />
            <Bar dataKey="r" fill="#f59e0b" radius={[5, 5, 0, 0]} />
            <Bar dataKey="c" fill="#06b6d4" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {/* P&L Summary */}
        <div className="white-card">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Monthly P&L Summary</h3>
          <table className="w-full text-sm">
            <tbody>
              {PNL.map((row) => (
                <tr key={row.item} className={`border-t border-gray-100 ${row.type === 'profit' ? 'font-bold' : ''}`}>
                  <td className={`py-2.5 ${row.type === 'profit' ? 'text-gray-900' : row.type === 'expense' ? 'text-red-600' : row.type === 'tax' ? 'text-blue-600' : 'text-green-600'}`}>{row.item}</td>
                  <td className={`py-2.5 text-right font-semibold ${row.type === 'profit' ? 'text-green-600' : row.type === 'expense' ? 'text-red-500' : 'text-gray-900'}`}>{fmt(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VAT Report */}
        <div className="white-card">
          <h3 className="font-bold text-gray-900 text-sm mb-4">VAT Report (7.5%)</h3>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              {['Period', 'Sales', 'VAT Due', 'Status'].map(h => <th key={h} className="px-3 py-2 text-[11px] text-gray-400 uppercase font-semibold text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {VAT_REPORT.map(row => (
                <tr key={row.period} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-xs text-gray-600">{row.period}</td>
                  <td className="px-3 py-2 text-xs text-gray-900 font-semibold">{fmt(row.sales)}</td>
                  <td className="px-3 py-2 text-xs text-amber-600 font-bold">{fmt(row.vat)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.status === 'Filed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
