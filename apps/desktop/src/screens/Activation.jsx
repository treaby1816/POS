import { useState } from 'react';
import { ShieldCheck, AlertCircle, Check, ExternalLink, Sparkles } from 'lucide-react';
import useLicense from '../store/useLicense';

export default function Activation({ onActivated }) {
  const [key, setKey] = useState('');
  const { activate, enterDemo, loading, error } = useLicense();
  const [success, setSuccess] = useState(false);

  // Auto-format as user types: TRB-XXXX-XXXX-XXXX-XXXX
  const handleKeyChange = (e) => {
    let v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    // Auto-insert dashes
    const raw = v.replace(/-/g, '');
    if (raw.length <= 3) { v = raw; }
    else if (raw.length <= 4) { v = raw.slice(0, 3) + '-' + raw.slice(3); }
    else if (raw.length <= 8) { v = raw.slice(0, 3) + '-' + raw.slice(3, 7) + (raw.length > 7 ? '-' : ''); }
    else if (raw.length <= 12) { v = raw.slice(0, 3) + '-' + raw.slice(3, 7) + '-' + raw.slice(7, 11) + (raw.length > 11 ? '-' : ''); }
    else if (raw.length <= 16) { v = raw.slice(0, 3) + '-' + raw.slice(3, 7) + '-' + raw.slice(7, 11) + '-' + raw.slice(11, 15) + (raw.length > 15 ? '-' : ''); }
    else { v = raw.slice(0, 3) + '-' + raw.slice(3, 7) + '-' + raw.slice(7, 11) + '-' + raw.slice(11, 15) + '-' + raw.slice(15, 19); }
    setKey(v);
  };

  const handleActivate = async () => {
    const result = await activate(key);
    if (result.success) { setSuccess(true); setTimeout(() => onActivated?.(), 1500); }
  };

  if (success) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center animate-fade-in" style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 35%, #0c1e3a, #050d1a)' }}>
        <div className="animate-fade-up text-center">
          <div className="w-[72px] h-[72px] rounded-full gradient-primary flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">License Activated!</h2>
          <p className="text-gray-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 35%, #0c1e3a, #050d1a)' }}>
      {/* Animated logo */}
      <div className="relative w-[130px] h-[130px] flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-amber-500 border-r-amber-500/20 animate-spin-slow" />
        <div className="absolute inset-[14px] rounded-full border border-transparent border-b-orange-500 border-l-orange-500/20 animate-spin-reverse" />
        <div className="absolute inset-2 rounded-full border border-amber-500/10 animate-pulse-ring" />
        <div className="w-[76px] h-[76px] rounded-full gradient-primary flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.35)]">
          <span className="text-[32px] font-extrabold text-white">T</span>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 animate-fade-up">Treabyn</h1>
      <p className="text-[11px] text-gray-600 tracking-[4px] uppercase mb-10 animate-fade-up">Retail · POS · Accounting</p>

      {/* Activation card */}
      <div className="w-[420px] bg-[#0d1829] border border-[#1a2840] rounded-2xl p-7 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={18} className="text-amber-500" />
          <h2 className="text-lg font-bold text-white">Activate Your License</h2>
        </div>

        <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-2">License Key</label>
        <input
          value={key} onChange={handleKeyChange} placeholder="TRB-XXXX-XXXX-XXXX-XXXX" maxLength={23}
          className="w-full bg-[#0a0f1e] border border-[#1a2840] rounded-xl px-4 py-3 text-amber-500 text-lg font-mono font-bold tracking-[2px] text-center placeholder:text-gray-700 focus:border-amber-500 transition-colors"
          onKeyDown={e => e.key === 'Enter' && handleActivate()}
        />

        {error && (
          <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs">
            <AlertCircle size={13} />{error}
          </div>
        )}

        <button onClick={handleActivate} disabled={loading || key.length < 23}
          className={`w-full mt-4 py-3 rounded-[13px] border-none font-bold text-sm flex items-center justify-center gap-2 transition-all
            ${loading ? 'bg-gray-800 text-gray-500' : key.length >= 23 ? 'gradient-primary text-white shadow-[0_8px_28px_rgba(245,158,11,0.4)] hover:shadow-[0_10px_32px_rgba(245,158,11,0.5)]' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
        >
          {loading ? <><div className="w-4 h-4 border-2 border-gray-600 border-t-amber-500 rounded-full animate-spin" />Validating…</> : <><ShieldCheck size={14} />Activate</>}
        </button>

        <div className="flex items-center gap-2.5 mt-4">
          <div className="flex-1 h-px bg-[#1a2840]" /><span className="text-gray-600 text-[11px]">or</span><div className="flex-1 h-px bg-[#1a2840]" />
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <button onClick={() => window.open('https://treabyn.com/pricing', '_blank')}
            className="w-full py-2.5 rounded-xl border border-[#1a2840] bg-transparent text-gray-500 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#0a1628] hover:text-white transition-colors">
            <ExternalLink size={12} />Buy a License
          </button>
          <button onClick={() => { enterDemo(); onActivated?.(); }}
            className="w-full py-2.5 rounded-xl border border-[#1a2840] bg-transparent text-gray-600 text-xs flex items-center justify-center gap-2 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 transition-colors">
            <Sparkles size={12} />Continue in Demo Mode
          </button>
        </div>
      </div>

      <p className="mt-6 text-gray-700 text-[11px] animate-fade-up" style={{ animationDelay: '0.3s' }}>
        Powering Nigerian retail, one sale at a time.
      </p>
    </div>
  );
}
