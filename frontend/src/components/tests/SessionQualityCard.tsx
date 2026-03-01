import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Brain, TrendingUp, Clock, Activity } from 'lucide-react';
import { Button } from '../common/Button';
import type { FatigueLevel } from '../../types';

const FATIGUE_LABELS: Record<FatigueLevel, string> = {
  alert: 'Alert',
  mild_fatigue: 'Mild Fatigue',
  moderate_fatigue: 'Moderate Fatigue',
  high_fatigue: 'High Fatigue',
};

const FATIGUE_COLORS: Record<FatigueLevel, string> = {
  alert: '#10b981',
  mild_fatigue: '#38bdf8',
  moderate_fatigue: '#fb7185',
  high_fatigue: '#ef4444',
};

function getTaskType(score: number): string {
  if (score >= 80) return 'High Focus Tasks (Math, Coding)';
  if (score >= 60) return 'Memory Tasks (Languages, History)';
  if (score >= 40) return 'Creative Tasks (Writing, Design)';
  return 'Light Review Only';
}

interface SessionQualityCardProps {
  testScore: number;
  testType: string;
  webcamFatigueScore?: number;
  fatigueLevel?: FatigueLevel;
  personalBaseline?: number;
  onTakeAnother: () => void;
}

export function SessionQualityCard({
  testScore,
  testType,
  webcamFatigueScore,
  fatigueLevel,
  personalBaseline,
  onTakeAnother,
}: SessionQualityCardProps) {
  const vsAvg = personalBaseline !== undefined && personalBaseline > 0
    ? Math.round(testScore - personalBaseline)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Session Complete</h3>
          <p className="text-xs text-gray-400">{testType}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Test Score */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-gray-400">Test Score</span>
          </div>
          <p className="text-xl font-bold text-white">{testScore}<span className="text-sm text-gray-400">/100</span></p>
        </div>

        {/* Fatigue Level (only if webcam active) */}
        {fatigueLevel && webcamFatigueScore !== undefined && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-gray-400">Fatigue Level</span>
            </div>
            <p className="text-lg font-semibold" style={{ color: FATIGUE_COLORS[fatigueLevel] }}>
              {FATIGUE_LABELS[fatigueLevel]}
            </p>
          </div>
        )}

        {/* vs Your Avg */}
        {vsAvg !== null && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">vs Your Avg</span>
            </div>
            <p className={`text-lg font-semibold ${vsAvg >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
              {vsAvg >= 0 ? '+' : ''}{vsAvg} pts
            </p>
          </div>
        )}

        {/* Best For */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-400">Best For</span>
          </div>
          <p className="text-sm font-medium text-white">{getTaskType(testScore)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <Button onClick={onTakeAnother} variant="secondary" className="flex-1">
          Take Another Test
        </Button>
        <Link to="/dashboard" className="flex-1">
          <Button className="w-full">Dashboard</Button>
        </Link>
      </div>
    </motion.div>
  );
}
