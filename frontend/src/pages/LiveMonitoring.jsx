import React from 'react';
import { useData } from '../context/DataContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import MetricCard from '../components/MetricCard';
import { Thermometer, Droplets, Gauge, Activity, Zap } from 'lucide-react';

export default function LiveMonitoring() {
  const { latestReading, telemetryHistory } = useData();
  const history = telemetryHistory.length > 0 ? telemetryHistory : [latestReading];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Live Telemetry & Sensor Monitoring</h1>
        <p className="text-sm text-slate-400">High-frequency real-time sensor charts streaming via WebSocket</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Temp" value={latestReading.temperature} unit="°C" icon={Thermometer} color="emerald" />
        <MetricCard title="Humidity" value={latestReading.humidity} unit="%" icon={Droplets} color="green" />
        <MetricCard title="Pressure" value={latestReading.pressure} unit="kPa" icon={Gauge} color="purple" />
        <MetricCard title="Current" value={latestReading.current} unit="A" icon={Activity} color="yellow" />
        <MetricCard title="Power" value={latestReading.power} unit="W" icon={Zap} color="red" />
      </div>

      {/* Grid of Live Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Temperature Trend (°C)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" tickFormatter={(t) => t ? t.substring(11, 19) : ''} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#10b981" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Chart */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Compressor Current (Amperes)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" tickFormatter={(t) => t ? t.substring(11, 19) : ''} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#f59e0b" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pressure Chart */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Suction Pressure (kPa)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" tickFormatter={(t) => t ? t.substring(11, 19) : ''} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#a855f7" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="pressure" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Power Chart */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Power Consumption (Watts)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" tickFormatter={(t) => t ? t.substring(11, 19) : ''} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#ef4444" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="power" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
