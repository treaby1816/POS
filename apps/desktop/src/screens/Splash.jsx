import { useState, useEffect } from 'react';

export default function Splash({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 700);
    const t2 = setTimeout(() => setExit(true), 2300);
    const t3 = setTimeout(onDone, 2900);
    const iv = setInterval(() => setProgress(x => Math.min(x + 2, 100)), 30);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(iv); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center animate-fade-in transition-opacity duration-[600ms]"
      style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 35%, #0c1e3a, #050d1a)', opacity: exit ? 0 : 1 }}
    >
      {/* Logo with spinning rings */}
      <div className="relative w-[130px] h-[130px] flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-amber-500 border-r-amber-500/20 animate-spin-slow" />
        <div className="absolute inset-[14px] rounded-full border border-transparent border-b-orange-500 border-l-orange-500/20 animate-spin-reverse" />
        <div className="absolute inset-2 rounded-full border border-amber-500/10 animate-pulse-ring" />
        <div className="w-[76px] h-[76px] rounded-full gradient-primary flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.35)]">
          <span className="text-[32px] font-extrabold text-white">T</span>
        </div>
      </div>

      <div className="text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-4xl font-extrabold text-white tracking-[-2px] mb-1">Treabyn</h1>
        <p className="text-[11px] text-gray-600 tracking-[4px] uppercase">Retail · POS · Accounting</p>
      </div>

      {showText && (
        <p className="mt-5 text-gray-500 text-sm animate-fade-up" style={{ animationDuration: '0.4s' }}>
          Powering Nigerian retail, one sale at a time.
        </p>
      )}

      {/* Progress bar */}
      <div className="mt-11 w-[180px] h-0.5 bg-[#0f172a] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-[30ms] linear" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)' }} />
      </div>
      <p className="mt-2 text-[11px] text-[#1e293b] tracking-[2px]">LOADING {Math.min(Math.round(progress), 100)}%</p>
    </div>
  );
}
