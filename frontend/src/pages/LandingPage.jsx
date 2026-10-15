import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';
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
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: BrainCircuit,
      color: 'from-blue-500 to-indigo-600',
      title: 'Predictive Anomaly Engine',
      description: 'Dual-model machine learning (Isolation Forest + XGBoost) predicting refrigerant leakage, filter clogging, and compressor overload up to 48 hours before failure.'
    },
    {
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      title: 'Occupancy-Driven Load Sensing',
      description: 'Calculates dynamic sensible and latent thermal heat output based on live headcounts (+120W per occupant) to modulate thermostat setpoints automatically.'
    },
    {
      icon: Radio,
      color: 'from-cyan-500 to-blue-600',
      title: 'Universal Remote Dispatch',
      description: 'Hardware-agnostic infrared HEX and Modbus RTU command bridging across Daikin, Carrier, Toshiba, Panasonic, Mitsubishi, and LG systems.'
    },
    {
      icon: Zap,
      color: 'from-emerald-500 to-teal-600',
      title: 'ESG & Tariff Accounting',
      description: 'Quantifiable financial return metrics, daily kWh savings analytics, and carbon offset accounting showing equivalent trees planted.'
    }
  ];

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

        {/* Brand Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#141414]/90 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6"
        >
          <img src="/logo-icon.png" alt="AirconIQ" className="w-5 h-5 object-contain" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-wider">
            AIRCONIQ
          </span>
          <span className="text-[10px] text-amber-500 font-extrabold tracking-widest uppercase">
            PREDICT • PREVENT • PERFORM
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.12]"
        >
          Autonomous HVAC AI Diagnostics &{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            Thermodynamic Load Control
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          An enterprise AI operations platform that fuses multi-zone sensor telemetry, occupancy heat load dynamics, and machine learning to predict HVAC faults before mechanical degradation.
        </motion.p>

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
                <Sparkles className="w-4 h-4 text-amber-500" />
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
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
              Active WebSocket • 1 Hz
            </span>
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

      {/* CORE CAPABILITIES GRID */}
      <section className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
              System Architecture
            </span>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mt-2">
              Engineered for Mission-Critical Commercial Facilities
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Combining thermodynamic physics modeling with machine learning classifiers for autonomous building monitoring.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <StaggerItem key={idx}>
                <div className="h-full bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed font-medium">
                    {feat.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

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
