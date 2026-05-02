import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SyncStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
      {syncing ? <RefreshCw size={12} className="animate-spin" /> : online ? <Wifi size={12} /> : <WifiOff size={12} />}
      {syncing ? 'Syncing…' : online ? 'Online' : 'Offline'}
    </div>
  );
}
