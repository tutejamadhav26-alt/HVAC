import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, CheckCircle2, AlertOctagon, ShieldAlert, Cpu, 
  Thermometer, Droplets, Gauge, Zap, Users, Sun, Check, X, RefreshCw, 
  Info, ArrowRight, ShieldCheck, HelpCircle, Activity
} from 'lucide-react';
import { 
  fetchUnifiedRecommendation, 
  applyUnifiedRecommendation, 
  fetchHVACUnits 
} from '../services/api';

export default function AIPredictions() {
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('HVAC-001');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState(null);
  const [applying, setApplying] = useState(false);

  const loadRecommendation = async (unitId) => {
    setLoading(true);
    try {
      const rec = await fetchUnifiedRecommendation(unitId);
      setData(rec);
    } catch (e) {
      console.error('Error fetching recommendation:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const uList = await fetchHVACUnits();
        setUnits(uList);
        if (uList && uList.length > 0) {
          setSelectedUnitId(uList[0].unit_id);
          loadRecommendation(uList[0].unit_id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  const handleApply = async () => {
    if (!data?.setpoint_recommendation) return;
    setApplying(true);
    setActionStatus(null);
    try {
      const res = await applyUnifiedRecommendation(selectedUnitId, {
        target_temperature: data.setpoint_recommendation.target_temperature,
        mode: data.setpoint_recommendation.recommended_mode,
        fan_speed: data.setpoint_recommendation.fan_speed,
        triggered_by: 'manual_applied_ai'
      });
      setActionStatus({
        type: 'success',
        message: `Successfully applied recommendation: ${res.applied_setpoint}°C (${res.applied_mode} mode)`
      });
      await loadRecommendation(selectedUnitId);
    } catch (err) {
      setActionStatus({
        type: 'error',
        message: err.message || 'Failed to apply recommendation.'
      });
    } finally {
      setApplying(false);
    }
  };

  const handleReject = () => {
    setActionStatus({
      type: 'info',
      message: 'Recommendation dismissed. Current HVAC setpoint retained.'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-500" />
            AI Recommendations & Model Diagnostics
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time ML fault diagnostics paired with transparent ASHRAE-55 thermal comfort & setpoint optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-xs font-bold text-zinc-500">Controller:</span>
            <select
              value={selectedUnitId}
              onChange={(e) => {
                setSelectedUnitId(e.target.value);
                loadRecommendation(e.target.value);
              }}
              className="bg-transparent text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
            >
              {units.map(u => (
                <option key={u.unit_id} value={u.unit_id} className="dark:bg-zinc-800">
                  {u.name} ({u.unit_id})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadRecommendation(selectedUnitId)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Status Notice */}
      {actionStatus && (
        <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
          actionStatus.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
            : actionStatus.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/40'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
        }`}>
          <span>{actionStatus.message}</span>
          <button onClick={() => setActionStatus(null)} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Core Setpoint Recommendation & Review Action Center */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Target Setpoint Advisory
            </span>
            <div className="flex items-baseline gap-4 mt-1">
              <div>
                <span className="text-xs text-zinc-400 block">Current Setpoint</span>
                <span className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                  {data?.current_conditions?.current_setpoint ?? 24.0}°C
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-700 self-center" />
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Recommended</span>
                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100">
                  {data?.setpoint_recommendation?.target_temperature ?? 24.0}°C
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 self-center">
                Mode: {data?.setpoint_recommendation?.recommended_mode} • Fan: {data?.setpoint_recommendation?.fan_speed}
              </span>
            </div>
          </div>

          {/* Action Center: Apply or Reject */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Reject / Keep Current
            </button>
            <button
              onClick={handleApply}
              disabled={applying || data?.recommendation_status === 'already_optimal'}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                data?.recommendation_status === 'already_optimal'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {data?.recommendation_status === 'already_optimal'
                  ? 'Setpoint Already Optimal'
                  : 'Review & Apply Recommendation'}
              </span>
            </button>
          </div>
        </div>

        {/* Advisory Rationale */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Optimization Rationale:</span>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
            {data?.setpoint_recommendation?.rationale}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Projected Savings</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ~{data?.setpoint_recommendation?.energy_saving_pct}% Power Cut
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Dew Point</span>
              <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {data?.setpoint_recommendation?.dew_point_c}°C
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Safety Setpoint Bounds</span>
              <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {data?.setpoint_recommendation?.limits?.min}°C — {data?.setpoint_recommendation?.limits?.max}°C
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Recommendation Status</span>
              <p className="font-bold capitalize text-zinc-800 dark:text-zinc-200 mt-0.5">
                {data?.recommendation_status?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Genuine Preserved ML Model Diagnostic Card */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Preserved ML Diagnostic Model Outputs
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Outputs generated by the existing trained RandomForestClassifier & IsolationForest model artifacts.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            Artifacts: fault_classifier.joblib • isolation_forest.joblib
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Predicted Machine Fault</span>
            <p className={`text-base font-black uppercase mt-1 ${
              data?.ml_model_diagnosis?.predicted_fault === 'normal'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {data?.ml_model_diagnosis?.predicted_fault?.replace('_', ' ')}
            </p>
            <span className="text-[10px] text-zinc-400">Multi-class classification</span>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Model Confidence</span>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {data?.ml_model_diagnosis?.confidence}%
            </p>
            <span className="text-[10px] text-zinc-400">Softmax class probability</span>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Anomaly Score</span>
            <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-1">
              {data?.ml_model_diagnosis?.anomaly_score}
            </p>
            <span className="text-[10px] text-zinc-400">Isolation Forest decision margin</span>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Power Load Forecast</span>
            <p className="text-base font-black text-blue-600 dark:text-blue-400 mt-1">
              {data?.ml_model_diagnosis?.predicted_power_next_w} W
            </p>
            <span className="text-[10px] text-zinc-400">Future horizon power load</span>
          </div>
        </div>

        {/* Input Data Used Table (Mandated by Prompt) */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Exact Input Feature Telemetry Fed to Model:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {(data?.ml_model_diagnosis?.input_features_used || []).map((feat, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center">
                <span className="text-[10px] font-mono text-zinc-500 block capitalize">{feat.name.replace('_', ' ')}</span>
                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{feat.value}</span>
                <span className="text-[10px] text-zinc-400 ml-0.5">{feat.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Transparent Technical Explanation & Strategy Distinction */}
      <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2.5">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
          <Info className="w-4 h-4" />
          <span>Model Architecture & Recommendation Strategy Distinction (Audit Transparency)</span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {data?.strategy_distinction?.note}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <strong className="text-zinc-800 dark:text-zinc-200 block mb-1">Preserved ML Model Scope:</strong>
            <span className="text-zinc-600 dark:text-zinc-400">{data?.strategy_distinction?.ml_model_scope}</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <strong className="text-zinc-800 dark:text-zinc-200 block mb-1">Setpoint Strategy Scope:</strong>
            <span className="text-zinc-600 dark:text-zinc-400">{data?.strategy_distinction?.setpoint_strategy_scope}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
