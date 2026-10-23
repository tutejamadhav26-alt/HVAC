import React, { useEffect, useState } from 'react';
import { fetchEnergySummary } from '../services/api';
import MetricCard from '../components/MetricCard';
import AuditManager from '../components/AuditManager';
import CommercialROIWidget from '../components/CommercialROIWidget';
import { Zap, Calendar, TrendingUp, Cpu, Gauge, FileCheck } from 'lucide-react';

export default function EnergyMonitoring() {
  const [selectedUnit, setSelectedUnit] = useState('HVAC-001');
  const [energyData, setEnergyData] = useState({
    current_power_w: 1050.0,
    energy_today_kwh: 14.5,
    energy_week_kwh: 102.3,
    avg_power_w: 1100.0,
    peak_power_w: 2400.0,
    recommendation: 'Loading energy baseline statistics...'
  });

  useEffect(() => {
    async function loadEnergy() {
      try {
        const res = await fetchEnergySummary(selectedUnit);
        if (res) setEnergyData(res);
      } catch (e) {
        console.error('[-] Error fetching energy summary:', e);
      }
    }
    loadEnergy();
    const interval = setInterval(loadEnergy, 5000);
    return () => clearInterval(interval);
  }, [selectedUnit]);

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-emerald-400" />
            Energy, Sustainability & ESG Audit Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time power monitoring, ASHRAE 90.1 energy auditing, and enterprise carbon offsets
          </p>
        </div>

        {/* HVAC Unit Selector */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
          <span className="text-xs font-semibold text-slate-400 pl-2">Active Unit:</span>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="HVAC-001">HVAC-001 (Commercial AHU)</option>
            <option value="HVAC-002">HVAC-002 (Software Wing)</option>
            <option value="HVAC-003">HVAC-003 (Boardroom)</option>
            <option value="HVAC-004">HVAC-004 (Data Room)</option>
          </select>
        </div>
      </div>

      {/* Real-time Electrical KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Current Power" value={energyData.current_power_w} unit="W" icon={Zap} color="red" />
        <MetricCard title="Energy Today" value={energyData.energy_today_kwh} unit="kWh" icon={Calendar} color="emerald" />
        <MetricCard title="Energy This Week" value={energyData.energy_week_kwh} unit="kWh" icon={TrendingUp} color="green" />
        <MetricCard title="Average Power" value={energyData.avg_power_w} unit="W" icon={Cpu} color="purple" />
        <MetricCard title="Peak Power" value={energyData.peak_power_w} unit="W" icon={Zap} color="yellow" />
      </div>

      {/* CORE AUDIT HUB COMPONENT */}
      <AuditManager unitId={selectedUnit} />

      {/* COMMERCIAL ROI & CARBON SAVINGS WIDGET */}
      <CommercialROIWidget unitId={selectedUnit} />

      {/* AI Energy Efficiency Recommendation Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">AI Continuous Energy Efficiency Recommendation</h3>
            <p className="text-xs text-slate-400">Dynamically evaluated against historical thermodynamic baseline models</p>
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {energyData.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
