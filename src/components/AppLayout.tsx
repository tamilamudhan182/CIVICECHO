import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Wallet, Trophy, ShieldCheck, LogOut, UserCheck } from 'lucide-react';

const citizenNavItems = [
  { path: '/dashboard', label: 'Citizen Dashboard', icon: LayoutDashboard },
  { path: '/report', label: 'Report Issue', icon: FileText },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const authorityNavItems = [
  { path: '/authority', label: 'Authority Dashboard', icon: ShieldCheck },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  // Detect role from localStorage or current URL path
  const storedRole = localStorage.getItem('userRole');
  const isAuthority = storedRole === 'authority' || location.pathname.startsWith('/authority');
  const items = isAuthority ? authorityNavItems : citizenNavItems;

  const authorityName = localStorage.getItem('authorityName') || 'Municipal Authority Admin';
  const userName = localStorage.getItem('userName') || 'Aarav Sharma';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col gradient-hero text-primary-foreground">
        <div className="p-6">
          <Link to={isAuthority ? "/authority" : "/dashboard"} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block">CivicEchoX</span>
              <span className="text-[11px] text-primary-foreground/70 flex items-center gap-1 font-medium">
                {isAuthority ? <ShieldCheck className="w-3 h-3 text-accent" /> : <UserCheck className="w-3 h-3 text-accent" />}
                {isAuthority ? 'Authority Admin' : 'Citizen Portal'}
              </span>
            </div>
          </Link>
        </div>

        {/* User profile snippet */}
        <div className="mx-4 mb-2 p-3 rounded-lg bg-white/10 text-xs text-primary-foreground/90 font-medium">
          <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider font-semibold">Active Session</p>
          <p className="font-bold truncate mt-0.5">{isAuthority ? authorityName : userName}</p>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm'
                    : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/"
          onClick={() => localStorage.removeItem('userRole')}
          className="flex items-center gap-3 px-7 py-4 text-sm text-primary-foreground/70 hover:text-primary-foreground transition border-t border-sidebar-border"
        >
          <LogOut className="w-4 h-4" />
          Sign Out & Switch Portal
        </Link>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 gradient-hero text-primary-foreground">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="font-bold">CivicEchoX ({isAuthority ? 'Admin' : 'Citizen'})</span>
          </div>
          <Link to="/" onClick={() => localStorage.removeItem('userRole')} className="text-xs text-primary-foreground/80 underline">
            Sign Out
          </Link>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  active ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-primary-foreground/70'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:p-0 pt-24 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
