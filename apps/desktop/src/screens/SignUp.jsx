import { useState } from 'react';
import { User, Mail, Phone, Building2, MapPin, Lock, ChevronLeft, AlertCircle, Check, Zap, ShieldCheck, Wifi, Star } from 'lucide-react';

export default function SignUp({ onSuccess, onBack }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', location: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.length < 10) e.phone = 'Valid phone';
    if (!form.business.trim()) e.business = 'Required';
    if (form.password.length < 6) e.password = 'Min 6 chars';
    if (form.password !== form.confirm) e.confirm = "Doesn't match";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => { if (!validate()) return; setLoading(true); setTimeout(() => { setLoading(false); setDone(true); }, 1800); setTimeout(onSuccess, 2900); };

  const Field = ({ icon: Icon, label, name, type = 'text', ph = '' }) => (
    <div>
      <label className="block text-gray-500 text-[11px] font-bold tracking-wide uppercase mb-1">{label}</label>
      <div className="relative">
        <Icon size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${errors[name] ? 'text-red-500' : 'text-gray-400'}`} />
        <input type={type} value={form[name]} onChange={e => set(name, e.target.value)} placeholder={ph}
          className={`input-default !pl-9 ${errors[name] ? '!border-red-300' : ''}`} />
      </div>
      {errors[name] && <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 flex animate-fade-in bg-gray-50">
      {/* Left panel */}
      <div className="w-[280px] flex-shrink-0 flex flex-col justify-between px-7 py-9 gradient-navy">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] gradient-primary flex items-center justify-center shadow-[0_4px_14px_rgba(245,158,11,0.4)]"><span className="text-[17px] font-extrabold text-white">T</span></div>
          <span className="text-white font-bold text-[17px]">Treabyn</span>
        </div>
        <div>
          <div className="animate-float bg-white/[0.07] border border-white/[0.12] rounded-2xl p-5 mb-6">
            <Star size={20} className="text-amber-500 mb-2" />
            <p className="text-[#7899b8] text-xs leading-relaxed">"Treabyn transformed how we manage our supermarkets. Reconciliation now takes 5 minutes."</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-[11px] font-bold">A</div>
              <div><div className="text-[#c8d8e8] text-xs font-semibold">Adaeze Nwosu</div><div className="text-[#334d6e] text-[11px]">Owner, FreshMart Lagos</div></div>
            </div>
          </div>
          {[[ShieldCheck, 'Bank-grade security'], [Wifi, 'Works offline'], [Zap, 'Setup in 5 minutes']].map(([Icon, text]) => (
            <div key={text} className="flex items-center gap-2.5 mb-2.5">
              <div className="w-[26px] h-[26px] rounded-[7px] bg-amber-500/[0.15] flex items-center justify-center"><Icon size={12} className="text-amber-500" /></div>
              <span className="text-[#3d5570] text-xs">{text}</span>
            </div>
          ))}
        </div>
        <p className="text-[#1a2840] text-[11px]">© 2026 Treabyn.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 overflow-y-auto px-7 py-10 bg-white">
        <div className="max-w-[480px] mx-auto">
          <button onClick={onBack} className="flex items-center gap-1 text-gray-400 text-sm bg-transparent border-none mb-7 hover:text-gray-600 transition-colors"><ChevronLeft size={14} />Back</button>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-7">Get your store live on Treabyn in under 5 minutes.</p>

          {done ? (
            <div className="text-center py-12 animate-fade-up">
              <div className="w-[68px] h-[68px] rounded-full gradient-primary flex items-center justify-center mx-auto mb-5 shadow-[0_0_32px_rgba(245,158,11,0.4)]"><Check size={28} className="text-white" /></div>
              <h3 className="text-gray-900 text-xl font-bold mb-1.5">Welcome to Treabyn!</h3>
              <p className="text-gray-500 text-sm">Setting up your dashboard…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <Field icon={User} label="Full Name" name="name" ph="e.g. Felix Ohakwe" />
                <Field icon={Mail} label="Email" name="email" type="email" ph="you@example.com" />
                <Field icon={Phone} label="Phone" name="phone" ph="+234 800 000 0000" />
                <Field icon={Building2} label="Business Name" name="business" ph="e.g. FreshMart Abuja" />
              </div>
              <Field icon={MapPin} label="Store Location" name="location" ph="e.g. Wuse 2, Abuja" />
              <div className="grid grid-cols-2 gap-3">
                <Field icon={Lock} label="Password" name="password" type="password" ph="Min 6 characters" />
                <Field icon={Lock} label="Confirm Password" name="confirm" type="password" ph="Repeat password" />
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">By creating an account you agree to Treabyn's <span className="text-amber-500 cursor-pointer">Terms</span> and <span className="text-amber-500 cursor-pointer">Privacy Policy</span>.</p>
              <button onClick={submit} disabled={loading}
                className={`w-full py-3 rounded-[13px] border-none font-bold text-sm flex items-center justify-center gap-2 transition-all ${loading ? 'bg-gray-100 text-gray-400' : 'gradient-primary text-white shadow-[0_8px_28px_rgba(245,158,11,0.35)]'}`}>
                {loading ? <><div className="w-4 h-4 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />Creating…</> : <><Zap size={14} />Launch My Store</>}
              </button>
              <p className="text-center text-gray-400 text-sm">Already have an account? <span onClick={onBack} className="text-amber-500 font-semibold cursor-pointer">Sign In</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
