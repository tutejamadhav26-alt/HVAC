import React from 'react';
import { useData } from '../context/DataContext';
import MetricCard from '../components/MetricCard';
import HealthGauge from '../components/HealthGauge';
import { Thermometer, Droplets, Gauge, Zap, Activity, AlertTriangle, PlayCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const { latestReading, latestPrediction, alerts, simulation, telemetryHistory, triggerScenario } = useData();

  return (
    <div className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">HVAC Operations Overview</h1>
          <p className="text-sm text-slate-400">Real-time monitoring, AI diagnostics, and fault simulation control</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg p-2 px-4">
          <span className="text-xs text-slate-400 font-medium">Active Simulation:</span>
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded">
            {simulation.scenario} ({simulation.speed_multiplier}x)
          </span>
        </div>
      </div>

      {/* Quick Fault Simulation Action Controls */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <PlayCircle className="w-5 h-5 text-blue-400" />
          <span>Quick Scenario Switcher:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => triggerScenario('NORMAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              simulation.scenario === 'NORMAL'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            NORMAL
          </button>
          <button
            onClick={() => triggerScenario('FILTER_CLOGGING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              simulation.scenario === 'FILTER_CLOGGING'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            FILTER CLOGGING
          </button>
          <button
            onClick={() => triggerScenario('COMPRESSOR_OVERLOAD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              simulation.scenario === 'COMPRESSOR_OVERLOAD'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            COMPRESSOR OVERLOAD
          </button>
          <button
            onClick={() => triggerScenario('REFRIGERANT_LEAKAGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              simulation.scenario === 'REFRIGERANT_LEAKAGE'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            REFRIGERANT LEAKAGE
          </button>
        </div>
      </div>

      {/* Top Grid: Health Score + AI Diagnostics + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Gauge */}
        <HealthGauge score={latestPrediction.health_score} />

        {/* AI Diagnostics Card */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Diagnostics & Fault Prediction</span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
              latestPrediction.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              latestPrediction.severity === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              SEVERITY: {latestPrediction.severity.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
            <div>
              <p className="text-xs text-slate-400">Predicted Fault</p>
              <p className="text-lg font-bold text-slate-100 capitalize">{latestPrediction.predicted_fault.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Model Confidence</p>
              <p className="text-lg font-bold text-blue-400">{latestPrediction.confidence}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Anomaly Score</p>
              <p className="text-lg font-bold text-purple-400">{latestPrediction.anomaly_score}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-3 text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">Recommended Action:</span>
            <p className="text-slate-300 leading-relaxed">{latestPrediction.recommended_action}</p>
          </div>
        </div>
      </div>

      {/* Sensor Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Temperature" value={latestReading.temperature} unit="°C" icon={Thermometer} color="blue" />
        <MetricCard title="Humidity" value={latestReading.humidity} unit="%" icon={Droplets} color="green" />
        <MetricCard title="Pressure" value={latestReading.pressure} unit="kPa" icon={Gauge} color="purple" />
        <MetricCard title="Current" value={latestReading.current} unit="A" icon={Activity} color="yellow" />
        <MetricCard title="Power" value={latestReading.power} unit="W" icon={Zap} color="red" />
      </div>

      {/* Telemetry Live Trend Area Chart */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Power & Temperature Stream</h3>
          <span className="text-xs text-slate-400">Real-time WebSocket feed</span>
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
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent System Alerts</h3>
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
                  <td colSpan="4" className="p-4 text-center text-slate-500">No active alerts recorded. System normal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
