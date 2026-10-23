import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Snowflake, 
  RotateCw, 
  Droplets, 
  Fan, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle, 
  Power,
  BarChart2,
  Signal
} from 'lucide-react';

const MIN_TEMP = 16.0;
const MAX_TEMP = 30.0;
const STEP = 0.5;

export default function ThermostatDial({
  currentSetpoint = 24.0,
  currentMode = 'AUTO',
  currentFan = 'AUTO',
  isPowerOn = true,
  isDemo = true,
  onApplyChanges,
  onPowerToggle,
  pendingExternalTemp = null,
  pendingExternalMode = null,
  pendingExternalFan = null
}) {
  const [targetTemp, setTargetTemp] = useState(currentSetpoint);
  const [selectedMode, setSelectedMode] = useState(currentMode);
  const [selectedFan, setSelectedFan] = useState(currentFan);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const dialRef = useRef(null);

  // Sync state if currentSetpoint changes from backend and nothing is pending
  useEffect(() => {
    setTargetTemp(currentSetpoint);
    setSelectedMode(currentMode);
    setSelectedFan(currentFan);
  }, [currentSetpoint, currentMode, currentFan]);

  // If parent passes pending recommendation to fill (e.g. from "Apply suggestion" button)
  useEffect(() => {
    if (pendingExternalTemp !== null) {
      setTargetTemp(pendingExternalTemp);
    }
    if (pendingExternalMode !== null) {
      setSelectedMode(pendingExternalMode);
    }
    if (pendingExternalFan !== null) {
      setSelectedFan(pendingExternalFan);
    }
  }, [pendingExternalTemp, pendingExternalMode, pendingExternalFan]);

  // Check if anything has changed from current confirmed state
  const hasChanged = 
    Math.abs(targetTemp - currentSetpoint) >= 0.1 ||
    selectedMode !== currentMode ||
    selectedFan !== currentFan;

  // SVG Dial Calculations (240 degree arc from 150 deg to 390 deg)
  const size = 200;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth - 6;

  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  const tempToAngle = (t) => {
    const fraction = (t - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
    return startAngle + fraction * totalAngle;
  };

  const angleToTemp = (angle) => {
    let norm = (angle - startAngle) / totalAngle;
    norm = Math.max(0, Math.min(1, norm));
    const raw = MIN_TEMP + norm * (MAX_TEMP - MIN_TEMP);
    return Math.round(raw / STEP) * STEP;
  };

  const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, r, startA, endA) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const currentAngle = tempToAngle(targetTemp);
  const handlePos = polarToCartesian(center, center, radius, currentAngle);

  // Mouse / Touch Drag Interaction
  const handlePointerInteraction = useCallback((e) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left - center;
    const y = clientY - rect.top - center;

    let rad = Math.atan2(y, x);
    let deg = (rad * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    // Map to 135 -> 405 domain
    if (deg < 90) deg += 360;

    if (deg >= startAngle && deg <= endAngle) {
      const newTemp = angleToTemp(deg);
      setTargetTemp(Number(newTemp.toFixed(1)));
    }
  }, [center]);

  const onPointerDown = (e) => {
    handlePointerInteraction(e);
    const onPointerMove = (ev) => handlePointerInteraction(ev);
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      setTargetTemp(prev => Math.min(MAX_TEMP, Number((prev + STEP).toFixed(1))));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setTargetTemp(prev => Math.max(MIN_TEMP, Number((prev - STEP).toFixed(1))));
    }
  };

  // Stepper adjustments
  const incrementTemp = () => {
    setTargetTemp(prev => Math.min(MAX_TEMP, Number((prev + STEP).toFixed(1))));
  };

  const decrementTemp = () => {
    setTargetTemp(prev => Math.max(MIN_TEMP, Number((prev - STEP).toFixed(1))));
  };

  // Apply Changes Action
  const handleApply = async () => {
    if (!hasChanged || loading) return;
    setLoading(true);
    setToast(null);
    try {
      if (onApplyChanges) {
        await onApplyChanges({
          target_temperature: targetTemp,
          mode: selectedMode,
          fan_speed: selectedFan
        });
        setToast({
          type: 'success',
          text: `Applied: ${targetTemp}°C · ${selectedMode}`
        });
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to apply changes'
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { id: 'COOL', label: 'Cool', icon: Snowflake },
    { id: 'AUTO', label: 'Auto', icon: RotateCw },
    { id: 'DRY', label: 'Dry', icon: Droplets },
    { id: 'FAN', label: 'Fan', icon: Fan },
  ];

  const fanSpeeds = [
    { id: 'LOW', label: 'Low', bars: 1 },
    { id: 'MED', label: 'Med', bars: 2 },
    { id: 'HIGH', label: 'High', bars: 3 },
    { id: 'AUTO', label: 'Auto', bars: 0 },
  ];

  return (
    <div className="rounded-[14px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121821] p-5 shadow-sm flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-[#e6edf3]">
            Thermostat Control
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#9aa7b4]">
            Setpoint & environmental conditioning
          </p>
        </div>

        {isDemo && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            Commands are simulated
          </span>
        )}
      </div>

      {/* Thermostat Circular Dial */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div 
          ref={dialRef}
          onPointerDown={onPointerDown}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Thermostat setpoint target"
          aria-valuemin={MIN_TEMP}
          aria-valuemax={MAX_TEMP}
          aria-valuenow={targetTemp}
          className="relative select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-full p-2 touch-none"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background Track Arc */}
            <path
              d={describeArc(center, center, radius, startAngle, endAngle)}
              fill="none"
              stroke="currentColor"
              className="text-black/[0.08] dark:text-white/[0.08]"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Active Temperature Range Arc (Accent Blue) */}
            <path
              d={describeArc(center, center, radius, startAngle, currentAngle)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
            {/* Dial Knob / Handle */}
            <circle
              cx={handlePos.x}
              cy={handlePos.y}
              r={9}
              fill="#ffffff"
              stroke="#3b82f6"
              strokeWidth={3}
              className="shadow-md filter drop-shadow"
            />
          </svg>

          {/* Dial Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9aa7b4]">
              Target
            </span>
            <div className="flex items-baseline">
              <span className="text-4xl font-black text-zinc-900 dark:text-[#e6edf3] font-mono tracking-tight">
                {targetTemp.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-zinc-500 dark:text-[#9aa7b4] ml-1">
                °C
              </span>
            </div>
            <span className="text-xs font-semibold text-[#3b82f6] mt-0.5">
              {selectedMode} · {selectedFan}
            </span>
          </div>
        </div>

        {/* Stepper Buttons for precise touch / desktop click */}
        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            onClick={decrementTemp}
            disabled={targetTemp <= MIN_TEMP}
            className="w-8 h-8 rounded-[8px] bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-zinc-700 dark:text-[#e6edf3] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] disabled:opacity-40 transition"
            aria-label="Decrease temperature by 0.5 degrees"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-zinc-500 dark:text-[#9aa7b4]">
            Range: {MIN_TEMP}° – {MAX_TEMP}°C
          </span>
          <button
            type="button"
            onClick={incrementTemp}
            disabled={targetTemp >= MAX_TEMP}
            className="w-8 h-8 rounded-[8px] bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-zinc-700 dark:text-[#e6edf3] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] disabled:opacity-40 transition"
            aria-label="Increase temperature by 0.5 degrees"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Buttons with Proper Standard HVAC Icons */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-bold text-zinc-600 dark:text-[#9aa7b4] uppercase tracking-wider block">
          Operating Mode
        </label>
        <div className="grid grid-cols-4 gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMode(m.id)}
                className={`py-2 px-1 rounded-[10px] text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] text-zinc-700 dark:text-[#9aa7b4] border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.15]'
                }`}
                aria-pressed={isSelected}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fan Speed Selection with Bar-Level Icons */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-600 dark:text-[#9aa7b4] uppercase tracking-wider block">
          Fan Speed
        </label>
        <div className="grid grid-cols-4 gap-2">
          {fanSpeeds.map((f) => {
            const isSelected = selectedFan === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFan(f.id)}
                className={`py-2 px-1 rounded-[10px] text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] text-zinc-700 dark:text-[#9aa7b4] border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.15]'
                }`}
                aria-pressed={isSelected}
              >
                {/* Stepped Bar Icon */}
                <div className="h-4 flex items-end gap-0.5 justify-center">
                  {f.bars === 0 ? (
                    <span className="text-[10px] font-mono leading-none">AUTO</span>
                  ) : (
                    <>
                      <div className={`w-1 rounded-sm ${f.bars >= 1 ? (isSelected ? 'bg-white h-2' : 'bg-current h-2') : 'h-1 opacity-20'}`} />
                      <div className={`w-1 rounded-sm ${f.bars >= 2 ? (isSelected ? 'bg-white h-3' : 'bg-current h-3') : 'h-1 opacity-20'}`} />
                      <div className={`w-1 rounded-sm ${f.bars >= 3 ? (isSelected ? 'bg-white h-4' : 'bg-current h-4') : 'h-1 opacity-20'}`} />
                    </>
                  )}
                </div>
                <span className="text-[11px]">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Toast Alert */}
      {toast && (
        <div className={`p-2.5 rounded-[10px] border text-xs font-semibold flex items-center gap-2 ${
          toast.type === 'success' 
            ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30' 
            : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'
        }`}>
          {toast.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Primary Apply Changes Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={!hasChanged || loading}
          className={`w-full py-3 rounded-[12px] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
            hasChanged
              ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white active:scale-[0.99] cursor-pointer'
              : 'bg-black/[0.04] dark:bg-white/[0.04] text-zinc-400 dark:text-zinc-600 border border-black/[0.06] dark:border-white/[0.06] cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Transmitting Command...</span>
            </>
          ) : hasChanged ? (
            <>
              <Check className="w-4 h-4" />
              <span>
                Apply: {currentSetpoint.toFixed(1)}° → {targetTemp.toFixed(1)}°C · {selectedMode}
              </span>
            </>
          ) : (
            <span>Setpoint Confirmed ({currentSetpoint.toFixed(1)}°C)</span>
          )}
        </button>
      </div>
    </div>
  );
}
