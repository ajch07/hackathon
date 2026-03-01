import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  icon: ReactNode;
  gradient: string;
  delay?: number;
}

export function ScoreCard({ title, score, icon, gradient, delay = 0 }: ScoreCardProps) {
  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Average';
    return 'Needs Work';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl p-6 ${gradient} text-white shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            {getScoreLabel(score)}
          </span>
        </div>
        
        <h3 className="text-lg font-medium opacity-90 mb-1">{title}</h3>
        
        <div className="flex items-end gap-2">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
            className="text-4xl font-bold"
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-lg opacity-70 mb-1">/100</span>
        </div>
        
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(score)}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-white/80 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
