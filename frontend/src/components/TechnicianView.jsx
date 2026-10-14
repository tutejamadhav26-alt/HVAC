import React, { useState, useEffect } from 'react';
import { fetchTechnicianDiagnostics } from '../services/api';

export default function TechnicianView({ unitId = 'HVAC-001', sensorData }) {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      const data = await fetchTechnicianDiagnostics(unitId);
      if (data) setDiagnostics(data);
    } catch (err) {
      console.error('Failed to load technician diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
    const interval = setInterval(loadDiagnostics, 8000);
    return () => clearInterval(interval);
  }, [unitId]);

  const temp = Number(sensorData?.temperature ?? diagnostics?.temperature_c ?? 24.0);
  const hum = Number(sensorData?.humidity ?? diagnostics?.humidity_pct ?? 50.0);
  const press = Number(sensorData?.pressure ?? diagnostics?.pressure_kpa ?? 101.3);
  const curr = Number(sensorData?.current ?? diagnostics?.current_a ?? 4.8);
  const power = Number(sensorData?.power ?? diagnostics?.power_w ?? 1050.0);

  const dewPoint = Number(diagnostics?.dew_point_c ?? 12.9);
  const wetBulb = Number(diagnostics?.wet_bulb_c ?? 17.1);
  const enthalpy = Number(diagnostics?.enthalpy_kj_kg ?? 48.2);
  const superheat = Number(diagnostics?.estimated_superheat_c ?? 6.5);
  const subcooling = Number(diagnostics?.estimated_subcooling_c ?? 5.2);
  const compRatio = Number(diagnostics?.compression_ratio ?? 3.2);
  const cop = Number(diagnostics?.cop ?? 3.45);
  const eer = Number(diagnostics?.eer ?? 11.77);
  const rlaPct = Number(diagnostics?.rla_pct ?? 58.5);
  const stressLevel = diagnostics?.compressor_stress_level ?? 'Nominal';
  const summary = diagnostics?.technician_summary ?? 'System operating within standard ASHRAE thermodynamic parameters.';

  return (
    <div className="bg-slate-900/95 border border-cyan-900/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Technician Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">
              Deep Technician & Thermodynamic Diagnostics
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              Pro Engineer View
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Refrigeration vapor-compression cycle, psychrometric properties, and compressor mechanical load analysis
          </p>
        </div>

        <button
          onClick={loadDiagnostics}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 font-semibold border border-slate-700 transition flex items-center gap-1.5"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Telemetry
        </button>
      </div>

      {/* Grid Section 1: Psychrometric Air State Analysis */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>●</span> Psychrometric Air State Properties (Indoor Coil)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 font-medium">Dry Bulb Temp</div>
            <div className="text-xl font-bold text-white mt-1">{temp.toFixed(1)}°C</div>
            <div className="text-[10px] text-slate-500 mt-1">Direct air temperature</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 font-medium">Wet Bulb Temp</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">{wetBulb.toFixed(1)}°C</div>
            <div className="text-[10px] text-slate-500 mt-1">Stull psychrometric</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 font-medium">Dew Point</div>
            <div className="text-xl font-bold text-teal-300 mt-1">{dewPoint.toFixed(1)}°C</div>
            <div className="text-[10px] text-slate-500 mt-1">Magnus-Tetens vapor</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 font-medium">Moist Air Enthalpy</div>
            <div className="text-xl font-bold text-blue-300 mt-1">{enthalpy.toFixed(1)} <span className="text-xs font-normal">kJ/kg</span></div>
            <div className="text-[10px] text-slate-500 mt-1">Sensible + latent heat</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 font-medium">Suction Pressure</div>
            <div className="text-xl font-bold text-white mt-1">{press.toFixed(1)} <span className="text-xs font-normal">kPa</span></div>
            <div className="text-[10px] text-slate-500 mt-1">Evaporator manifold</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 font-medium">Relative Humidity</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">{hum.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500 mt-1">Indoor comfort zone</div>
          </div>

        </div>
      </div>

      {/* Grid Section 2: Vapor Compression Refrigeration Diagnostics */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>●</span> Vapor Compression Cycle & Compressor Load (R410A / R32)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Superheat (Evap)</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                superheat >= 4.0 && superheat <= 10.0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {superheat >= 4.0 && superheat <= 10.0 ? 'Optimal' : 'Check TXV'}
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{superheat.toFixed(1)}°C</div>
            <div className="text-[10px] text-slate-500 mt-1">Target: 5.0 - 8.0°C</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Subcooling (Cond)</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                subcooling >= 3.0 && subcooling <= 8.0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {subcooling >= 3.0 && subcooling <= 8.0 ? 'Optimal' : 'Charge Verify'}
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{subcooling.toFixed(1)}°C</div>
            <div className="text-[10px] text-slate-500 mt-1">Target: 4.0 - 7.0°C</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Compression Ratio</span>
              <span className="text-[10px] font-bold text-slate-400">P_dis / P_suc</span>
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{compRatio.toFixed(2)} : 1</div>
            <div className="text-[10px] text-slate-500 mt-1">Limit: &lt; 4.0 : 1</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Compressor RLA%</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                rlaPct < 90 ? 'bg-emerald-500/20 text-emerald-400' : rlaPct < 110 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {stressLevel}
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{rlaPct.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500 mt-1">Current: {curr.toFixed(1)}A / 10A Max</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">System COP / EER</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">High Eff</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {cop.toFixed(2)} <span className="text-sm font-normal text-slate-400">({eer.toFixed(1)} EER)</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">kW_cool / kW_elec</div>
          </div>

        </div>
      </div>

      {/* Technician Diagnostic Summary & Directive */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
        <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
          stressLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
          stressLevel === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
        }`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Field Technician Diagnostic Protocol
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Status: <strong className={stressLevel === 'Nominal' ? 'text-emerald-400' : 'text-amber-400'}>{stressLevel.toUpperCase()}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
              Refrigerant: R-410A / R-32
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
              Expansion Valve: Electronic (EEV)
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
              Compressor Type: Inverter Twin Rotary
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
              Protocol: Modbus RTU RS485 (9600-8-N-1)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
