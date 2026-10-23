import React, { useRef, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import AnimatedCounter from './AnimatedCounter';

export default function MetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  color = 'blue', 
  subtitle,
  delta,
  deltaType = 'neutral', // 'positive' | 'negative' | 'neutral'
  sparklineData = null,
  isHero = false,
  heroTarget = null,
  alertBadge = null,
  children
}) {
  const cardRef = useRef(null);

  // Semantic icon container styles using proper design tokens
  const colorStyles = {
    blue: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20',
    green: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
    emerald: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
    amber: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
    yellow: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
    red: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const sparklineStroke = color === 'red' ? '#ef4444' : color === 'amber' || color === 'yellow' ? '#f59e0b' : color === 'green' || color === 'emerald' ? '#22c55e' : '#3b82f6';

  const chartData = (sparklineData && sparklineData.length > 0)
    ? sparklineData.map((val, idx) => ({ idx, val }))
    : null;

  return (
    <div 
      ref={cardRef}
      className={`group relative rounded-[14px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121821] p-4 sm:p-5 shadow-sm hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all duration-200 flex flex-col justify-between ${
        isHero ? 'md:col-span-2' : ''
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`p-2 rounded-[10px] border ${colorStyles[color] || colorStyles.blue} transition-transform duration-200 group-hover:scale-105`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-bold tracking-wider text-zinc-600 dark:text-[#9aa7b4] uppercase">
            {title}
          </span>
        </div>

        {alertBadge && (
          <div>{alertBadge}</div>
        )}
      </div>

      {/* Main Metric Value & Hero Readout */}
      <div className="mt-3">
        {isHero && heroTarget !== null ? (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-[#e6edf3] font-mono tracking-tight">
                {value}
              </span>
              <span className="text-sm font-semibold text-zinc-500 dark:text-[#9aa7b4]">
                {unit}
              </span>
              <span className="text-sm font-bold text-zinc-400 dark:text-[#9aa7b4] mx-1">→</span>
              <span className="text-lg sm:text-xl font-bold text-[#3b82f6] font-mono">
                {heroTarget}{unit}
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-[#9aa7b4] hidden sm:inline">
                Setpoint
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-[#e6edf3] font-mono tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-zinc-500 dark:text-[#9aa7b4]">
                {unit}
              </span>
            )}
          </div>
        )}

        {/* Custom children (e.g. gauge) */}
        {children}
      </div>

      {/* Bottom Footer: Delta & Sparkline */}
      <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2">
        <div className="min-w-0">
          {delta && (
            <span className={`text-xs font-semibold font-mono ${
              deltaType === 'positive' 
                ? 'text-[#22c55e]' 
                : deltaType === 'negative' 
                ? 'text-[#ef4444]' 
                : 'text-zinc-500 dark:text-[#9aa7b4]'
            }`}>
              {delta}
            </span>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-[#9aa7b4] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Mini Sparkline Chart */}
        {chartData && chartData.length > 1 && (
          <div className="w-20 sm:w-24 h-8 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke={sparklineStroke} 
                  strokeWidth={1.8} 
                  dot={false} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
