import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import MetricCard from '../components/MetricCard';
import HealthGauge from '../components/HealthGauge';
import UniversalRemoteWidget from '../components/UniversalRemoteWidget';
import TechnicianView from '../components/TechnicianView';
import CommercialROIWidget from '../components/CommercialROIWidget';
import { motion } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import { 
  Thermometer, Droplets, Gauge, Zap, Activity, AlertTriangle, 
  PlayCircle, Users, Sun, Wrench, Building2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { latestReading, latestPrediction, alerts, simulation, telemetryHistory, triggerScenario } = useData();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('facility'); // 'facility' | 'technician'

  const occupancyCount = latestReading.occupancy ?? 6;
  const outdoorTemp = latestReading.outdoor_temp ?? 33.5;

  return (
    <div className="space-y-6">
      {/* Centered Facility vs Technician Mode Switcher */}
      <ScrollReveal>
        <div className="flex justify-center items-center pt-1 pb-2">
          <div className="relative inline-flex items-center bg-zinc-100 dark:bg-[#141414] p-1 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm">
            <button
              onClick={() => setActiveTab('facility')}
              className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'facility'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {activeTab === 'facility' && (
                <motion.div
                  layoutId="tab-switch-pill"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Building2 className="w-4 h-4" />
              <span>Facility & Remote Dispatch</span>
            </button>
            <button
              onClick={() => setActiveTab('technician')}
              className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'technician'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {activeTab === 'technician' && (
                <motion.div
                  layoutId="tab-switch-pill"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Wrench className="w-4 h-4" />
              <span>Technician Diagnostics</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Fault Simulation Action Controls */}
      <ScrollReveal delay={0.05}>
        <div className="bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider">
            <PlayCircle className="w-4 h-4 text-blue-500" />
            <span>Interactive Fault Simulator:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerScenario('NORMAL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                simulation.scenario === 'NORMAL'
                  ? 'hvac-btn-active-normal shadow-md'
                  : 'hvac-btn-inactive'
              }`}
            >
              NORMAL
            </button>
            <button
              onClick={() => triggerScenario('FILTER_CLOGGING')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                simulation.scenario === 'FILTER_CLOGGING'
                  ? 'hvac-btn-active-filter shadow-md'
                  : 'hvac-btn-inactive'
              }`}
            >
              FILTER CLOGGING
            </button>
            <button
              onClick={() => triggerScenario('COMPRESSOR_OVERLOAD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                simulation.scenario === 'COMPRESSOR_OVERLOAD'
                  ? 'hvac-btn-active-overload shadow-md'
                  : 'hvac-btn-inactive'
              }`}
            >
              COMPRESSOR OVERLOAD
            </button>
            <button
              onClick={() => triggerScenario('REFRIGERANT_LEAKAGE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                simulation.scenario === 'REFRIGERANT_LEAKAGE'
                  ? 'hvac-btn-active-leakage shadow-md'
                  : 'hvac-btn-inactive'
              }`}
            >
              REFRIGERANT LEAKAGE
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Staggered Entrance of Sensor Metric Cards (Powered by Anime.js & Framer Motion) */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StaggerItem>
          <MetricCard title="Indoor Temp" value={latestReading.temperature} unit="°C" icon={Thermometer} color="blue" />
        </StaggerItem>
        <StaggerItem>
          <MetricCard title="Humidity" value={latestReading.humidity} unit="%" icon={Droplets} color="green" />
        </StaggerItem>
        <StaggerItem>
          <MetricCard title="Pressure" value={latestReading.pressure} unit="kPa" icon={Gauge} color="purple" />
        </StaggerItem>
        <StaggerItem>
          <MetricCard title="Current" value={latestReading.current} unit="A" icon={Activity} color="yellow" />
        </StaggerItem>
        <StaggerItem>
          <MetricCard title="Power" value={latestReading.power} unit="W" icon={Zap} color="red" />
        </StaggerItem>
        <StaggerItem>
          <MetricCard title="Occupancy" value={occupancyCount} unit="ppl" icon={Users} color="blue" />
        </StaggerItem>
        <StaggerItem>
          <MetricCard title="Outdoor Temp" value={outdoorTemp} unit="°C" icon={Sun} color="yellow" />
        </StaggerItem>
      </StaggerContainer>

      {/* TAB CONTENT: Facility Overview vs Technician Diagnostics */}
      {activeTab === 'facility' ? (
        <>
          {/* Universal HVAC Remote Control & AI Mode Optimizer */}
          <ScrollReveal delay={0.1}>
            <UniversalRemoteWidget unitId="HVAC-001" sensorData={latestReading} />
          </ScrollReveal>

          {/* Top Grid: Health Score + AI Diagnostics */}
          <ScrollReveal delay={0.12}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <HealthGauge score={latestPrediction.health_score} />

              <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    AI Diagnostics & Fault Classification
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    latestPrediction.severity === 'Critical' ? 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30' :
                    latestPrediction.severity === 'High' ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}>
                    SEVERITY: {latestPrediction.severity.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                  <div>
                    <p className="text-xs text-zinc-400">Classified Fault</p>
                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                      {latestPrediction.predicted_fault.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Confidence</p>
                    <p className="text-base font-bold text-blue-600 dark:text-cyan-400">
                      {latestPrediction.confidence}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Anomaly Index</p>
                    <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                      {latestPrediction.anomaly_score}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Thermal Load</p>
                    <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                      +{occupancyCount * 120}W
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs">
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                    Recommended Action:
                  </span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {latestPrediction.recommended_action}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Commercial B2B ROI & Sustainability Widget */}
          <ScrollReveal delay={0.15}>
            <CommercialROIWidget unitId="HVAC-001" />
          </ScrollReveal>
        </>
      ) : (
        /* TECHNICIAN VIEW */
        <ScrollReveal delay={0.1}>
          <TechnicianView unitId="HVAC-001" sensorData={latestReading} />
        </ScrollReveal>
      )}

      {/* Telemetry Live Trend Area Chart */}
      <ScrollReveal delay={0.18}>
        <div className="bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Live Power & Temperature Telemetry
              </h3>
              <p className="text-xs text-zinc-400">WebSocket real-time streaming</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              ● Connected (1 Hz)
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory.length > 0 ? telemetryHistory : [latestReading]}>
                <defs>
                  <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" tickFormatter={(t) => t ? t.substring(11, 19) : ''} stroke="#71717a" fontSize={11} />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area yAxisId="left" type="monotone" dataKey="power" name="Power (W)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#powerGrad)" />
                <Area yAxisId="right" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ScrollReveal>

      {/* Recent System Alerts */}
      <ScrollReveal delay={0.2}>
        <div className="bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              System Alerts & Maintenance Dispatch
            </h3>
            <span className="text-xs text-zinc-400 font-semibold">{alerts.length} Total Alerts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-[#181818] text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {alerts.slice(0, 5).map((alert) => (
                  <tr key={alert.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 font-bold rounded ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">{alert.title}</td>
                    <td className="p-3 truncate max-w-md">{alert.message}</td>
                    <td className="p-3">
                      {alert.is_resolved ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Resolved</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-zinc-400">No active alerts recorded. System operating normally.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
