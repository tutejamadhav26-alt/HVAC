import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';

/**
 * Animated numerical counter powered by Anime.js.
 * Animates smoothly between values as live telemetry updates.
 */
export default function AnimatedCounter({ 
  value, 
  decimals = null, 
  duration = 650,
  className = '' 
}) {
  const numericVal = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = !isNaN(numericVal);
  
  // Detect decimal places if not explicitly provided
  const targetDecimals = decimals !== null 
    ? decimals 
    : (typeof value === 'string' && value.includes('.')) 
      ? value.split('.')[1].length 
      : (isNumeric && numericVal % 1 !== 0) 
        ? 1 
        : 0;

  const [displayValue, setDisplayValue] = useState(
    isNumeric ? numericVal.toFixed(targetDecimals) : value
  );
  
  const currentValRef = useRef({ val: isNumeric ? numericVal : 0 });
  const animRef = useRef(null);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    if (animRef.current) {
      try {
        animRef.current.pause();
      } catch (e) {
        // ignore
      }
    }

    animRef.current = animate(currentValRef.current, {
      val: numericVal,
      duration: duration,
      ease: 'outExpo',
      onUpdate: () => {
        setDisplayValue(currentValRef.current.val.toFixed(targetDecimals));
      },
      onComplete: () => {
        setDisplayValue(numericVal.toFixed(targetDecimals));
      }
    });

    return () => {
      if (animRef.current) {
        try {
          animRef.current.pause();
        } catch (e) {}
      }
    };
  }, [numericVal, targetDecimals, duration, isNumeric, value]);

  return <span className={className}>{displayValue}</span>;
}
