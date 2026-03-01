import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GradientBackground } from '../components/common/GradientBackground';
import { Button } from '../components/common/Button';
import { EnergyTimeline } from '../components/scheduler/EnergyTimeline';
import { RecommendationCard } from '../components/scheduler/RecommendationCard';
import { FatigueBanner } from '../components/common/FatigueBanner';
import { WebcamModule, useWebcam } from '../components/webcam/WebcamModule';
import { useAuthStore } from '../store/authStore';
import { schedulerApi } from '../services/api';
import { mockSchedules, mockEnergyPattern } from '../utils/mockData';
import { Brain, Star, Lightbulb, Moon, TrendingUp } from 'lucide-react';
import type { StudySchedule, EnergyPattern, FatigueLevel } from '../types';

export function SchedulerPage() {
  const { user, isDemo, logout } = useAuthStore();
  const navigate = useNavigate();
  const webcam = useWebcam();
  const [currentFatigueLevel, setCurrentFatigueLevel] = useState<FatigueLevel | null>(null);
  const [schedules, setSchedules] = useState<StudySchedule[]>([]);
  const [energyPattern, setEnergyPattern] = useState<EnergyPattern[]>([]);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      // Demo mode: use mock data
      setSchedules(mockSchedules);
      setEnergyPattern(mockEnergyPattern);
      setLoading(false);
      return;
    }

    // Real user: fetch from backend
    const fetchData = async () => {
      try {
        const [recRes, patRes] = await Promise.all([
          schedulerApi.getRecommendations(),
          schedulerApi.getEnergyPattern(),
        ]);
        // Map snake_case to camelCase for schedules
        const mapped = recRes.data.map((s: Record<string, unknown>) => ({
          id: s.id,
          userId: s.user_id,
          recommendedTime: s.recommended_time,
          subject: s.subject,
          cognitiveRequirement: s.cognitive_requirement,
          estimatedEnergyLevel: s.estimated_energy_level,
          confidence: s.confidence,
          reason: s.reason,
          completed: s.completed,
        }));
        setSchedules(mapped);
        // Map energy patterns
        const patterns = patRes.data.map((p: Record<string, unknown>) => ({
          hourOfDay: p.hour_of_day,
          dayOfWeek: p.day_of_week,
          averageCognitiveScore: p.average_cognitive_score,
          sampleCount: p.sample_count,
        }));
        setEnergyPattern(patterns);
      } catch (err) {
        console.error('[SchedulerPage] Failed to fetch data:', err);
        // Fallback to mock data
        setSchedules(mockSchedules);
        setEnergyPattern(mockEnergyPattern);
      }
      setLoading(false);
    };
    fetchData();
  }, [isDemo]);

  const handleMarkComplete = (id: string) => {
    setSchedules(prev =>
      prev.map(s => s.id === id ? { ...s, completed: true } : s)
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSleepLog = async () => {
    if (!isDemo) {
      try {
        await schedulerApi.logSleep(sleepHours);
      } catch (err) {
        console.error('[SchedulerPage] Failed to log sleep:', err);
      }
    }
    alert(`Logged ${sleepHours} hours of sleep! This will be used to improve your recommendations.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const peakHour = energyPattern.reduce((max, p) => 
    p.averageCognitiveScore > max.averageCognitiveScore ? p : max, energyPattern[0]
  );

  return (
    <div className="min-h-screen relative">
      <GradientBackground />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              CogniTrack
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/tests" className="text-gray-400 hover:text-white transition-colors">Tests</Link>
            <Link to="/scheduler" className="text-white font-medium">Scheduler</Link>
            <Link to="/dna" className="text-gray-400 hover:text-white transition-colors">DNA</Link>
            <Link to="/chat" className="text-gray-400 hover:text-white transition-colors">AI Tutor</Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              <span className="text-sm text-gray-300">Hi, {user?.name || 'User'}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        {/* Fatigue Banner */}
        <FatigueBanner fatigueLevel={currentFatigueLevel} isWebcamActive={webcam.isActive} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Smart Study Scheduler</h1>
          <p className="text-gray-400">Personalized recommendations based on your cognitive patterns</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Energy Timeline */}
            <EnergyTimeline data={energyPattern} />

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Today's Recommendations</h2>
              <div className="space-y-4">
                {schedules.map((schedule, index) => (
                  <RecommendationCard
                    key={schedule.id}
                    schedule={schedule}
                    index={index}
                    onMarkComplete={handleMarkComplete}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Peak Performance Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-violet-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your Peak Time</h3>
              <p className="text-3xl font-bold mb-1">{peakHour.hourOfDay}:00</p>
              <p className="text-sm opacity-80">
                Your cognitive performance peaks in the {peakHour.hourOfDay < 12 ? 'morning' : peakHour.hourOfDay < 17 ? 'afternoon' : 'evening'}. 
                Schedule your most demanding tasks here!
              </p>
            </motion.div>

            {/* Sleep Tracker */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/[0.08] backdrop-blur-md rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Log Your Sleep</h3>
              <p className="text-sm text-gray-400 mb-4">
                Track your sleep to discover how it affects your performance
              </p>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Hours slept last night</label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4h</span>
                  <span className="text-lg font-bold text-violet-400">{sleepHours}h</span>
                  <span>12h</span>
                </div>
              </div>

              <Button onClick={handleSleepLog} className="w-full" variant="primary">
                Log Sleep
              </Button>
            </motion.div>

            {/* Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/[0.08] backdrop-blur-md rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-sm text-green-300">
                    Your focus is <strong>15% higher</strong> in the morning compared to afternoon
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-sm text-blue-300">
                    Getting <strong>7+ hours</strong> of sleep boosts your scores by 20%
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-sm text-purple-300">
                    Your memory performance is improving - up <strong>8%</strong> this week!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Webcam Module */}
      <WebcamModule
        isActive={webcam.isActive}
        onToggle={webcam.toggle}
        onMetrics={(m, level) => {
          webcam.setLatestMetrics(m);
          webcam.setFatigueLevel(level);
          setCurrentFatigueLevel(level);
        }}
        isDemo={isDemo}
      />
    </div>
  );
}
