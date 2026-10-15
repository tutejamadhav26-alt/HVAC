import React, { useState, useEffect } from 'react';
import { fetchRemoteRecommendation, applyRemoteCommand } from '../services/api';

const BRANDS = [
  'Daikin', 'Carrier', 'Panasonic', 'Toshiba', 'Mitsubishi Electric',
  'LG Commercial', 'Voltas', 'Hitachi', 'Blue Star', 'Trane'
];

const MODES = [
  { id: 'COOL', label: 'Cool', color: 'bg-blue-600 !text-white border-blue-500 shadow-md font-bold' },
  { id: 'AUTO', label: 'Auto AI', color: 'bg-emerald-600 !text-white border-emerald-500 shadow-md font-bold' },
  { id: 'DRY', label: 'Dry (Dehum)', color: 'bg-teal-600 !text-white border-teal-500 shadow-md font-bold' },
  { id: 'FAN', label: 'Fan Only', color: 'bg-indigo-600 !text-white border-indigo-500 shadow-md font-bold' },
  { id: 'TURBO', label: 'Turbo Max', color: 'bg-red-600 !text-white border-red-500 shadow-md font-bold' },
  { id: 'ECO', label: 'Eco Saver', color: 'bg-green-600 !text-white border-green-500 shadow-md font-bold' }
];

export default function UniversalRemoteWidget({ unitId = 'HVAC-001', sensorData, onCommandApplied }) {
  const [selectedBrand, setSelectedBrand] = useState('Daikin');
  const [recommendation, setRecommendation] = useState(null);
  const [targetTemp, setTargetTemp] = useState(24.0);
  const [selectedMode, setSelectedMode] = useState('AUTO');
  const [fanSpeed, setFanSpeed] = useState('AUTO');
  const [isApplying, setIsApplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadRecommendation = async () => {
    try {
      const data = await fetchRemoteRecommendation(unitId, selectedBrand);
      if (data) {
        setRecommendation(data);
        const temp = Number(data.target_temperature ?? data.recommended_temperature ?? 24.0);
        setTargetTemp(!isNaN(temp) ? temp : 24.0);
        setSelectedMode(data.recommended_mode || 'AUTO');
        setFanSpeed(data.fan_speed || data.recommended_fan_speed || 'AUTO');
      }
    } catch (err) {
      console.error('Failed to load remote recommendation:', err);
    }
  };

  useEffect(() => {
    loadRecommendation();
  }, [unitId, selectedBrand]);

  const handleApply = async () => {
    setIsApplying(true);
    setStatusMessage(null);
    try {
      const payload = {
        unit_id: unitId,
        brand: selectedBrand,
        mode: selectedMode,
        temperature: targetTemp,
        fan_speed: fanSpeed
      };
      const res = await applyRemoteCommand(payload);
      setStatusMessage({
        type: 'success',
        text: `Command sent to ${selectedBrand}: ${selectedMode} @ ${targetTemp}°C`
      });
      if (onCommandApplied) onCommandApplied(res);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to transmit IR/Modbus command.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const adjustTemp = (delta) => {
    setTargetTemp(prev => {
      const curr = typeof prev === 'number' && !isNaN(prev) ? prev : 24.0;
      return Math.min(30.0, Math.max(16.0, Math.round((curr + delta) * 2) / 2));
    });
  };

  const occupancy = Number(sensorData?.occupancy ?? recommendation?.occupancy ?? 0);
  const rawIndoor = Number(sensorData?.temperature ?? recommendation?.current_temp ?? 24.0);
  const indoorTemp = !isNaN(rawIndoor) ? rawIndoor : 24.0;
  
  const rawOutdoor = Number(sensorData?.outdoor_temp ?? recommendation?.outdoor_temp ?? 33.0);
  const outdoorTemp = !isNaN(rawOutdoor) ? rawOutdoor : 33.0;

  const safeTargetTemp = typeof targetTemp === 'number' && !isNaN(targetTemp) ? targetTemp : 24.0;
  const energySavingPct = Number(recommendation?.energy_saving_pct ?? recommendation?.energy_saving_potential_pct ?? 18.5);

  const irPayload = recommendation?.brand_command?.ir_hex 
    || recommendation?.ir_command_hex 
    || `${selectedBrand.toUpperCase()}_CMD_${selectedMode}_${safeTargetTemp}C_${fanSpeed}`;

  const modbusAddress = recommendation?.brand_command?.modbus_register 
    || recommendation?.modbus_register_address 
    || 'IR HEX / Modbus RTU';

  const rationaleText = recommendation?.rationale || recommendation?.reason;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Universal Remote & AI Mode Optimizer
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Universal thermodynamic setpoint & mode dispatcher across commercial HVAC brands
          </p>
        </div>

        {/* Brand Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-400">Brand Protocol:</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-800 text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
          >
            {BRANDS.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Occupancy & Outdoor Load Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Occupancy Count</div>
            <div className="text-xl font-bold text-white flex items-baseline gap-1.5 mt-0.5">
              {occupancy} <span className="text-xs font-normal text-slate-400">people</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            occupancy === 0 ? 'bg-slate-700 text-slate-300' :
            occupancy <= 6 ? 'bg-green-500/20 text-green-400' :
            occupancy <= 16 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {occupancy === 0 ? 'Vacant Zone' : occupancy <= 6 ? 'Low Load' : occupancy <= 16 ? 'Medium Load' : 'High Density'}
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Indoor / Outdoor Temp</div>
            <div className="text-xl font-bold text-cyan-400 flex items-baseline gap-1 mt-0.5">
              {indoorTemp.toFixed(1)}°C <span className="text-xs font-normal text-slate-400">/ {outdoorTemp.toFixed(1)}°C</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg">
            ΔT: {(outdoorTemp - indoorTemp).toFixed(1)}°C
          </span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Projected Energy Saving</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {energySavingPct.toFixed(1)}%
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            ASHRAE-55 Optimal
          </span>
        </div>
      </div>

      {/* Main Control Interface: Remote Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
        
        {/* Setpoint Temperature Controller (Left) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-xl border border-slate-800/80">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Target HVAC Setpoint
          </span>
          <div className="flex items-center gap-4 my-3">
            <button
              onClick={() => adjustTemp(-0.5)}
              className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xl flex items-center justify-center transition active:scale-95"
              title="Decrease 0.5°C"
            >
              −
            </button>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-white tracking-tight">
                {safeTargetTemp.toFixed(1)}
                <span className="text-2xl text-cyan-400 font-normal">°C</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                AI Suggestion: <strong className="text-emerald-400">{Number(recommendation?.target_temperature ?? recommendation?.recommended_temperature ?? 24.0).toFixed(1)}°C</strong>
              </div>
            </div>
            <button
              onClick={() => adjustTemp(0.5)}
              className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xl flex items-center justify-center transition active:scale-95"
              title="Increase 0.5°C"
            >
              +
            </button>
          </div>

          {/* Quick setpoint action badge */}
          <div className="text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 text-center">
            {safeTargetTemp > indoorTemp ? (
              <span className="text-amber-400 font-semibold">▲ Increase Setpoint (Conserve Energy)</span>
            ) : safeTargetTemp < indoorTemp ? (
              <span className="text-cyan-400 font-semibold">▼ Decrease Setpoint (Active Cooling)</span>
            ) : (
              <span className="text-emerald-400 font-semibold">✔ Equilibrium Reached</span>
            )}
          </div>
        </div>

        {/* Operating Modes & Fan Speed (Right) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Modes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Universal Operating Mode
              </span>
              {recommendation?.recommended_mode && (
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                  AI Recommends: {recommendation.recommended_mode}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(mode => {
                const isSelected = selectedMode === mode.id;
                const isRecommended = recommendation?.recommended_mode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center relative ${
                      isSelected
                        ? `${mode.color} border-current ring-2 ring-blue-500/30`
                        : 'bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {mode.label}
                    {isRecommended && (
                      <span className="absolute -top-1.5 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fan Speed */}
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
              Blower Fan Speed
            </span>
            <div className="flex items-center gap-2">
              {['AUTO', 'LOW', 'MED', 'HIGH', 'TURBO'].map(speed => (
                <button
                  key={speed}
                  onClick={() => setFanSpeed(speed)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                    fanSpeed === speed
                      ? 'bg-blue-600 !text-white border-blue-500 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* IR Protocol / Modbus Payload Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span className="text-slate-500 truncate mr-2">
              Payload: <span className="text-cyan-400">{irPayload}</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase bg-slate-800 px-2 py-0.5 rounded shrink-0">
              {modbusAddress}
            </span>
          </div>

        </div>
      </div>

      {/* AI Thermodynamic Explanation & Reasoning */}
      {rationaleText && (
        <div className="mt-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl p-3.5 flex items-start gap-3">
          <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div className="text-xs">
            <strong className="text-cyan-300 block mb-0.5">AI Thermodynamic Optimization Rationale:</strong>
            <p className="text-slate-300 leading-relaxed">{rationaleText}</p>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {statusMessage && (
        <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40' 
            : 'bg-red-950/30 text-red-300 border-red-500/40'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800/70">
        <button
          onClick={loadRecommendation}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync AI Recommendation
        </button>

        <button
          onClick={handleApply}
          disabled={isApplying}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isApplying ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Transmitting Command...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Apply to {selectedBrand} Unit
            </>
          )}
        </button>
      </div>

    </div>
  );
}
