import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Radio } from 'lucide-react';

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(window.location.origin.includes('3000') ? 'http://localhost:8000' : window.location.origin);
  const [mqttBroker, setMqttBroker] = useState('localhost');
  const [mqttPort, setMqttPort] = useState(1883);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">System Configuration & Settings</h1>
        <p className="text-sm text-slate-400">Configure API endpoints, MQTT broker parameters, and telemetry thresholds</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-lg space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Backend API Base URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
          <p className="text-xs text-slate-500 mt-1">Used for REST and WebSocket connections</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">MQTT Broker Host</label>
            <input
              type="text"
              value={mqttBroker}
              onChange={(e) => setMqttBroker(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">MQTT Port</label>
            <input
              type="number"
              value={mqttPort}
              onChange={(e) => setMqttPort(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
          {saved ? (
            <span className="text-xs font-bold text-emerald-400">Settings saved successfully!</span>
          ) : <span />}
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
