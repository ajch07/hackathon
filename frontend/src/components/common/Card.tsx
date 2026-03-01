import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: 'primary' | 'success' | 'warning' | 'info' | 'none';
  hover?: boolean;
  glow?: 'purple' | 'pink' | 'cyan' | 'none';
}

export function Card({ children, className = '', hover = true, glow = 'purple' }: CardProps) {
  const glowColors = {
    purple: 'rgba(139, 92, 246, 0.15)',
    pink: 'rgba(236, 72, 153, 0.15)',
    cyan: 'rgba(34, 211, 238, 0.15)',
    none: 'transparent'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.15 } } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        relative
        rounded-2xl
        p-6
        overflow-hidden
        ${className}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        transition: 'box-shadow 0.15s ease',
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.boxShadow = `0 8px 30px rgba(0, 0, 0, 0.2), 0 0 30px ${glowColors[glow]}`;
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.boxShadow = 'none';
      } : undefined}
    >
      {children}
    </motion.div>
  );
}
