import React from 'react';

export default function HealthGauge({ score = 100 }) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = 'stroke-emerald-500 text-emerald-400';
  let badgeText = 'HEALTHY';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (normalizedScore < 60) {
    colorClass = 'stroke-red-500 text-red-400';
    badgeText = 'CRITICAL';
    badgeBg = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (normalizedScore < 85) {
    colorClass = 'stroke-amber-500 text-amber-400';
    badgeText = 'WARNING';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/80 border border-slate-700/60 rounded-xl shadow-lg relative">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">HVAC Health Score</h3>
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-700"
            strokeWidth="14"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`${colorClass} transition-all duration-700 ease-out`}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-extrabold text-slate-100">{normalizedScore}</span>
          <span className="text-xs text-slate-400 font-medium font-mono">/ 100</span>
        </div>
      </div>
      <div className={`mt-4 px-3 py-1 text-xs font-bold rounded-full border ${badgeBg}`}>
        {badgeText}
      </div>
    </div>
  );
}
