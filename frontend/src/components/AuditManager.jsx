import React, { useState, useEffect } from 'react';
import { 
  fetchLatestAudit, 
  createAudit, 
  fetchAuditList,
  fetchAuditById
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileCheck, 
  Award, 
  TrendingDown, 
  Zap, 
  Leaf, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  RefreshCw, 
  PlusCircle, 
  ChevronRight,
  ShieldCheck,
  Building,
  DollarSign,
  Activity,
  Layers,
  X
} from 'lucide-react';

export default function AuditManager({ unitId = 'HVAC-001' }) {
  const { user } = useAuth();
  const [currentAudit, setCurrentAudit] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'history'

  // Form State
  const [formData, setFormData] = useState({
    unit_id: unitId,
    facility_name: 'AirconIQ Cyber Park - Commercial Facility',
    auditor_name: user?.full_name || 'ESG Energy Auditor',
    auditor_email: user?.email || 'auditor@airconiq.ai',
    audit_type: 'ASHRAE Level 2 Detailed Thermodynamic & ESG Audit',
    electricity_tariff: 8.50,
    currency: 'INR'
  });

  const loadLatest = async () => {
    try {
      setLoading(true);
      const data = await fetchLatestAudit(unitId);
      if (data) setCurrentAudit(data);
      const hist = await fetchAuditList(10);
      if (hist) setAuditHistory(hist);
    } catch (err) {
      console.error('Failed to load audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
  }, [unitId]);

  const handleGenerateAudit = async (e) => {
    if (e) e.preventDefault();
    try {
      setGenerating(true);
      const payload = {
        ...formData,
        unit_id: formData.unit_id || unitId,
        electricity_tariff: parseFloat(formData.electricity_tariff) || 8.50
      };
      const res = await createAudit(payload);
      if (res) {
        setCurrentAudit(res);
        setShowCreateModal(false);
        setActiveTab('report');
        // Refresh list
        const hist = await fetchAuditList(10);
        if (hist) setAuditHistory(hist);
      }
    } catch (err) {
      alert(`Audit creation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectHistorical = async (auditId) => {
    try {
      setLoading(true);
      const data = await fetchAuditById(auditId);
      if (data) {
        setCurrentAudit(data);
        setActiveTab('report');
      }
    } catch (err) {
      console.error('Failed to load audit:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'B':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'C':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'D':
      case 'F':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getComplianceBadge = (status) => {
    if (status?.includes('COMPLIANT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> {status}
        </span>
      );
    }
    if (status?.includes('CONDITIONAL')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
        <AlertTriangle className="w-3.5 h-3.5" /> {status}
      </span>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              ASHRAE Standard 90.1 & ESG Energy Compliance
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Energy & HVAC Operational Audit Hub
          </h2>
          <p className="text-xs text-slate-400">
            Real-time thermodynamic validation, annual kWh waste quantification, and ESG carbon abatement auditing
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'report' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Certificate
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'history' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Archive ({auditHistory.length})
            </button>
          </div>

          {/* Trigger Create Audit Modal */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Create Audit
          </button>

          {/* Print Certificate */}
          <button
            onClick={() => window.print()}
            title="Print Official Certificate"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && !currentAudit && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-sm font-medium">Running psychrometric calculations and fetching latest audit...</span>
        </div>
      )}

      {/* TAB 1: CURRENT AUDIT REPORT */}
      {!loading && activeTab === 'report' && currentAudit && (
        <div className="mt-6 space-y-6 relative z-10 print:mt-0">
          
          {/* Certificate Header Banner */}
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-black ${getGradeColor(currentAudit.letter_grade)} shadow-inner`}>
                <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Grade</span>
                <span className="text-3xl leading-none font-black">{currentAudit.letter_grade}</span>
                <span className="text-[10px] mt-0.5 opacity-80">{currentAudit.score}/100</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-700 text-slate-300 font-mono text-xs font-bold">
                    {currentAudit.audit_id}
                  </span>
                  {getComplianceBadge(currentAudit.ashrae_compliance)}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(currentAudit.created_at).toLocaleDateString()} at {new Date(currentAudit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {currentAudit.audit_type}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> {currentAudit.facility_name} &bull; Unit: <span className="text-emerald-400 font-semibold">{currentAudit.unit_id}</span> &bull; Lead Auditor: <span className="text-slate-200 font-medium">{currentAudit.auditor_name}</span>
                </p>
              </div>
            </div>

            {/* Quick Action to Re-run */}
            <div className="flex items-center gap-3">
              <button
                onClick={loadLatest}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
              </button>
            </div>
          </div>

          {/* 4 Core Pillars KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Thermodynamic COP & EER */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Thermodynamic COP</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{currentAudit.cop_measured}</span>
                <span className="text-xs text-slate-400">COP (vs 3.20 std)</span>
              </div>
              <div className="mt-2 text-xs text-emerald-400/90 font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>EER: {currentAudit.eer_measured} BTU/Wh</span>
              </div>
            </div>

            {/* KPI 2: Annual Energy Waste */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Annual Energy Waste</span>
                <TrendingDown className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400">
                  {currentAudit.annual_kwh_wasted?.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">kWh / yr</span>
              </div>
              <div className="mt-2 text-xs text-slate-400 font-medium">
                Baseline: {currentAudit.annual_kwh_baseline?.toLocaleString()} kWh
              </div>
            </div>

            {/* KPI 3: Recoverable Cost Savings */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Recoverable Savings</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-emerald-400">{currentAudit.currency_symbol}</span>
                <span className="text-3xl font-black text-emerald-400">
                  {currentAudit.annual_cost_savings?.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">/ yr</span>
              </div>
              <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Payback: 0 months (Optimized setpoint)</span>
              </div>
            </div>

            {/* KPI 4: ESG Carbon Abatement */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Carbon Abatement</span>
                <Leaf className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-400">
                  {currentAudit.carbon_abatement_mt}
                </span>
                <span className="text-xs text-slate-400">tCO2e / yr</span>
              </div>
              <div className="mt-2 text-xs text-teal-300 font-medium">
                🌲 {currentAudit.trees_offset_equivalent} Tree Equivalents
              </div>
            </div>

          </div>

          {/* Executive Audit Summary */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> Executive Auditor Summary
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {currentAudit.summary}
            </p>

            {/* Deductions / Findings if any */}
            {currentAudit.detailed_metrics?.deductions_applied?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700/60">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Score Adjustment & Penalty Findings:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentAudit.detailed_metrics.deductions_applied.map((d, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
                    >
                      &bull; {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Psychrometric & Refrigeration Cycle Diagnostics Details */}
          {currentAudit.detailed_metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box 1: Psychrometric Load Verification */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" /> Psychrometric Air Diagnostics
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block">Indoor Air Temp</span>
                    <span className="text-white font-bold text-sm">
                      {currentAudit.detailed_metrics.thermodynamics?.indoor_temp_c}°C
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block">Relative Humidity</span>
                    <span className="text-white font-bold text-sm">
                      {currentAudit.detailed_metrics.thermodynamics?.humidity_pct}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block">Calculated Dew Point</span>
                    <span className="text-white font-bold text-sm">
                      {currentAudit.detailed_metrics.thermodynamics?.dew_point_c}°C
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block">Moist Air Enthalpy</span>
                    <span className="text-white font-bold text-sm">
                      {currentAudit.detailed_metrics.thermodynamics?.enthalpy_kj_kg} kJ/kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: Refrigeration Cycle Health */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Refrigeration Circuit Health
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block">Evaporator Superheat</span>
                    <span className="text-white font-bold text-sm">
                      {currentAudit.detailed_metrics.refrigeration_cycle?.superheat_c}°C
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block">Condenser Subcooling</span>
                    <span className="text-white font-bold text-sm">
                      {currentAudit.detailed_metrics.refrigeration_cycle?.subcooling_c}°C
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block">Compressor Load (RLA)</span>
                    <span className="text-white font-bold text-sm">
                      {currentAudit.detailed_metrics.refrigeration_cycle?.rla_pct}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block">Compression Ratio</span>
                    <span className="text-white font-bold text-sm">
                      {currentAudit.detailed_metrics.refrigeration_cycle?.compression_ratio}:1
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Actionable Prioritized Retrofit & Remediation Roadmap */}
          {currentAudit.recommendations?.length > 0 && (
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Prioritized Retrofit & Energy Conservation Measures (ECMs)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Calculated ROI and implementation roadmap ranked by financial and thermodynamic impact
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {currentAudit.recommendations.map((rec, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rec.priority === 'Immediate' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : rec.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {rec.category}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-white">{rec.title}</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 text-right">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. CapEx</span>
                        <span className="text-xs font-bold text-slate-200">
                          {rec.estimated_capex === 0 ? '₹0 (Software)' : `${currentAudit.currency_symbol}${rec.estimated_capex?.toLocaleString()}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Savings</span>
                        <span className="text-xs font-bold text-emerald-400">
                          +{currentAudit.currency_symbol}{rec.annual_savings?.toLocaleString()}/yr
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Payback</span>
                        <span className="text-xs font-bold text-teal-300">
                          {rec.payback_months === 0 ? 'Immediate' : `${rec.payback_months} mo`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Auditor Certification Sign-off Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Certified under ASHRAE Guideline 14 & ISO 50001 Energy Management</span>
            </div>
            <div>
              Auditor Signature: <span className="text-slate-200 font-mono font-semibold">{currentAudit.auditor_email}</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AUDIT ARCHIVE LIST */}
      {!loading && activeTab === 'history' && (
        <div className="mt-6 space-y-3 relative z-10">
          <div className="text-xs text-slate-400 mb-2">
            Historical Energy & Operational Audits conducted on this facility
          </div>
          {auditHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No previous audit records archived yet. Click "Create Audit" above.
            </div>
          ) : (
            <div className="space-y-2">
              {auditHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectHistorical(item.audit_id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                    currentAudit?.audit_id === item.audit_id
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-md'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black ${getGradeColor(item.letter_grade)}`}>
                      <span className="text-lg leading-none">{item.letter_grade}</span>
                      <span className="text-[9px] opacity-80">{item.score}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{item.audit_id}</span>
                        {getComplianceBadge(item.ashrae_compliance)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.unit_id} &bull; {new Date(item.created_at).toLocaleDateString()} &bull; Lead: {item.auditor_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden sm:block">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Savings</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {item.currency_symbol}{item.annual_cost_savings?.toLocaleString()}/yr
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">CO2 Offset</span>
                      <span className="text-xs font-bold text-teal-400">
                        {item.carbon_abatement_mt} tCO2e
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE AUDIT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Execute Operational Energy Audit</h3>
                  <p className="text-xs text-slate-400">Configure parameters for ASHRAE 90.1 compliance analysis</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGenerateAudit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target HVAC Unit</label>
                <select
                  value={formData.unit_id}
                  onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="HVAC-001">HVAC-001 (Main AHU - Commercial Floor 2)</option>
                  <option value="HVAC-002">HVAC-002 (Software Engineering Wing)</option>
                  <option value="HVAC-003">HVAC-003 (Executive Boardroom)</option>
                  <option value="HVAC-004">HVAC-004 (Data & Telecom Center)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Facility / Building Name</label>
                <input
                  type="text"
                  value={formData.facility_name}
                  onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Auditor Name</label>
                  <input
                    type="text"
                    value={formData.auditor_name}
                    onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Auditor Email</label>
                  <input
                    type="email"
                    value={formData.auditor_email}
                    onChange={(e) => setFormData({ ...formData, auditor_email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Protocol</label>
                <select
                  value={formData.audit_type}
                  onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ASHRAE Level 2 Detailed Thermodynamic & ESG Audit">
                    ASHRAE Level 2 Detailed Thermodynamic & ESG Audit
                  </option>
                  <option value="ASHRAE Level 1 Preliminary Walkthrough Audit">
                    ASHRAE Level 1 Preliminary Walkthrough Audit
                  </option>
                  <option value="ISO 50001 Energy Management & Carbon Accounting Audit">
                    ISO 50001 Energy Management & Carbon Accounting Audit
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Electricity Tariff (/kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.electricity_tariff}
                    onChange={(e) => setFormData({ ...formData, electricity_tariff: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Computing Thermodynamic Audit...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      Execute Audit & Generate Certificate
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
