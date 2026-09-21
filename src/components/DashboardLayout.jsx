import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import {
  LayoutDashboard, Scale, FileText, Bell, LogOut, Menu, X,
  Building2, Shield, Users, Award
} from 'lucide-react';

const roleConfig = {
  applicant: {
    title: 'Applicant Portal',
    color: 'from-blue-900 to-blue-800',
    links: [
      { to: '/applicant', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/applicant/instruments', icon: Scale, label: 'My Instruments' },
      { to: '/applicant/applications', icon: FileText, label: 'Applications' },
      { to: '/applicant/certificates', icon: Award, label: 'Certificates' },
    ]
  },
  lmo: {
    title: 'LMO Portal',
    color: 'from-emerald-900 to-emerald-800',
    links: [
      { to: '/lmo', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/lmo/applications', icon: FileText, label: 'Applications' },
    ]
  },
  gatc: {
    title: 'GATC Portal',
    color: 'from-amber-900 to-amber-800',
    links: [
      { to: '/gatc', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  admin: {
    title: 'Admin Portal',
    color: 'from-slate-900 to-slate-800',
    links: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/users', icon: Users, label: 'User Management' },
      { to: '/admin/gatc-centres', icon: Building2, label: 'GATC Centres' },
      { to: '/admin/audit-log', icon: Shield, label: 'Audit Log' },
    ]
  }
};

const roleLabels = {
  applicant: 'Applicant',
  lmo: 'Legal Metrology Officer',
  gatc: 'Test Centre Operator',
  admin: 'System Administrator',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState({ notifications: [], unread: 0 });
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!showNotifs) return;
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  const config = roleConfig[user?.role] || roleConfig.applicant;

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleMarkRead = async () => {
    await api.markNotificationsRead();
    setNotifications(prev => ({ ...prev, unread: 0, notifications: prev.notifications.map(n => ({ ...n, is_read: 1 })) }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Indian tricolor stripe */}
      <div className="govt-stripe" aria-hidden="true" />

      {/* Top navbar */}
      <header className={`bg-gradient-to-r ${config.color} text-white`} role="banner">
        <div className="flex items-center justify-between px-4 h-14 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                <Scale size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold font-display leading-tight tracking-tight">ParimaN</h1>
                <p className="text-[10px] text-white/60 leading-tight hidden sm:block">Legal Metrology Verification</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-md hover:bg-white/10 transition-colors"
                aria-label={`Notifications${notifications.unread > 0 ? ` (${notifications.unread} unread)` : ''}`}
              >
                <Bell size={18} />
                {notifications.unread > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {notifications.unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden" role="dialog" aria-label="Notifications">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                    {notifications.unread > 0 && (
                      <button onClick={handleMarkRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark all read</button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-72">
                    {notifications.notifications.length === 0 ? (
                      <p className="p-6 text-sm text-slate-400 text-center">No notifications yet</p>
                    ) : (
                      notifications.notifications.slice(0, 10).map(n => (
                        <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/40 border-l-2 border-l-blue-500' : ''}`}>
                          <p className="text-sm font-medium text-slate-800 leading-snug">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/15">
              <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center text-xs font-bold">
                {user?.full_name?.charAt(0)}
              </div>
              <div className="hidden md:block max-w-[140px]">
                <p className="text-xs font-medium leading-tight truncate">{user?.full_name}</p>
                <p className="text-[10px] text-white/50 leading-tight">{roleLabels[user?.role]}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors ml-1"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-56 bg-white border-r border-slate-200 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 pt-[53px] lg:pt-0`}
          role="navigation"
          aria-label="Main navigation"
        >
          <nav className="p-3 space-y-0.5">
            <div className="px-3 pt-2 pb-3 mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{config.title}</p>
            </div>
            {config.links.map(link => {
              const isActive = location.pathname === link.to || (link.to !== `/${user?.role}` && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <link.icon size={16} className={isActive ? 'text-blue-700' : ''} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Demo notice */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="bg-amber-50 border border-amber-100 rounded-md px-3 py-2 text-center">
              <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">SIH 2026 Prototype</p>
              <p className="text-[10px] text-amber-600/70 mt-0.5">Simulated Environment</p>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-30 lg:hidden" aria-hidden="true" />}

        {/* Main content */}
        <main id="main-content" className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-53px)] overflow-auto" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
