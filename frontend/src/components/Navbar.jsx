import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  Zap, 
  History, 
  Bell, 
  Sliders, 
  Cpu, 
  Settings, 
  Info,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { latestPrediction, simulation } = useData();
  const { theme, toggleTheme } = useTheme();

  const getStatusBadge = () => {
    const sev = latestPrediction.severity;
    if (sev === 'Critical') return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
    if (sev === 'High' || sev === 'Medium') return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">WARNING</span>;
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">NORMAL</span>;
  };

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/live', label: 'Live Telemetry', icon: Activity },
    { to: '/ai', label: 'AI Predictions', icon: BrainCircuit },
    { to: '/energy', label: 'Energy Monitoring', icon: Zap },
    { to: '/history', label: 'Historical Data', icon: History },
    { to: '/alerts', label: 'Alerts Center', icon: Bell },
    { to: '/simulation', label: 'Simulation Control', icon: Sliders },
    { to: '/units', label: 'HVAC Units', icon: Cpu },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/system', label: 'System Info', icon: Info },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Header Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
          <Flame className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100 leading-tight">Smart HVAC AI</h1>
          <p className="text-xs text-slate-400">Predictive Diagnostics</p>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">System Status</p>
          <div className="mt-0.5">{getStatusBadge()}</div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Scenario</p>
          <p className="text-xs font-bold text-blue-400">{simulation.scenario}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Switcher Toggle */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition border border-slate-700/60"
          title="Toggle Light / Dark Theme"
        >
          <span className="flex items-center gap-2">
            {theme === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Dark Theme</span>
              </>
            )}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
            Switch
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        HVAC Minor Project v1.0.0
      </div>
    </div>
  );
}
