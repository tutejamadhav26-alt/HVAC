import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  Zap, 
  Sliders, 
  Cpu, 
  Bell, 
  Info,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { latestPrediction, simulation } = useData();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/live', label: 'Live Telemetry', icon: Activity },
    { to: '/ai', label: 'AI Predict', icon: BrainCircuit },
    { to: '/energy', label: 'Energy & ROI', icon: Zap },
    { to: '/simulation', label: 'Simulation', icon: Sliders },
    { to: '/units', label: 'Units', icon: Cpu },
    { to: '/alerts', label: 'Alerts', icon: Bell },
    { to: '/system', label: 'System', icon: Info },
  ];

  const getStatusDot = () => {
    const sev = latestPrediction?.severity;
    if (sev === 'Critical') return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]';
    if (sev === 'High' || sev === 'Medium') return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]';
    return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]';
  };

  return (
    <>
      {/* SVG Gooey Filter Definition */}
      <svg className="fixed top-0 left-0 pointer-events-none opacity-0 w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Top Floating Header & Centered Gooey Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Minimalist AirconIQ Branding */}
          <NavLink 
            to="/" 
            className="flex items-center gap-2.5 py-1.5 px-3 rounded-2xl bg-white/70 dark:bg-[#121212]/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition"
          >
            <img 
              src="/logo-icon.png" 
              alt="AirconIQ" 
              className="w-8 h-8 object-contain rounded-xl p-0.5 bg-black border border-zinc-800"
            />
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-black text-sm tracking-widest text-zinc-900 dark:text-zinc-100 leading-tight">
                  AIRCONIQ
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  AI
                </span>
              </div>
              <span className="text-[8px] font-bold tracking-wider text-amber-600 dark:text-amber-400">
                PREDICT • PREVENT • PERFORM
              </span>
            </div>
          </NavLink>

          {/* Center: The Gooey Floating Pill Navbar (Desktop) */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-auto">
            <div 
              className="relative p-1.5 rounded-full bg-white/80 dark:bg-[#111111]/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg flex items-center gap-1"
              onMouseLeave={() => setHoveredPath(null)}
              style={{ filter: 'url(#gooey-filter)' }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                const isHovered = hoveredPath === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onMouseEnter={() => setHoveredPath(item.to)}
                    className="relative z-10 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 flex items-center gap-1.5"
                    style={{
                      color: isActive 
                        ? '#ffffff' 
                        : isHovered 
                          ? (theme === 'dark' ? '#f4f4f5' : '#09090b')
                          : (theme === 'dark' ? '#a1a1aa' : '#52525b')
                    }}
                  >
                    {/* Active Gooey Spring Background */}
                    {isActive && (
                      <motion.div
                        layoutId="gooey-active-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-md -z-10"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                          mass: 0.8
                        }}
                      />
                    )}

                    {/* Hover Gooey Liquid Trail */}
                    {!isActive && isHovered && (
                      <motion.div
                        layoutId="gooey-hover-pill"
                        className="absolute inset-0 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 -z-10"
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 28
                        }}
                      />
                    )}

                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Right: Minimalist Controls (Theme Switcher + Status) */}
          <div className="flex items-center gap-2">
            
            {/* Live Status Pill */}
            <div className="hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/70 dark:bg-[#121212]/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${getStatusDot()} animate-pulse`} />
              <span className="text-zinc-600 dark:text-zinc-300 text-[11px] font-mono">
                {simulation.scenario || 'NORMAL'}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/70 dark:bg-[#121212]/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm active:scale-95"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-zinc-800" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-white/70 dark:bg-[#121212]/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-200 transition"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 p-3 rounded-2xl bg-white/95 dark:bg-[#111111]/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-1"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
