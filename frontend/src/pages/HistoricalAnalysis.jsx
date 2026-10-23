import React, { useState, useEffect } from 'react';
import { fetchSensorHistory } from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function HistoricalAnalysis() {
  const [timeframe, setTimeframe] = useState('1h');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchSensorHistory('HVAC-001', timeframe);
        if (data) setHistoryData(data);
      } catch (e) {
        console.error('[-] Error fetching historical data:', e);
      }
      setLoading(false);
    }
    loadData();
  }, [timeframe]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Historical Telemetry & Analytics</h1>
          <p className="text-sm text-slate-400">Database historical queries over custom time horizons</p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex bg-slate-800 p-1 border border-slate-700 rounded-lg">
          {['1h', '6h', '24h', '7d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase transition ${
                timeframe === tf
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading historical dataset from database...</div>
      ) : (
        <div className="space-y-6">
          {/* Temperature & Humidity Chart */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Temperature & Humidity Historical Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="timestamp" tickFormatter={(t) => t ? t.substring(11, 16) : ''} stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="temp" stroke="#a855f7" fontSize={11} domain={['auto', 'auto']} />
                  <YAxis yAxisId="hum" orientation="right" stroke="#10b981" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#a855f7" strokeWidth={2} dot={false} />
                  <Line yAxisId="hum" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current & Power Historical Chart */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Compressor Current & Power Consumption Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="timestamp" tickFormatter={(t) => t ? t.substring(11, 16) : ''} stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="curr" stroke="#f59e0b" fontSize={11} domain={['auto', 'auto']} />
                  <YAxis yAxisId="pow" orientation="right" stroke="#ef4444" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line yAxisId="curr" type="monotone" dataKey="current" name="Current (A)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line yAxisId="pow" type="monotone" dataKey="power" name="Power (W)" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
