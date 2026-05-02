import { useState } from 'react';
import { Store, FileText, Percent, Palette, Database, ShieldCheck, Info, Save, ExternalLink } from 'lucide-react';
import useLicense from '../store/useLicense';

const Section = ({ icon: Icon, title, children }) => (
  <div className="white-card">
    <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2"><Icon size={16} className="text-amber-500" />{title}</h3>
    {children}
  </div>
);

export default function Settings() {
  const license = useLicense();
  const [store, setStore] = useState({ name: 'Treabyn Store 1', address: 'Wuse 2, Abuja', phone: '08012345678', email: 'hello@treabyn.com' });
  const [receipt, setReceipt] = useState({ header: 'Treabyn Store', footer: 'Thank you for shopping with us!', showLogo: true });
  const [vat, setVat] = useState({ enabled: true, percentage: 7.5 });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-900">Settings</h1>
        <button onClick={handleSave} className={`flex items-center gap-1.5 !text-xs ${saved ? 'bg-green-500 text-white border-none px-4 py-2 rounded-btn font-bold' : 'btn-primary'}`}>
          <Save size={13} />{saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Store Info */}
        <Section icon={Store} title="Store Information">
          <div className="flex flex-col gap-3">
            {[['Store Name', 'name'], ['Address', 'address'], ['Phone', 'phone'], ['Email', 'email']].map(([label, key]) => (
              <div key={key}><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">{label}</label>
                <input value={store[key]} onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))} className="input-default" /></div>
            ))}
          </div>
        </Section>

        {/* Receipt */}
        <Section icon={FileText} title="Receipt Customization">
          <div className="flex flex-col gap-3">
            <div><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Receipt Header</label>
              <input value={receipt.header} onChange={e => setReceipt(p => ({ ...p, header: e.target.value }))} className="input-default" /></div>
            <div><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">Receipt Footer</label>
              <input value={receipt.footer} onChange={e => setReceipt(p => ({ ...p, footer: e.target.value }))} className="input-default" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={receipt.showLogo} onChange={e => setReceipt(p => ({ ...p, showLogo: e.target.checked }))} className="rounded" />
              Show Treabyn logo on receipt
            </label>
          </div>
        </Section>

        {/* VAT */}
        <Section icon={Percent} title="VAT Settings">
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <input type="checkbox" checked={vat.enabled} onChange={e => setVat(p => ({ ...p, enabled: e.target.checked }))} className="rounded" />
            Enable VAT on sales
          </label>
          {vat.enabled && (
            <div><label className="block text-gray-500 text-[11px] font-bold uppercase mb-1">VAT Percentage</label>
              <input type="number" value={vat.percentage} onChange={e => setVat(p => ({ ...p, percentage: Number(e.target.value) }))} className="input-default !w-32" step="0.1" /></div>
          )}
        </Section>

        {/* Theme */}
        <Section icon={Palette} title="Appearance">
          <div className="flex gap-3">
            {[['light', 'Light', '#fff', '#1e293b'], ['dark', 'Dark', '#0a0f1e', '#fff']].map(([val, label, bg, text]) => (
              <button key={val} onClick={() => setTheme(val)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${theme === val ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'border-gray-200'}`}
                style={{ background: bg, color: text }}>
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* Backup */}
        <Section icon={Database} title="Backup & Restore">
          <p className="text-gray-500 text-xs mb-3">Export your local data or restore from a backup file.</p>
          <div className="flex gap-2">
            <button className="btn-primary !text-xs">Export Backup</button>
            <button className="btn-secondary !text-xs">Restore from File</button>
          </div>
        </Section>

        {/* License */}
        <Section icon={ShieldCheck} title="License Information">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${license.isDemo ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                {license.isDemo ? 'Demo Mode' : 'Licensed'}
              </span>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="text-gray-900 font-semibold capitalize">{license.plan || 'Demo'}</span></div>
            {license.licenseKey && (
              <div className="flex justify-between"><span className="text-gray-500">Key</span><span className="font-mono text-amber-500 text-xs">{license.licenseKey}</span></div>
            )}
            {license.expiresAt && <div className="flex justify-between"><span className="text-gray-500">Expires</span><span className="text-gray-900">{license.expiresAt}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Stores</span><span className="text-gray-900">{license.maxStores}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Devices</span><span className="text-gray-900">{license.maxDevices}</span></div>
            {license.isDemo && (
              <button onClick={() => window.open('https://treabyn.com/pricing', '_blank')} className="btn-primary mt-2 !text-xs flex items-center justify-center gap-1.5">
                <ExternalLink size={12} />Upgrade to Full License
              </button>
            )}
          </div>
        </Section>
      </div>

      {/* About */}
      <div className="white-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-extrabold text-lg shadow-[0_4px_14px_rgba(245,158,11,0.4)]">T</div>
          <div>
            <div className="font-bold text-gray-900">Treabyn POS</div>
            <div className="text-gray-400 text-xs">Version 1.0.0 · © 2026 Treabyn. All rights reserved.</div>
            <div className="text-gray-400 text-[11px] mt-0.5 italic">Welcome to the next level of building with AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
