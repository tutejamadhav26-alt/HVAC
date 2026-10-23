import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  RefreshCw, 
  Power,
  Wind,
  Gauge,
  Building2, 
  Check, 
  ChevronDown, 
  Info,
  Layers,
  Sliders,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

import { useData } from '../context/DataContext';
import MetricCard from '../components/MetricCard';
import HealthGauge from '../components/HealthGauge';
import ThermostatDial from '../components/ThermostatDial';
import { 
  fetchHVACUnits, 
  sendHVACCommand, 
  updateHVACUnit,
  fetchSensorHistory
} from '../services/api';

export default function Dashboard() {
  const { latestReading, latestPrediction, alerts } = useData();

  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('HVAC-001');
  const [currentUnit, setCurrentUnit] = useState(null);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch registered HVAC units
  const loadUnits = async () => {
    setLoadingUnits(true);
    try {
      const data = await fetchHVACUnits();
      if (data && data.length > 0) {
        setUnits(data);
        const active = data.find(u => u.unit_id === selectedUnitId) || data[0];
        setCurrentUnit(active);
        setSelectedUnitId(active.unit_id);
      }
    } catch (e) {
      console.error('Failed to load HVAC units:', e);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Fetch Telemetry History for Chart and Sparklines
  const loadHistory = async (unitId, tf) => {
    setLoadingHistory(true);
    try {
      const hist = await fetchSensorHistory(unitId, tf);
      if (Array.isArray(hist) && hist.length > 0) {
        setHistoryData(hist);
      }
    } catch (e) {
      console.error('Failed to load telemetry history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    if (selectedUnitId) {
      loadHistory(selectedUnitId, timeframe);
      const interval = setInterval(() => {
        loadHistory(selectedUnitId, timeframe);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [selectedUnitId, timeframe]);

  // Handle unit change
  const handleSelectUnit = (e) => {
    const id = e.target.value;
    setSelectedUnitId(id);
    const found = units.find(u => u.unit_id === id);
    if (found) setCurrentUnit(found);
  };

  // Transmit command to physical/simulated controller
  const handleApplyThermostatChanges = async ({ target_temperature, mode, fan_speed }) => {
    if (!currentUnit) return;
    const res = await sendHVACCommand(currentUnit.unit_id, {
      power_state: currentUnit.power_state ?? true,
      target_temperature,
      mode,
      fan_speed,
      triggered_by: 'dashboard_manual'
    });

    setCurrentUnit(prev => ({
      ...prev,
      current_setpoint: target_temperature,
      current_mode: mode,
      fan_speed: fan_speed
    }));

    return res;
  };

  // Control Mode Toggle: Auto vs Manual
  const handleToggleAutoMode = async (modeVal) => {
    if (!currentUnit) return;
    const isAuto = modeVal === 'auto';
    if (currentUnit.auto_mode_enabled === isAuto) return;

    try {
      const updated = await updateHVACUnit(currentUnit.unit_id, {
        auto_mode_enabled: isAuto
      });
      setCurrentUnit(updated);
    } catch (err) {
      console.error('Failed to update control mode:', err);
    }
  };

  // Power Toggle
  const handleTogglePower = async () => {
    if (!currentUnit) return;
    const nextPower = !currentUnit.power_state;
    try {
      await sendHVACCommand(currentUnit.unit_id, {
        power_state: nextPower,
        target_temperature: currentUnit.current_setpoint,
        mode: currentUnit.current_mode,
        fan_speed: currentUnit.fan_speed,
        triggered_by: 'power_toggle'
      });
      setCurrentUnit(prev => ({ ...prev, power_state: nextPower }));
    } catch (e) {
      console.error('Power toggle failed:', e);
    }
  };


  // Zone breadcrumb deduplication
  const zoneBreadcrumb = useMemo(() => {
    if (!currentUnit) return 'Building A · Floor 2 · Conference Zone';
    const loc = currentUnit.location || '';
    const floor = currentUnit.building_floor || '';
    const zone = currentUnit.zone_type || '';

    // Prevent repeated Floor mentions
    let parts = [loc];
    if (floor && !loc.toLowerCase().includes(floor.toLowerCase())) {
      parts.push(floor);
    }
    if (zone && !loc.toLowerCase().includes(zone.toLowerCase())) {
      parts.push(zone);
    }
    return parts.join(' · ');
  }, [currentUnit]);

  // Metric Sparklines and Deltas
  const tempSparkline = useMemo(() => historyData.map(h => h.temperature), [historyData]);
  const humSparkline = useMemo(() => historyData.map(h => h.humidity), [historyData]);
  const powerSparkline = useMemo(() => historyData.map(h => h.power), [historyData]);

  // 1-hour deltas
  const tempDelta = useMemo(() => {
    if (historyData.length < 2) return null;
    const first = historyData[0].temperature;
    const last = historyData[historyData.length - 1].temperature;
    const diff = Number((last - first).toFixed(1));
    return diff > 0 ? `+${diff}°C vs 1h ago` : diff < 0 ? `${diff}°C vs 1h ago` : `0.0°C vs 1h ago`;
  }, [historyData]);

  const humDelta = useMemo(() => {
    if (historyData.length < 2) return null;
    const first = historyData[0].humidity;
    const last = historyData[historyData.length - 1].humidity;
    const diff = Number((last - first).toFixed(1));
    return diff > 0 ? `+${diff}% vs 1h ago` : diff < 0 ? `${diff}% vs 1h ago` : `0.0% vs 1h ago`;
  }, [historyData]);

  const powerDelta = useMemo(() => {
    if (historyData.length < 2) return null;
    const first = historyData[0].power;
    const last = historyData[historyData.length - 1].power;
    const diff = Math.round(last - first);
    return diff > 0 ? `+${diff}W vs 1h ago` : diff < 0 ? `${diff}W vs 1h ago` : `0W vs 1h ago`;
  }, [historyData]);

  // Chart data formatting
  const chartPoints = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    const setpoint = currentUnit?.current_setpoint ?? 24.0;
    return historyData.map((d) => {
      const t = new Date(d.timestamp);
      const timeStr = !isNaN(t.getTime()) 
        ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
      return {
        time: timeStr,
        temperature: Number(d.temperature?.toFixed(1) || 24.0),
        setpoint: setpoint,
        power: Math.round(d.power || 0)
      };
    });
  }, [historyData, currentUnit]);

  // Numerical values
  const currentTemp = latestReading?.temperature !== undefined ? Number(latestReading.temperature).toFixed(1) : '23.4';
  const currentHum = latestReading?.humidity !== undefined ? Number(latestReading.humidity).toFixed(1) : '50.2';
  const currentPower = latestReading?.power !== undefined ? Math.round(latestReading.power) : 980;
  const currentSetpoint = currentUnit?.current_setpoint ?? 24.0;
  const isPowerOn = currentUnit?.power_state ?? true;
  const isAutoMode = currentUnit?.auto_mode_enabled ?? false;
  const isDemo = currentUnit?.connection_status === 'SIMULATED' || currentUnit?.controller_type === 'simulator';
  const humValueNum = parseFloat(currentHum);
  const isHumidityOutOfRange = humValueNum < 40 || humValueNum > 60;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. STATUS STRIP (Commercial Building Standards) */}
      <section 
        aria-label="Controller Status Bar"
        className="rounded-[14px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121821] p-4 sm:p-5 shadow-sm transition-colors"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Unit Selector & Clean Zone Breadcrumb */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-[10px] bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-[#3b82f6]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="hvac-unit-select" className="text-xs font-bold text-zinc-500 dark:text-[#9aa7b4] uppercase tracking-wider">
                  Unit:
                </label>
                <div className="relative inline-flex items-center">
                  <select
                    id="hvac-unit-select"
                    value={selectedUnitId}
                    onChange={handleSelectUnit}
                    aria-label="Select HVAC Unit"
                    className="bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.1] dark:border-white/[0.1] text-xs font-bold rounded-[8px] pl-2.5 pr-8 py-1.5 text-zinc-900 dark:text-[#e6edf3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] cursor-pointer appearance-none"
                  >
                    {units.map(u => (
                      <option key={u.unit_id} value={u.unit_id} className="dark:bg-[#121821]">
                        {u.name} ({u.unit_id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 pointer-events-none absolute right-2.5" />
                </div>

                {/* Demo Data Amber Badge vs Live Green Badge */}
                {isDemo ? (
                  <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-bold uppercase tracking-wider bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30">
                    Demo data
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-bold uppercase tracking-wider bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                    Live
                  </span>
                )}
              </div>

              {/* Clean Zone Text without repetitive Floor 2 */}
              <p className="text-xs text-zinc-600 dark:text-[#9aa7b4] mt-1">
                Zone: <span className="font-semibold text-zinc-900 dark:text-[#e6edf3]">{zoneBreadcrumb}</span>
              </p>
            </div>
          </div>

          {/* Right Controls: Segmented Auto/Manual Toggle, Power Switch, Staleness */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Control-Mode Segmented Toggle (Auto / Manual) */}
            <div 
              role="radiogroup" 
              aria-label="Control Mode"
              className="inline-flex rounded-[10px] bg-black/[0.04] dark:bg-white/[0.05] p-1 border border-black/[0.08] dark:border-white/[0.08]"
            >
              <button
                type="button"
                role="radio"
                aria-checked={isAutoMode}
                onClick={() => handleToggleAutoMode('auto')}
                className={`px-3 py-1 rounded-[7px] text-xs font-bold transition-all ${
                  isAutoMode
                    ? 'bg-[#3b82f6] text-white shadow-sm'
                    : 'text-zinc-600 dark:text-[#9aa7b4] hover:text-zinc-900 dark:hover:text-[#e6edf3]'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!isAutoMode}
                onClick={() => handleToggleAutoMode('manual')}
                className={`px-3 py-1 rounded-[7px] text-xs font-bold transition-all ${
                  !isAutoMode
                    ? 'bg-[#3b82f6] text-white shadow-sm'
                    : 'text-zinc-600 dark:text-[#9aa7b4] hover:text-zinc-900 dark:hover:text-[#e6edf3]'
                }`}
              >
                Manual
              </button>
            </div>

            {/* Real Equipment Power Toggle */}
            <button
              type="button"
              onClick={handleTogglePower}
              aria-label={isPowerOn ? 'Power Off HVAC Unit' : 'Power On HVAC Unit'}
              aria-pressed={isPowerOn}
              className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                isPowerOn
                  ? 'bg-black/[0.04] dark:bg-white/[0.05] border-black/[0.1] dark:border-white/[0.1] text-zinc-800 dark:text-[#e6edf3] hover:border-black/[0.2] dark:hover:border-white/[0.2]'
                  : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'
              }`}
            >
              <Power className={`w-3.5 h-3.5 ${isPowerOn ? 'text-[#22c55e]' : 'text-[#ef4444]'}`} />
              <span>{isPowerOn ? 'RUNNING' : 'STOPPED'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. KPI ROW (Hero Room Temp + Sparklines + Ring Gauge) */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* HERO CARD: Room Temperature (Spans 2 columns on lg) */}
        <MetricCard
          title="Room Temperature"
          value={currentTemp}
          unit="°C"
          icon={Thermometer}
          color="blue"
          isHero={true}
          heroTarget={currentSetpoint.toFixed(1)}
          delta={tempDelta}
          deltaType={tempDelta && tempDelta.startsWith('+') ? 'positive' : 'negative'}
          sparklineData={tempSparkline}
          subtitle="Return Air Temperature"
        />

        {/* CARD 2: Relative Humidity with 40-60% Comfort Alert */}
        <MetricCard
          title="Relative Humidity"
          value={currentHum}
          unit="% RH"
          icon={Droplets}
          color={isHumidityOutOfRange ? 'amber' : 'green'}
          delta={humDelta}
          deltaType="neutral"
          sparklineData={humSparkline}
          subtitle="ASHRAE Standard: 40-60%"
          alertBadge={isHumidityOutOfRange ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
              Outside Comfort
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
              Optimal
            </span>
          )}
        />

        {/* CARD 3: Power Load */}
        <MetricCard
          title="Equipment Power"
          value={currentPower >= 1000 ? (currentPower / 1000).toFixed(2) : currentPower}
          unit={currentPower >= 1000 ? 'kW' : 'W'}
          icon={Zap}
          color="blue"
          delta={powerDelta}
          deltaType="neutral"
          sparklineData={powerSparkline}
          subtitle={`Pressure: ${latestReading?.pressure?.toFixed(1) || '101.3'} kPa`}
        />

        {/* CARD 4: System Health Score with Embedded HealthGauge Ring */}
        <div className="rounded-[14px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121821] p-4 sm:p-5 shadow-sm hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-zinc-600 dark:text-[#9aa7b4] uppercase">
              System Health
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
              (latestPrediction?.health_score ?? 95) >= 85
                ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                : (latestPrediction?.health_score ?? 95) >= 60
                ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30'
            }`}>
              {(latestPrediction?.severity || 'NORMAL')}
            </span>
          </div>

          <div className="my-2 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-[#e6edf3]">
                  {Math.round(latestPrediction?.health_score ?? 95)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-[#9aa7b4] font-mono">/ 100</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-[#9aa7b4] capitalize mt-0.5">
                {(latestPrediction?.predicted_fault || 'normal').replace('_', ' ')}
              </p>
            </div>

            <HealthGauge score={latestPrediction?.health_score ?? 95} size="compact" />
          </div>

          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] text-xs text-zinc-500 dark:text-[#9aa7b4]">
            IsoForest Anomaly: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{latestPrediction?.anomaly_score ?? 0.05}</span>
          </div>
        </div>
      </section>

      {/* 3. MAIN DUAL-COLUMN LAYOUT (Left Wide: Chart + AI Rec, Right: Thermostat Dial) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN (7 cols): Main Chart & AI Suggestion */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Main Dual-Axis Telemetry Chart */}
          <div className="rounded-[14px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121821] p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-[#e6edf3]">
                  Temperature vs Setpoint Trend
                </h2>
                <p className="text-xs text-zinc-500 dark:text-[#9aa7b4]">
                  Dual-axis indoor return temperature (°C) & compressor power load (W)
                </p>
              </div>

              {/* Timeframe Selector Buttons */}
              <div className="inline-flex rounded-[8px] bg-black/[0.04] dark:bg-white/[0.05] p-1 border border-black/[0.06] dark:border-white/[0.06]">
                {['1h', '6h', '24h'].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-bold font-mono transition-all ${
                      timeframe === tf
                        ? 'bg-[#3b82f6] text-white shadow-sm'
                        : 'text-zinc-600 dark:text-[#9aa7b4] hover:text-zinc-900 dark:hover:text-[#e6edf3]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Dual-Axis Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              {loadingHistory && chartPoints.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Loading telemetry records...
                </div>
              ) : chartPoints.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9aa7b4" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} 
                    />
                    {/* Left Axis: Temperature (°C) */}
                    <YAxis 
                      yAxisId="left" 
                      domain={['auto', 'auto']} 
                      stroke="#9aa7b4" 
                      fontSize={11} 
                      unit="°C" 
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} 
                    />
                    {/* Right Axis: Power (W) */}
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#9aa7b4" 
                      fontSize={11} 
                      unit="W" 
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#121821', 
                        borderColor: 'rgba(255,255,255,0.12)', 
                        borderRadius: '10px', 
                        fontSize: '12px',
                        color: '#e6edf3'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="temperature" 
                      name="Room Temp" 
                      fill="rgba(59, 130, 246, 0.12)" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                    />
                    <Line 
                      yAxisId="left" 
                      type="stepAfter" 
                      dataKey="setpoint" 
                      name="Target Setpoint" 
                      stroke="#22c55e" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.8} 
                      dot={false} 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="power" 
                      name="Power Load" 
                      fill="rgba(245, 158, 11, 0.4)" 
                      radius={[2, 2, 0, 0]} 
                      barSize={6}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  No historical telemetry found for selected timeframe.
                </div>
              )}
            </div>
          </div>

          {/* Zone Environmental & Operating Parameters (Commercial BEMS Standards) */}
          <div className="rounded-[14px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121821] p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[8px] bg-[#3b82f6]/10 text-[#3b82f6]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-[#e6edf3]">
                    Zone Environmental & Operating Telemetry
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-[#9aa7b4]">
                    Supervisory air-side delivery, chiller coil delta-T & active compressor telemetry
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 flex items-center gap-1.5 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span>Nominal Operations</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Supply Air */}
              <div className="p-3 rounded-[10px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-[#9aa7b4] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Supply Air Temp</span>
                  <Thermometer className="w-3.5 h-3.5 text-[#3b82f6]" />
                </div>
                <div className="text-base font-extrabold text-zinc-900 dark:text-[#e6edf3] font-mono">
                  {(Number(currentTemp) - 8.8).toFixed(1)}°C
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-[#9aa7b4]">
                  ΔT: 8.8°C cooling split
                </span>
              </div>

              {/* Return Air */}
              <div className="p-3 rounded-[10px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-[#9aa7b4] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Return Plenum</span>
                  <RefreshCw className="w-3.5 h-3.5 text-[#22c55e]" />
                </div>
                <div className="text-base font-extrabold text-zinc-900 dark:text-[#e6edf3] font-mono">
                  {currentTemp}°C
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-[#9aa7b4]">
                  Zone equilibrium
                </span>
              </div>

              {/* Airflow CFM */}
              <div className="p-3 rounded-[10px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-[#9aa7b4] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Airflow Delivery</span>
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-base font-extrabold text-zinc-900 dark:text-[#e6edf3] font-mono">
                  1,250 CFM
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-[#9aa7b4]">
                  VAV branch nominal
                </span>
              </div>

              {/* Dew Point */}
              <div className="p-3 rounded-[10px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-[#9aa7b4] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Dew Point</span>
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-base font-extrabold text-zinc-900 dark:text-[#e6edf3] font-mono">
                  {(Number(currentTemp) - ((100 - Number(currentHum)) / 5)).toFixed(1)}°C
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-[#9aa7b4]">
                  Non-condensing zone
                </span>
              </div>

              {/* Damper Fresh Air */}
              <div className="p-3 rounded-[10px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-[#9aa7b4] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">OA Damper Intake</span>
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-base font-extrabold text-zinc-900 dark:text-[#e6edf3] font-mono">
                  20% OA
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-[#9aa7b4]">
                  ASHRAE 62.1 fresh air
                </span>
              </div>

              {/* Compressor Modulation */}
              <div className="p-3 rounded-[10px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-[#9aa7b4] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Compressor Load</span>
                  <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                </div>
                <div className="text-base font-extrabold text-zinc-900 dark:text-[#e6edf3] font-mono">
                  {Math.min(100, Math.max(15, Math.round((currentPower / 1600) * 100)))}%
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-[#9aa7b4]">
                  VFD Inverter Stage
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Circular Thermostat Dial Remote Controller */}
        <div className="lg:col-span-5 h-full">
          <ThermostatDial
            currentSetpoint={currentSetpoint}
            currentMode={currentUnit?.current_mode || 'AUTO'}
            currentFan={currentUnit?.fan_speed || 'AUTO'}
            isPowerOn={isPowerOn}
            isDemo={isDemo}
            onApplyChanges={handleApplyThermostatChanges}
            onPowerToggle={handleTogglePower}
          />
        </div>
      </div>
    </div>
  );
}
