import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal } from '../components/ScrollReveal';
import { 
  BrainCircuit, 
  Activity, 
  Zap, 
  Radio, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Building2, 
  Gauge, 
  Flame, 
  Snowflake,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();



  const specs = [
    { label: 'ML Inference Speed', val: '< 18ms', desc: 'Real-time classification' },
    { label: 'Energy Reduction', val: 'Up to 22%', desc: 'Occupancy setpoint setback' },
    { label: 'Fault Accuracy', val: '98.4%', desc: 'XGBoost trained ensemble' },
    { label: 'Telemetry Ingestion', val: '1 Hz Live', desc: 'MQTT & WebSocket streams' },
  ];

  return (
    <div className="space-y-20 py-6 sm:py-10">
      
      {/* HERO SECTION */}
      <section className="relative text-center max-w-4xl mx-auto px-4">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Fire & Ice Brand Emblem (Merged with color palette, no separate block) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative inline-flex items-center justify-center mb-6 group cursor-default"
        >
          {/* Ambient Glow merged with background */}
          <div className="absolute inset-0 w-28 h-28 sm:w-32 sm:h-32 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-gradient-to-tr from-amber-500/20 via-orange-500/15 to-blue-500/25 rounded-full blur-2xl pointer-events-none" />
          
          <img 
            src="/logo-icon-transparent.png" 
            alt="AirconIQ Emblem" 
            className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_8px_22px_rgba(59,130,246,0.35)] group-hover:scale-105 transition-transform duration-300" 
          />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.16] max-w-4xl mx-auto mt-2 mb-4"
        >
          <span className="block text-zinc-950 dark:text-white drop-shadow-sm">
            AI–Based Smart HVAC
          </span>
          <span className="block bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600 dark:from-sky-400 dark:via-cyan-300 dark:to-sky-400 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(56,189,248,0.3)]">
            Monitoring and Prediction
          </span>
          <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 dark:from-cyan-300 dark:via-sky-400 dark:to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(34,211,238,0.3)]">
            System
          </span>
        </motion.h1>



        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          {isAuthenticated ? (
            <Link
              to="/"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 active:scale-95 transition flex items-center gap-2"
            >
              <span>Go to Operations Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 active:scale-95 transition flex items-center gap-2"
              >
                <span>Enter Enterprise Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl bg-white dark:bg-[#161616] hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>1-Click Role Login</span>
              </Link>
            </>
          )}
        </motion.div>

        {/* Live Interactive Telemetry Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 text-left bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Live Sensor Telemetry Simulation (HVAC-001)
              </span>
            </div>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#181818] border border-zinc-200/80 dark:border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Indoor Temp</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 font-mono">24.0°C</span>
              <span className="text-[10px] text-zinc-500 block mt-1">Setpoint: 22.0°C</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#181818] border border-zinc-200/80 dark:border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Real-time Power</span>
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">1,712W</span>
              <span className="text-[10px] text-zinc-500 block mt-1">Current: 8.0A</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#181818] border border-zinc-200/80 dark:border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Zone Occupancy</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">10 ppl</span>
              <span className="text-[10px] text-zinc-500 block mt-1">Load: +1,200W</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#181818] border border-zinc-200/80 dark:border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Health Score</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">98/100</span>
              <span className="text-[10px] text-emerald-500 font-bold block mt-1">NORMAL STATE</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SPECS BANNER */}
      <ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {specs.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-cyan-400 font-mono">
                {item.val}
              </div>
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                {item.label}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>


      {/* PRE-LOGIN CTA FOOTER */}
      <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-10 text-white text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Experience AirconIQ?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto mt-2">
              Sign in with your enterprise credentials or use 1-click role authentication to access live diagnostics, universal remote control, and AI fault classification.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-extrabold text-xs uppercase tracking-wider shadow-md transition"
              >
                Access Enterprise Login
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
