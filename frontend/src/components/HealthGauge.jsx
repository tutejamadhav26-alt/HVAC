import React from 'react';
import AnimatedCounter from './AnimatedCounter';

export default function HealthGauge({ score = 100, size = 'default' }) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Color mapping based on strict design system: ok=#22c55e, warn=#f59e0b, danger=#ef4444
  let strokeColor = '#22c55e';
  let badgeText = 'HEALTHY';
  let badgeClass = 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30';

  if (normalizedScore < 60) {
    strokeColor = '#ef4444';
    badgeText = 'FAULT';
    badgeClass = 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30';
  } else if (normalizedScore < 85) {
    strokeColor = '#f59e0b';
    badgeText = 'WARNING';
    badgeClass = 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30';
  }

  if (size === 'compact') {
    const r = 26;
    const circ = 2 * Math.PI * r;
    const offset = circ - (normalizedScore / 100) * circ;

    return (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={r}
            className="stroke-black/[0.08] dark:stroke-white/[0.08]"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r={r}
            stroke={strokeColor}
            strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xs font-black font-mono text-zinc-900 dark:text-[#e6edf3]">
            {normalizedScore}
          </span>
        </div>
      </div>
    );
  }

  // Default Full Gauge
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-[#121821] border border-black/[0.08] dark:border-white/[0.08] rounded-[14px] shadow-sm relative">
      <h3 className="text-xs font-bold text-zinc-600 dark:text-[#9aa7b4] uppercase tracking-wider mb-4">
        HVAC Health Score
      </h3>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-black/[0.08] dark:stroke-white/[0.08]"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <AnimatedCounter 
            value={normalizedScore} 
            className="text-3xl font-black text-zinc-900 dark:text-[#e6edf3] font-mono tracking-tight"
          />
          <span className="text-xs text-zinc-500 dark:text-[#9aa7b4] font-medium font-mono">/ 100</span>
        </div>
      </div>
      <div className={`mt-3 px-3 py-0.5 text-xs font-bold rounded-full border ${badgeClass}`}>
        {badgeText}
      </div>
    </div>
  );
}
