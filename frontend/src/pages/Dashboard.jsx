import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import MetricCard from '../components/MetricCard';
import HealthGauge from '../components/HealthGauge';
import UniversalRemoteWidget from '../components/UniversalRemoteWidget';
import TechnicianView from '../components/TechnicianView';
import CommercialROIWidget from '../components/CommercialROIWidget';
import { 
  Thermometer, Droplets, Gauge, Zap, Activity, AlertTriangle, 
  PlayCircle, Users, Sun, Moon, Wrench, Building2, Cpu
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { latestReading, latestPrediction, alerts, simulation, telemetryHistory, triggerScenario } = useData();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('facility'); // 'facility' | 'technician'

  const occupancyCount = latestReading.occupancy ?? 6;
  const outdoorTemp = latestReading.outdoor_temp ?? 33.5;

  return (
    <div className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <span className="font-extrabold tracking-wide text-white">AIRCONIQ</span>
              <span className="text-cyan-400 font-normal">| Intelligent HVAC System</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              PREDICT • PREVENT • PERFORM
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time monitoring, multi-zone occupancy load compensation, universal remote dispatch & predictive diagnostics
          </p>
        </div>

        {/* Right Action Controls: Theme Switcher + View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-slate-200 transition shadow-md"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* View Mode Switcher: Facility Manager vs Technician */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 p-1.5 rounded-xl shadow-lg">
            <button
              onClick={() => setActiveTab('facility')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'facility'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Facility & Remote Dispatch</span>
            </button>
            <button
              onClick={() => setActiveTab('technician')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'technician'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Technician Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Fault Simulation Action Controls */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-sm font-bold">
          <PlayCircle className="w-5 h-5 text-blue-500" />
          <span>Interactive Simulation Scenario:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => triggerScenario('NORMAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              simulation.scenario === 'NORMAL'
                ? 'hvac-btn-active-normal shadow-md'
                : 'hvac-btn-inactive'
            }`}
          >
            NORMAL
          </button>
          <button
            onClick={() => triggerScenario('FILTER_CLOGGING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              simulation.scenario === 'FILTER_CLOGGING'
                ? 'hvac-btn-active-filter shadow-md'
                : 'hvac-btn-inactive'
            }`}
          >
            FILTER CLOGGING
          </button>
          <button
            onClick={() => triggerScenario('COMPRESSOR_OVERLOAD')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              simulation.scenario === 'COMPRESSOR_OVERLOAD'
                ? 'hvac-btn-active-overload shadow-md'
                : 'hvac-btn-inactive'
            }`}
          >
            COMPRESSOR OVERLOAD
          </button>
          <button
            onClick={() => triggerScenario('REFRIGERANT_LEAKAGE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              simulation.scenario === 'REFRIGERANT_LEAKAGE'
                ? 'hvac-btn-active-leakage shadow-md'
                : 'hvac-btn-inactive'
            }`}
          >
            REFRIGERANT LEAKAGE
          </button>
        </div>
      </div>

      {/* Sensor & Environmental Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard title="Indoor Temp" value={latestReading.temperature} unit="°C" icon={Thermometer} color="blue" />
        <MetricCard title="Humidity" value={latestReading.humidity} unit="%" icon={Droplets} color="green" />
        <MetricCard title="Pressure" value={latestReading.pressure} unit="kPa" icon={Gauge} color="purple" />
        <MetricCard title="Current" value={latestReading.current} unit="A" icon={Activity} color="yellow" />
        <MetricCard title="Power" value={latestReading.power} unit="W" icon={Zap} color="red" />
        <MetricCard title="Occupancy" value={occupancyCount} unit="ppl" icon={Users} color="blue" />
        <MetricCard title="Outdoor Temp" value={outdoorTemp} unit="°C" icon={Sun} color="yellow" />
      </div>

      {/* TAB CONTENT: Facility Overview vs Technician Diagnostics */}
      {activeTab === 'facility' ? (
        <>
          {/* Universal HVAC Remote Control & AI Mode Optimizer */}
          <UniversalRemoteWidget unitId="HVAC-001" sensorData={latestReading} />

          {/* Top Grid: Health Score + AI Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <HealthGauge score={latestPrediction.health_score} />

            <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Diagnostics & Fault Classification</span>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  latestPrediction.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  latestPrediction.severity === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  SEVERITY: {latestPrediction.severity.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                <div>
                  <p className="text-xs text-slate-400">Classified Fault</p>
                  <p className="text-base font-bold text-slate-100 capitalize">{latestPrediction.predicted_fault.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Confidence</p>
                  <p className="text-base font-bold text-cyan-400">{latestPrediction.confidence}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Anomaly Index</p>
                  <p className="text-base font-bold text-purple-400">{latestPrediction.anomaly_score}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Thermal Load</p>
                  <p className="text-base font-bold text-amber-400">+{occupancyCount * 120}W</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">Recommended Action:</span>
                <p className="text-slate-300 leading-relaxed">{latestPrediction.recommended_action}</p>
              </div>
            </div>
          </div>

          {/* Commercial B2B ROI & Sustainability Widget */}
          <CommercialROIWidget unitId="HVAC-001" />
        </>
      ) : (
        /* TECHNICIAN VIEW */
        <TechnicianView unitId="HVAC-001" sensorData={latestReading} />
      )}

      {/* Telemetry Live Trend Area Chart */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Power, Temp & Occupancy Telemetry</h3>
            <p className="text-xs text-slate-400">Real-time WebSocket streaming telemetry</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            ● Connected (1 Hz)
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryHistory.length > 0 ? telemetryHistory : [latestReading]}>
              <defs>
                <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="timestamp" tickFormatter={(t) => t ? t.substring(11, 19) : ''} stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Area yAxisId="left" type="monotone" dataKey="power" name="Power (W)" stroke="#3b82f6" fillOpacity={1} fill="url(#powerGrad)" />
              <Area yAxisId="right" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ef4444" fillOpacity={1} fill="url(#tempGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent System Alerts */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">System Alerts & Maintenance Dispatch</h3>
          <span className="text-xs text-slate-400">{alerts.length} Total Alerts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase border-b border-slate-700">
              <tr>
                <th className="p-3">Severity</th>
                <th className="p-3">Title</th>
                <th className="p-3">Message</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {alerts.slice(0, 5).map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-700/30">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 font-bold rounded ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-100">{alert.title}</td>
                  <td className="p-3 truncate max-w-md">{alert.message}</td>
                  <td className="p-3">
                    {alert.is_resolved ? (
                      <span className="text-emerald-400 font-semibold">Resolved</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">Active</span>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500">No active alerts recorded. System operating normally.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
