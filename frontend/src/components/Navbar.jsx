import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Cpu, 
  BrainCircuit, 
  Sliders, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  Layers,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { latestPrediction, simulation, alerts } = useData();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const unresolvedAlerts = alerts?.filter(a => !a.is_resolved) || [];
  const unresolvedCount = unresolvedAlerts.length;

  const authNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/devices', label: 'HVAC Devices', icon: Cpu },
    { to: '/recommendations', label: 'AI Recommendations', icon: BrainCircuit },
    { to: '/settings', label: 'Settings', icon: Sliders },
  ];

  const publicNavItems = [
    { to: '/welcome', label: 'Overview', icon: Layers },
    { to: '/login', label: 'Sign In', icon: LogIn }
  ];

  const navItems = isAuthenticated ? authNavItems : publicNavItems;

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0b0f14]/90 backdrop-blur-md border-b border-black/[0.08] dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand: AirconIQ Commercial BEMS */}
        <Link 
          to={isAuthenticated ? "/" : "/welcome"} 
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition group"
          title="AirconIQ — PREDICT • PREVENT • PERFORM"
        >
          <div className="p-1.5 rounded-lg bg-slate-950 dark:bg-black/60 border border-slate-800 dark:border-white/10 shadow-sm flex items-center justify-center">
            <img 
              src="/logo-icon-transparent.png" 
              alt="AirconIQ Logo" 
              className="w-6 h-6 object-contain group-hover:scale-105 transition-transform" 
            />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-base font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Aircon<span className="text-[#3b82f6] font-extrabold">IQ</span>
            </span>
            <span className="text-[8.5px] font-bold text-amber-500 dark:text-amber-400 tracking-widest block truncate">
              PREDICT • PREVENT • PERFORM
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Tabs (Accent used for active state ONLY) */}
        <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-[12px] border border-black/[0.05] dark:border-white/[0.06]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative px-3.5 py-1.5 rounded-[9px] text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-zinc-600 dark:text-[#9aa7b4] hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bems-nav-active-pill"
                    className="absolute inset-0 rounded-[9px] bg-[#3b82f6] shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Controls: Alerts Bell, User Chip, Theme Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Alert Bell with Unresolved Badge */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(prev => !prev)}
                className="relative p-2 rounded-[10px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-[#9aa7b4] hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-black/[0.15] dark:hover:border-white/[0.15] transition shadow-sm"
                aria-label={`System alerts: ${unresolvedCount} unresolved`}
                title="System Alerts"
              >
                <Bell className="w-4 h-4" />
                {unresolvedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-[10px] font-black flex items-center justify-center shadow">
                    {unresolvedCount > 9 ? '9+' : unresolvedCount}
                  </span>
                )}
              </button>

              {/* Alerts Dropdown Drawer */}
              <AnimatePresence>
                {showAlertsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-[14px] bg-white dark:bg-[#121821] border border-black/[0.1] dark:border-white/[0.1] shadow-2xl p-3 z-50 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                        Active System Alerts
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-[#9aa7b4]">
                        {unresolvedCount} unresolved
                      </span>
                    </div>

                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {unresolvedAlerts.length > 0 ? (
                        unresolvedAlerts.slice(0, 4).map(alert => (
                          <div 
                            key={alert.id}
                            className="p-2 rounded-[8px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{alert.title}</span>
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                alert.severity === 'critical' ? 'bg-[#ef4444]/15 text-[#ef4444]' : 'bg-[#f59e0b]/15 text-[#f59e0b]'
                              }`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-600 dark:text-[#9aa7b4] mt-0.5 line-clamp-2">
                              {alert.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-zinc-500 dark:text-[#9aa7b4] flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                          <span>All systems normal. No active alerts.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile Chip */}
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] p-1 pl-2.5 rounded-[10px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hidden sm:inline max-w-[110px] truncate">
                {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">
                {user?.role || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="p-1 rounded-[6px] hover:bg-[#ef4444]/10 text-zinc-500 hover:text-[#ef4444] transition"
                aria-label="Sign out"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-[10px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-[#9aa7b4] hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-black/[0.15] dark:hover:border-white/[0.15] transition shadow-sm"
            aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-zinc-800" /> : <Sun className="w-4 h-4 text-[#f59e0b]" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[10px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-4 py-3 border-t border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121821] space-y-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#3b82f6] text-white'
                      : 'text-zinc-600 dark:text-[#9aa7b4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
