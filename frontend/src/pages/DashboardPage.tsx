import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GradientBackground } from '../components/common/GradientBackground';
import { CognitiveTree } from '../components/dashboard/CognitiveTree';
import { ScoreCard } from '../components/dashboard/ScoreCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { FatigueBanner } from '../components/common/FatigueBanner';
import { WebcamModule, useWebcam } from '../components/webcam/WebcamModule';
import { Button } from '../components/common/Button';
import { AppHeader } from '../components/common/AppHeader';
import { useAuthStore } from '../store/authStore';
import { dashboardApi } from '../services/api';
import { mockTreeData, mockSummary, mockTrends, emptyDashboardData } from '../utils/mockData';
import { Brain, Zap, Target, ArrowRight } from 'lucide-react';
import type { DashboardData, FatigueLevel } from '../types';

export function DashboardPage() {
  const { user, isDemo, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const webcam = useWebcam();
  const [currentFatigueLevel, setCurrentFatigueLevel] = useState<FatigueLevel | null>(null);
  
  const isDemoMode = isDemo;

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: use mock data
      setDashboardData({
        tree: mockTreeData,
        summary: mockSummary,
        trends: mockTrends,
      });
      setLoading(false);
    } else {
      // Real user: fetch from backend
      const fetchData = async () => {
        try {
          const [treeRes, summaryRes, trendsRes] = await Promise.all([
            dashboardApi.getTree(),
            dashboardApi.getSummary(),
            dashboardApi.getTrends(),
          ]);

          // Map snake_case backend response to camelCase frontend types
          const summary = summaryRes.data;
          setDashboardData({
            tree: treeRes.data,
            summary: {
              id: summary.id,
              userId: summary.user_id,
              overallScore: summary.overall_score,
              focusScore: summary.focus_score,
              memoryScore: summary.memory_score,
              reactionScore: summary.reaction_score,
              timeOfDay: summary.time_of_day,
              timestamp: summary.timestamp,
            },
            trends: trendsRes.data,
          });
        } catch (err) {
          console.error('Failed to fetch dashboard data:', err);
          // Fallback to empty state if backend is unreachable
          setDashboardData(emptyDashboardData);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [isDemoMode]);

  const isNewUser = !isDemoMode && dashboardData?.trends.length === 0;

  const handleLogout = () => {
    localStorage.removeItem('isDemo');
    logout();
    navigate('/');
  };

  if (loading || !dashboardData) {
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

  return (
    <div className="min-h-screen relative">
      <GradientBackground />

      {/* Header */}
      <AppHeader currentPage="dashboard" userName={user?.name} isDemo={isDemoMode} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        {/* Fatigue Banner */}
        <FatigueBanner fatigueLevel={currentFatigueLevel} isWebcamActive={webcam.isActive} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Cognitive Dashboard</h1>
          <p className="text-gray-400">Track your brain performance and see your progress grow!</p>
        </motion.div>

        {/* New User Empty State */}
        {isNewUser ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div 
              className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)`,
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to CogniTrack!</h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                You haven't taken any cognitive tests yet. Take your first test to start tracking your brain performance and unlock personalized insights!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium">Focus Test</h3>
                  <p className="text-gray-400 text-sm">Pattern recognition</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium">Memory Test</h3>
                  <p className="text-gray-400 text-sm">Sequence recall</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Zap className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium">Reaction Test</h3>
                  <p className="text-gray-400 text-sm">Speed & reflexes</p>
                </div>
              </div>
              
              <Link to="/tests">
                <Button size="lg" className="group">
                  <span className="flex items-center gap-2">
                    Take Your First Test
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Score Cards */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <ScoreCard
                title="Focus Score"
                score={dashboardData.summary.focusScore}
                icon={<Target className="w-6 h-6" />}
                gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                delay={0}
              />
              <ScoreCard
                title="Memory Score"
                score={dashboardData.summary.memoryScore}
                icon={<Brain className="w-6 h-6" />}
                gradient="bg-gradient-to-br from-purple-500 to-pink-600"
                delay={0.1}
              />
              <ScoreCard
                title="Reaction Score"
                score={dashboardData.summary.reactionScore}
                icon={<Zap className="w-6 h-6" />}
                gradient="bg-gradient-to-br from-sky-500 to-cyan-500"
                delay={0.2}
              />
            </div>

            {/* Tree Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/[0.08] backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10 mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-2">Your Cognitive Tree</h2>
              <p className="text-gray-400 mb-6">Your brain's neural network - each node represents a skill, connections show how they work together!</p>
              <CognitiveTree data={dashboardData.tree} />
            </motion.div>

            {/* Trend Chart and Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <TrendChart data={dashboardData.trends} />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/[0.08] backdrop-blur-md rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/tests" className="block">
                    <Button className="w-full justify-start" variant="primary">
                      <span className="flex items-center gap-3">
                        <Zap className="w-5 h-5" />
                        Take a Cognitive Test
                      </span>
                    </Button>
                  </Link>
                  <Link to="/scheduler" className="block">
                    <Button className="w-full justify-start" variant="success">
                      <span className="flex items-center gap-3">
                        <Target className="w-5 h-5" />
                        View Study Recommendations
                      </span>
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                  <p className="text-sm text-violet-300">
                    <strong>Tip:</strong> Take tests at different times of day to discover your peak performance hours!
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
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
        isDemo={isDemoMode}
      />
    </div>
  );
}
