import { useState, useEffect } from 'react';
import useLicense from './store/useLicense';

import Splash from './screens/Splash';
import Welcome from './screens/Welcome';
import SignUp from './screens/SignUp';
import Login from './screens/Login';
import Activation from './screens/Activation';
import Dashboard from './screens/Dashboard';
import POS from './screens/POS';
import Sales from './screens/Sales';
import Inventory from './screens/Inventory';
import Customers from './screens/Customers';
import Expenses from './screens/Expenses';
import Accounting from './screens/Accounting';
import Suppliers from './screens/Suppliers';
import Users from './screens/Users';
import Settings from './screens/Settings';
import AuditLogs from './screens/AuditLogs';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function MainApp({ onLogout }) {
  const [view, setView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderScreen = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={setView} />;
      case 'pos': return <POS />;
      case 'sales': return <Sales />;
      case 'inventory': return <Inventory />;
      case 'customers': return <Customers />;
      case 'expenses': return <Expenses />;
      case 'accounting': return <Accounting />;
      case 'suppliers': return <Suppliers />;
      case 'users': return <Users />;
      case 'audit-logs': return <AuditLogs />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden animate-fade-in">
      <Sidebar view={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar view={view} />
        <main className="flex-1 overflow-y-auto p-5 bg-white">{renderScreen()}</main>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('splash');
  const { isActivated, enterDemo, logout } = useLicense();

  useEffect(() => {
    // Initial Theme Load
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Auto-navigate to app when activated from any screen
  useEffect(() => {
    if (isActivated && screen !== 'app') {
      setScreen('app');
    }
  }, [isActivated]);

  const handleLogout = () => {
    logout();
    setScreen('welcome');
  };

  if (screen === 'app' && isActivated) {
    return <MainApp onLogout={handleLogout} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {screen === 'splash' && <Splash onDone={() => setScreen('welcome')} />}
      {screen === 'welcome' && <Welcome onSignup={() => setScreen('signup')} onLogin={() => setScreen('login')} />}
      {screen === 'signup' && <SignUp onSuccess={() => setScreen('activation')} onBack={() => setScreen('welcome')} />}
      {screen === 'login' && <Login onSuccess={() => { enterDemo(); setScreen('app'); }} onSignup={() => setScreen('signup')} />}
      {screen === 'activation' && <Activation onActivated={() => setScreen('app')} />}
    </div>
  );
}
