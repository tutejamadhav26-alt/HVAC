import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Animated viewport scroll reveal component using Framer Motion.
 * Triggered as user scrolls down the page.
 */
export function ScrollReveal({ 
  children, 
  delay = 0, 
  yOffset = 24, 
  duration = 0.55, 
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.16, 1, 0.3, 1] // Apple/Vercel smooth easeOut
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container for child items (e.g. grids of metric cards).
 */
export function StaggerContainer({ children, staggerDelay = 0.08, className = '' }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger child item.
 */
export function StaggerItem({ children, className = '' }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Ultra-minimalist top scroll progress bar.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 origin-left z-[60]"
      style={{ scaleX }}
    />
  );
}

export default ScrollReveal;
