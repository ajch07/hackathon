import { motion } from 'framer-motion';
import { Target, Brain, Palette, ClipboardList } from 'lucide-react';
import type { StudySchedule } from '../../types';

interface RecommendationCardProps {
  schedule: StudySchedule;
  index: number;
  onMarkComplete?: (id: string) => void;
}

const requirementConfig = {
  HIGH_FOCUS: { icon: Target, color: 'from-red-500 to-pink-500', label: 'High Focus' },
  MEMORY_INTENSIVE: { icon: Brain, color: 'from-purple-500 to-indigo-500', label: 'Memory' },
  CREATIVE: { icon: Palette, color: 'from-pink-500 to-rose-500', label: 'Creative' },
  ROUTINE: { icon: ClipboardList, color: 'from-gray-500 to-slate-500', label: 'Routine' },
};

export function RecommendationCard({ schedule, index, onMarkComplete }: RecommendationCardProps) {
  const config = requirementConfig[schedule.cognitiveRequirement];
  const Icon = config.icon;
  const time = new Date(schedule.recommendedTime);
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r ${config.color} text-white ${schedule.completed ? 'opacity-60' : ''}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg">{schedule.subject}</h4>
              <span className="text-sm opacity-80">{config.label}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{timeStr}</div>
            <div className="text-xs opacity-80">
              {Math.round(schedule.confidence * 100)}% confidence
            </div>
          </div>
        </div>

        <p className="text-sm opacity-90 mb-4 leading-relaxed">
          {schedule.reason}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-full bg-white/20 rounded-full h-2 w-24">
              <div 
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${schedule.estimatedEnergyLevel}%` }}
              />
            </div>
            <span className="text-xs opacity-80">
              {Math.round(schedule.estimatedEnergyLevel)}% energy
            </span>
          </div>

          {!schedule.completed && onMarkComplete && (
            <button
              onClick={() => onMarkComplete(schedule.id)}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
            >
              Mark Done
            </button>
          )}

          {schedule.completed && (
            <span className="px-4 py-1.5 bg-white/30 rounded-full text-sm">
              Done
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
