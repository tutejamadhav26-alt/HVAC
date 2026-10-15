import React, { useRef, useEffect } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { animate } from 'animejs';

export default function MetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  color = 'blue', 
  subtitle 
}) {
  const cardRef = useRef(null);
  const prevValRef = useRef(value);

  const colorMap = {
    blue: 'text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    yellow: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-500 dark:text-red-400 bg-red-500/10 border-red-500/20',
    purple: 'text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/20'
  };

  // Micro-animation on value shift with anime.js
  useEffect(() => {
    if (prevValRef.current !== value && cardRef.current) {
      animate(cardRef.current, {
        scale: [1, 1.018, 1],
        duration: 400,
        ease: 'outQuad'
      });
      prevValRef.current = value;
    }
  }, [value]);

  return (
    <div 
      ref={cardRef}
      className="group relative bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${colorMap[color]} transition-transform duration-200 group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <AnimatedCounter 
          value={value} 
          className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight font-mono"
        />
        {unit && (
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
