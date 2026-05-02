import { TrendingUp, TrendingDown } from 'lucide-react';

const GRADIENTS = {
  yellow: 'card-gradient-yellow', green: 'card-gradient-green', teal: 'card-gradient-teal',
  red: 'card-gradient-red', blue: 'card-gradient-blue', purple: 'card-gradient-purple',
};
const SHADOWS = {
  yellow: 'rgba(245,158,11,0.35)', green: 'rgba(16,185,129,0.3)', teal: 'rgba(6,182,212,0.3)',
  red: 'rgba(239,68,68,0.3)', blue: 'rgba(59,130,246,0.3)', purple: 'rgba(139,92,246,0.3)',
};

export default function KPICard({ icon: Icon, label, value, sub, trend, color = 'yellow' }) {
  return (
    <div className={`${GRADIENTS[color]} rounded-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer hover:scale-[1.02]`} style={{ boxShadow: `0 8px 28px ${SHADOWS[color]}` }}>
      <div className="absolute -right-3 -top-3 w-[75px] h-[75px] rounded-full bg-white/[0.12] pointer-events-none" />
      <div className="flex items-start justify-between mb-3 relative">
        <div className="w-[38px] h-[38px] rounded-[11px] bg-white/[0.22] flex items-center justify-center">
          <Icon size={17} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-white tracking-tight relative">{value}</div>
      <div className="text-[13px] text-white/[0.85] mt-1 font-semibold relative">{label}</div>
      {sub && <div className="text-[11px] text-white/60 mt-0.5 relative">{sub}</div>}
    </div>
  );
}
