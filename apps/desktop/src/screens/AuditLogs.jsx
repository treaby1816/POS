import { useState } from 'react';
import { ShieldAlert, Search, Filter, Clock, User, AlertCircle, Key, Server } from 'lucide-react';

const MOCK_LOGS = [
  { id: 'log-01', user: 'Admin', role: 'owner', action: 'System Login', resource: 'Authentication', details: 'Successful login from 192.168.1.10', time: '10:45 AM', date: '2026-05-02', type: 'info', icon: User },
  { id: 'log-02', user: 'Cashier 1', role: 'cashier', action: 'Sale Completed', resource: 'POS Terminal', details: 'Receipt TRB-1002 - ₦45,200', time: '11:15 AM', date: '2026-05-02', type: 'success', icon: Server },
  { id: 'log-03', user: 'Admin', role: 'owner', action: 'Price Update', resource: 'Inventory', details: 'Changed price of Coca-Cola 500ml from ₦250 to ₦300', time: '01:20 PM', date: '2026-05-02', type: 'warning', icon: AlertCircle },
  { id: 'log-04', user: 'System', role: 'system', action: 'Failed Login', resource: 'Authentication', details: 'Invalid credentials attempted for user: Cashier 2', time: '02:05 PM', date: '2026-05-02', type: 'danger', icon: ShieldAlert },
  { id: 'log-05', user: 'Manager', role: 'manager', action: 'Stock Adjustment', resource: 'Inventory', details: 'Deducted 5 units of Indomie Noodles (Damaged)', time: '03:30 PM', date: '2026-05-02', type: 'warning', icon: AlertCircle },
  { id: 'log-06', user: 'Admin', role: 'owner', action: 'Settings Updated', resource: 'System', details: 'Changed store VAT percentage to 7.5%', time: '04:10 PM', date: '2026-05-01', type: 'info', icon: Key },
];

export default function AuditLogs() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesQuery = !query || log.action.toLowerCase().includes(query.toLowerCase()) || log.user.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All' || log.type === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <ShieldAlert size={22} className="text-amber-500" />
          System Audit Logs
        </h1>
        <div className="flex gap-2">
          <button className="btn-secondary !text-xs !px-3 !py-2 flex items-center gap-1.5"><Filter size={12}/> Export CSV</button>
        </div>
      </div>

      <div className="white-card flex-1 flex flex-col overflow-hidden !p-0">
        <div className="p-4 border-b border-gray-100 flex gap-3 bg-gray-50/50">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users or actions..." className="input-default !pl-9 !py-1.5 !text-xs" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input-default !w-auto !py-1.5 !text-xs">
            <option value="All">All Event Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 text-[11px] text-gray-500 uppercase font-bold">Timestamp</th>
                <th className="px-5 py-3 text-[11px] text-gray-500 uppercase font-bold">User</th>
                <th className="px-5 py-3 text-[11px] text-gray-500 uppercase font-bold">Action</th>
                <th className="px-5 py-3 text-[11px] text-gray-500 uppercase font-bold">Resource</th>
                <th className="px-5 py-3 text-[11px] text-gray-500 uppercase font-bold w-[35%]">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const Icon = log.icon;
                const badgeColors = {
                  info: 'bg-blue-100 text-blue-700',
                  success: 'bg-green-100 text-green-700',
                  warning: 'bg-yellow-100 text-yellow-700',
                  danger: 'bg-red-100 text-red-700',
                };
                return (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-gray-900 font-bold text-xs">{log.time}</div>
                      <div className="text-gray-400 text-[10px]">{log.date}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-gray-900 font-bold text-xs flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] text-gray-600">{log.user.charAt(0)}</div>
                        {log.user}
                      </div>
                      <div className="text-gray-400 text-[10px] capitalize ml-6.5 mt-0.5">{log.role}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${badgeColors[log.type]}`}><Icon size={12} /></div>
                        <span className="font-semibold text-gray-900 text-xs">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{log.resource}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{log.details}</td>
                  </tr>
                );
              })}
              {!filteredLogs.length && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <ShieldAlert size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No logs match your filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
