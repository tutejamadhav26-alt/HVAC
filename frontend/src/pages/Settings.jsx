import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, Save, ShieldCheck, Cpu, Play, CheckCircle2, 
  AlertCircle, History, Clock, RefreshCw, Key, Network, Lock
} from 'lucide-react';
import { 
  fetchControlSettings, 
  updateControlSettings, 
  fetchSystemAuditLogs, 
  evaluateAutoMode 
} from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    min_allowable_setpoint: 18.0,
    max_allowable_setpoint: 28.0,
    auto_mode_global_enabled: false,
    auto_mode_min_interval_minutes: 15,
    auto_mode_min_temp_diff: 1.0,
    default_bms_gateway_ip: '192.168.1.100',
    default_vrf_port: 10102
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, logs] = await Promise.all([
        fetchControlSettings(),
        fetchSystemAuditLogs(25)
      ]);
      if (s) setSettings(s);
      if (logs) setAuditLogs(logs);
    } catch (e) {
      console.error('Error loading settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateControlSettings(settings);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    }
  };

  const handleTriggerAutoEval = async () => {
    setEvaluating(true);
    setEvalResult(null);
    try {
      const res = await evaluateAutoMode();
      setEvalResult(res);
      // Reload logs
      const logs = await fetchSystemAuditLogs(25);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-500" />
          System Settings & Equipment Operating Limits
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configure safety temperature bounds, automatic control policies, controller defaults, and review command audit trails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Control Limits & Auto-Mode Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            {/* 1. Operating Safety Limits */}
            <div className="space-y-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Equipment Safety Operating Limits
                </h2>
              </div>
              <p className="text-xs text-zinc-500">
                Enforced by all controller adapters to prevent freezing, excessive compressor head pressure, or equipment stress.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Minimum Allowable Setpoint (°C):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="15"
                    max="24"
                    value={settings.min_allowable_setpoint}
                    onChange={(e) => setSettings({ ...settings, min_allowable_setpoint: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Default: 18.0°C</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Maximum Allowable Setpoint (°C):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="24"
                    max="32"
                    value={settings.max_allowable_setpoint}
                    onChange={(e) => setSettings({ ...settings, max_allowable_setpoint: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Default: 28.0°C</span>
                </div>
              </div>
            </div>

            {/* 2. Automated Control Policy */}
            <div className="space-y-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-500" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Automatic Mode Control Policy
                  </h2>
                </div>

                {/* Global Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_mode_global_enabled}
                    onChange={(e) => setSettings({ ...settings, auto_mode_global_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <p className="text-xs text-zinc-500">
                When enabled, the backend applies validated AI recommendations automatically only to units that have Auto-Mode explicitly turned on.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Min Interval Between Changes (Minutes):
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={settings.auto_mode_min_interval_minutes}
                    onChange={(e) => setSettings({ ...settings, auto_mode_min_interval_minutes: parseInt(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Prevents short-cycling</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Min Temp Delta to Trigger Auto Change (°C):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="3.0"
                    value={settings.auto_mode_min_temp_diff}
                    onChange={(e) => setSettings({ ...settings, auto_mode_min_temp_diff: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Avoids micro-adjustments</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerAutoEval}
                  disabled={evaluating}
                  className="px-3.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
                  <span>{evaluating ? 'Evaluating...' : 'Run Auto-Mode Evaluation Now'}</span>
                </button>

                {evalResult && (
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-2">
                    Evaluation complete: Evaluated {evalResult.total_evaluated} unit(s). {evalResult.actions_taken?.length || 0} action(s) taken.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Controller Defaults */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Default Controller Gateway Configuration
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Default BMS Gateway Host:
                  </label>
                  <input
                    type="text"
                    value={settings.default_bms_gateway_ip}
                    onChange={(e) => setSettings({ ...settings, default_bms_gateway_ip: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Default VRF Gateway Port:
                  </label>
                  <input
                    type="number"
                    value={settings.default_vrf_port}
                    onChange={(e) => setSettings({ ...settings, default_vrf_port: parseInt(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {savedNotice ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
                </span>
              ) : <span />}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Auditable Command & Event Log */}
        <div className="lg:col-span-5 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Command Audit Trail
              </h3>
            </div>
            <button
              onClick={loadData}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Refresh Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-zinc-500">
            Complete verifiable log of all setpoint adjustments and mode changes transmitted to controllers.
          </p>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {log.unit_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.triggered_by === 'ai_auto'
                        ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30'
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                    }`}>
                      {log.triggered_by === 'ai_auto' ? 'Auto Applied' : 'Manual'}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    {log.target_temperature && <span>Set: <strong>{log.target_temperature}°C</strong> • </span>}
                    {log.mode && <span>Mode: <strong>{log.mode}</strong> • </span>}
                    {log.fan_speed && <span>Fan: <strong>{log.fan_speed}</strong></span>}
                  </div>

                  <p className="text-[10px] text-zinc-400 font-mono truncate">
                    {log.message}
                  </p>

                  <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/40 dark:border-zinc-700/40 flex items-center justify-between">
                    <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                    <span className="text-emerald-600 font-bold">Executed</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No commands recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
