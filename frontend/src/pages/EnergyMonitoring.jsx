import React, { useEffect, useState } from 'react';
import { fetchEnergySummary } from '../services/api';
import MetricCard from '../components/MetricCard';
import { Zap, Calendar, TrendingUp, Cpu, Sparkles } from 'lucide-react';

export default function EnergyMonitoring() {
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
        const res = await fetchEnergySummary();
        if (res) setEnergyData(res);
      } catch (e) {
        console.error('[-] Error fetching energy summary:', e);
      }
    }
    loadEnergy();
    const interval = setInterval(loadEnergy, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Energy & Power Consumption Analytics</h1>
        <p className="text-sm text-slate-400">Real-time load tracking, daily/weekly kWh calculations, and energy optimization tips</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Current Power" value={energyData.current_power_w} unit="W" icon={Zap} color="red" />
        <MetricCard title="Energy Today" value={energyData.energy_today_kwh} unit="kWh" icon={Calendar} color="blue" />
        <MetricCard title="Energy This Week" value={energyData.energy_week_kwh} unit="kWh" icon={TrendingUp} color="green" />
        <MetricCard title="Average Power" value={energyData.avg_power_w} unit="W" icon={Cpu} color="purple" />
        <MetricCard title="Peak Power" value={energyData.peak_power_w} unit="W" icon={Zap} color="yellow" />
      </div>

      {/* Real Energy Recommendation Box */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">AI Energy Efficiency Recommendation</h3>
            <p className="text-xs text-slate-400">Computed against historical baseline power consumption</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5">
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {energyData.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
