import { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login({ onSuccess, onSignup }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = () => {
    if (!email || !pass) { setErr('Please fill in all fields'); return; }
    setErr(''); setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 1600);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 animate-fade-in">
      <div className="w-full max-w-[400px] mx-6 bg-white border border-gray-100 rounded-3xl p-10 shadow-[0_8px_40px_rgba(44,62,107,0.12)] animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-[38px] h-[38px] rounded-[10px] gradient-primary flex items-center justify-center shadow-[0_4px_14px_rgba(245,158,11,0.4)]">
            <span className="text-[18px] font-extrabold text-white">T</span>
          </div>
          <div>
            <div className="text-gray-900 font-bold text-[17px]">Treabyn</div>
            <div className="text-gray-400 text-[11px]">Retail &amp; POS Platform</div>
          </div>
        </div>

        <h2 className="text-[22px] font-extrabold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to your Treabyn account</p>

        {err && (
          <div className="bg-red-50 border border-red-200 rounded-[10px] px-3 py-2.5 text-red-600 text-sm flex items-center gap-2 mb-4">
            <AlertCircle size={13} />{err}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {[{ Icon: Mail, label: 'EMAIL', val: email, sv: setEmail, type: 'email', ph: 'you@example.com' },
            { Icon: Lock, label: 'PASSWORD', val: pass, sv: setPass, type: 'password', ph: 'Your password' }].map(({ Icon, label, val, sv, type, ph }) => (
            <div key={label}>
              <label className="block text-gray-500 text-[11px] font-bold tracking-wide mb-1">{label}</label>
              <div className="relative">
                <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type={type} value={val} onChange={e => sv(e.target.value)} placeholder={ph}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  className="input-default !pl-9" />
              </div>
            </div>
          ))}

          <div className="flex justify-end"><span className="text-amber-500 text-xs cursor-pointer hover:underline">Forgot password?</span></div>

          <button onClick={submit} disabled={loading}
            className={`w-full py-3 rounded-[13px] border-none font-bold text-sm flex items-center justify-center gap-2 transition-all ${loading ? 'bg-gray-100 text-gray-400' : 'gradient-primary text-white shadow-[0_8px_24px_rgba(245,158,11,0.35)]'}`}>
            {loading ? <><div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />Signing in…</> : 'Sign In →'}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-px bg-gray-100" /><span className="text-gray-300 text-xs">or</span><div className="flex-1 h-px bg-gray-100" />
          </div>

          <button onClick={onSuccess}
            className="w-full py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Continue as Demo User
          </button>

          <p className="text-center text-gray-400 text-sm">New to Treabyn? <span onClick={onSignup} className="text-amber-500 font-semibold cursor-pointer">Create account</span></p>
        </div>
      </div>
    </div>
  );
}
