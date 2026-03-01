import { motion } from 'framer-motion';
import type { EnergyPattern } from '../../types';

interface EnergyTimelineProps {
  data: EnergyPattern[];
}

export function EnergyTimeline({ data }: EnergyTimelineProps) {
  const getBarColor = (score: number) => {
    if (score >= 75) return 'from-green-400 to-emerald-500';
    if (score >= 50) return 'from-sky-400 to-cyan-400';
    return 'from-red-400 to-pink-400';
  };

  const getEnergyLabel = (score: number) => {
    if (score >= 75) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  const peakHour = data.reduce((max, p) => p.averageCognitiveScore > max.averageCognitiveScore ? p : max, data[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.08] backdrop-blur-md rounded-2xl p-6 border border-white/10"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Daily Energy Pattern</h3>
        <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
          Peak: {peakHour.hourOfDay}:00
        </span>
      </div>

      <div className="flex items-end justify-between gap-1 h-40 mb-4">
        {data.filter(p => p.hourOfDay >= 6 && p.hourOfDay <= 23).map((pattern, index) => (
          <motion.div
            key={pattern.hourOfDay}
            initial={{ height: 0 }}
            animate={{ height: `${pattern.averageCognitiveScore}%` }}
            transition={{ delay: index * 0.02, duration: 0.5 }}
            className="relative group flex-1"
          >
            <div
              className={`w-full h-full rounded-t-md bg-gradient-to-t ${getBarColor(pattern.averageCognitiveScore)} cursor-pointer hover:opacity-80 transition-opacity`}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-white/10">
              <div className="font-semibold">{pattern.hourOfDay}:00</div>
              <div>Energy: {Math.round(pattern.averageCognitiveScore)}%</div>
              <div className="text-gray-400">{getEnergyLabel(pattern.averageCognitiveScore)}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" />
          <span className="text-xs text-gray-400">High Energy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400" />
          <span className="text-xs text-gray-400">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-pink-400" />
          <span className="text-xs text-gray-400">Low</span>
        </div>
      </div>
    </motion.div>
  );
}
