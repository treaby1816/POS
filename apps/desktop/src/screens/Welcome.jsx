import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

const SLIDES = [
  {
    img: '/images/slide1.jpg',
    tag: 'Smart POS Terminal',
    title: 'Faster Checkout,\nHappier Customers',
    body: 'Lightning-fast POS with barcode scanning, multi-payment and instant receipts.',
    accent: '#06b6d4',
  },
  {
    img: '/images/slide2.jpg',
    tag: 'Retail Intelligence',
    title: 'Run Every Store,\nFrom One Screen',
    body: 'Complete visibility — inventory, sales, staff and finances in real-time.',
    accent: '#3b82f6',
  },
  {
    img: '/images/slide3.jpg',
    tag: 'Works Offline',
    title: 'Sell Even Without\nthe Internet',
    body: 'Built for Nigeria — syncs when back online. Never lose a sale.',
    accent: '#a78bfa',
  },
  {
    img: '/images/slide4.jpg',
    tag: 'Full POS System',
    title: 'Everything You Need,\nIn One Place',
    body: 'Inventory, accounting, staff management and reporting — all built in.',
    accent: '#f59e0b',
  },
];

export default function Welcome({ onSignup, onLogin }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const go = (i) => {
    if (i === idx) return;
    setFading(true);
    setTimeout(() => { setIdx(i); setFading(false); }, 320);
  };

  useEffect(() => {
    const iv = setInterval(() => {
      setFading(true);
      setTimeout(() => { setIdx(a => (a + 1) % SLIDES.length); setFading(false); }, 320);
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  const s = SLIDES[idx];

  return (
    <div className="fixed inset-0 flex animate-fade-in" style={{ background: '#060d1c' }}>
      {/* Left panel */}
      <div className="flex flex-col justify-between w-full max-w-[460px] px-10 py-9 z-10" style={{ background: 'linear-gradient(160deg, #0a1628, #060d1c)', borderRight: '1px solid #111c2e' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] gradient-primary flex items-center justify-center shadow-[0_4px_14px_rgba(245,158,11,0.4)]">
            <span className="text-[17px] font-extrabold text-white">T</span>
          </div>
          <span className="text-white font-bold text-xl">Treabyn</span>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col justify-center pt-10">
          <div key={`tag-${idx}`} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-bold tracking-[1.5px] uppercase mb-5 w-fit transition-all ${fading ? 'opacity-0' : 'animate-slide-right'}`}
            style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}38`, color: s.accent }}>
            <Sparkles size={11} />{s.tag}
          </div>

          <h2 key={`h-${idx}`} className={`text-[clamp(24px,3.5vw,40px)] font-extrabold text-white leading-[1.15] tracking-[-1.5px] whitespace-pre-line mb-5 transition-all ${fading ? 'opacity-0' : 'animate-slide-right'}`}
            style={{ animationDelay: '0.04s' }}>
            {s.title}
          </h2>

          <p key={`p-${idx}`} className={`text-[#8899b4] text-sm leading-relaxed max-w-[380px] transition-all ${fading ? 'opacity-0' : 'animate-slide-right'}`}
            style={{ animationDelay: '0.08s' }}>
            {s.body}
          </p>

          {/* Dot indicators */}
          <div className="flex gap-[7px] mt-7">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className="rounded-full border-none transition-all duration-300"
                style={{ height: 4, width: i === idx ? 28 : 9, background: i === idx ? s.accent : '#1a2840' }} />
            ))}
          </div>

          {/* Nav arrows */}
          <div className="flex gap-2 mt-4">
            {[ChevronLeft, ChevronRight].map((Icon, i) => (
              <button key={i}
                onClick={() => go(i === 0 ? (idx - 1 + SLIDES.length) % SLIDES.length : (idx + 1) % SLIDES.length)}
                className="w-[34px] h-[34px] rounded-[10px] border border-[#1a2840] bg-[#0a1628] text-gray-600 flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-colors">
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">
          <button onClick={onSignup}
            className="w-full py-3.5 rounded-[14px] border-none gradient-primary text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(245,158,11,0.4)] hover:shadow-[0_10px_32px_rgba(245,158,11,0.5)] transition-shadow">
            Create Your Account <ArrowRight size={16} />
          </button>
          <button onClick={onLogin}
            className="w-full py-3 rounded-[14px] border border-[#1a2840] bg-transparent text-gray-500 font-semibold text-sm hover:bg-[#0a1628] hover:text-white transition-colors">
            Sign In to Existing Account
          </button>

          {/* Stats */}
          <div className="flex border-t border-[#111c2e] pt-3.5 mt-1">
            {[['2,400+', 'Stores'], ['₦4.8M', 'Daily Sales'], ['99.9%', 'Uptime']].map(([v, l]) => (
              <div key={l} className="flex-1 text-center">
                <div className="text-white font-bold text-sm">{v}</div>
                <div className="text-[#334d6e] text-[10px] mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — image carousel */}
      <div className="flex-1 relative overflow-hidden">
        <img
          key={idx}
          src={s.img}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-all duration-[550ms]"
          style={{ opacity: fading ? 0 : 1, transform: fading ? 'scale(1.04)' : 'scale(1)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #060d1c, #060d1c08 25%, transparent 55%)' }} />

        {/* Floating stats card */}
        <div className="absolute bottom-11 right-10 animate-float"
          style={{ background: 'rgba(8,16,32,0.88)', backdropFilter: 'blur(18px)', border: '1px solid #1a2840', borderRadius: 18, padding: '16px 20px', minWidth: 200 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-[7px] h-[7px] rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-gray-500 text-xs">Live Sales Today</span>
          </div>
          <div className="text-[26px] font-extrabold text-white tracking-[-1px]">₦312,490</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <span className="text-emerald-500 text-xs font-semibold">+18.4% vs yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
