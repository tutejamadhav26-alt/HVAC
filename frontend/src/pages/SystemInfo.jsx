import React, { useEffect, useState } from 'react';
import { fetchSystemStatus } from '../services/api';
import { Server, Database, Brain, Radio, Cpu, Activity } from 'lucide-react';

export default function SystemInfo() {
  const [statusData, setStatusData] = useState({
    status: 'OPERATIONAL',
    backend_version: '1.0.0',
    db_connected: true,
    ml_models_loaded: true,
    simulator_active: true,
    mqtt_connected: false,
    active_hvac_units: 1,
    total_readings: 0,
    active_alerts: 0
  });

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetchSystemStatus();
        if (res) setStatusData(res);
      } catch (e) {
        console.error('[-] Error loading system info:', e);
      }
    }
    loadStatus();
  }, []);

  const items = [
    { label: 'System Operational Status', value: statusData.status, icon: Server, ok: statusData.status === 'OPERATIONAL' },
    { label: 'Database Connection (SQLite/Postgres)', value: statusData.db_connected ? 'CONNECTED' : 'DISCONNECTED', icon: Database, ok: statusData.db_connected },
    { label: 'ML Models (IsolationForest & XGBoost)', value: statusData.ml_models_loaded ? 'LOADED & ACTIVE' : 'PHYSICS FALLBACK', icon: Brain, ok: statusData.ml_models_loaded },
    { label: 'HVAC Sensor Simulator Engine', value: statusData.simulator_active ? 'RUNNING' : 'STOPPED', icon: Activity, ok: statusData.simulator_active },
    { label: 'MQTT Broker Integration (Mosquitto)', value: statusData.mqtt_connected ? 'CONNECTED' : 'STANDBY / SIMULATOR MODE', icon: Radio, ok: true },
    { label: 'Total Ingested Telemetry Records', value: `${statusData.total_readings} Records`, icon: Cpu, ok: true }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">System Information & Health Diagnostics</h1>
        <p className="text-sm text-slate-400">Core architecture status, database state, ML inference engine, and MQTT integration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">{item.label}</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">{item.value}</p>
                </div>
              </div>
              <span className={`w-3 h-3 rounded-full ${item.ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
