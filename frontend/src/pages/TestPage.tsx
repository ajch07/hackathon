import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientBackground } from '../components/common/GradientBackground';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ReactionTimeTest } from '../components/tests/ReactionTimeTest';
import { PatternTest } from '../components/tests/PatternTest';
import { AttentionTest } from '../components/tests/AttentionTest';
import { SessionQualityCard } from '../components/tests/SessionQualityCard';
import { WebcamModule, useWebcam } from '../components/webcam/WebcamModule';
import { AppHeader } from '../components/common/AppHeader';
import { useAuthStore } from '../store/authStore';
import { testsApi } from '../services/api';
import { Zap, Brain, Eye, Clock, Trophy, ThumbsUp, Dumbbell } from 'lucide-react';
import type { TestType, FatigueLevel } from '../types';

const testConfig = {
  REACTION_TIME: {
    title: 'Reaction Time',
    description: 'Test your reflexes! Click as fast as possible when the circle turns green.',
    icon: Zap,
    iconColor: '#f97316',
    duration: '~1 min',
    gradient: 'from-orange-500 to-red-500',
    glow: 'pink' as const,
    Component: ReactionTimeTest,
  },
  PATTERN_RECOGNITION: {
    title: 'Pattern Memory',
    description: 'Watch the sequence of colors and repeat them back. Tests your working memory.',
    icon: Brain,
    iconColor: '#a855f7',
    duration: '~2 min',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'purple' as const,
    Component: PatternTest,
  },
  ATTENTION_SPAN: {
    title: 'Attention Tracking',
    description: 'Keep your eye on the target ball as it moves among others. Tests sustained focus.',
    icon: Eye,
    iconColor: '#3b82f6',
    duration: '~1.5 min',
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'cyan' as const,
    Component: AttentionTest,
  },
};

export function TestPage() {
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [testResult, setTestResult] = useState<{ score: number; metadata: Record<string, unknown> } | null>(null);
  const { user, isDemo, logout } = useAuthStore();
  const navigate = useNavigate();
  const testStartTime = useRef<number>(Date.now());
  const webcam = useWebcam();
  const webcamFatigueRef = useRef<{ score: number; level: FatigueLevel } | null>(null);

  const handleTestComplete = async (score: number, metadata: Record<string, unknown>) => {
    setTestResult({ score, metadata });

    // Save to backend if not in demo mode
    console.log('[TestPage] Test completed:', { score, metadata, isDemo, selectedTest });
    
    if (!isDemo && selectedTest) {
      const duration = Math.round((Date.now() - testStartTime.current) / 1000);
      try {
        // Send actual raw values so backend can normalize correctly:
        // - REACTION_TIME: avgTime in ms (from metadata)
        // - PATTERN_RECOGNITION: number of correct answers (from metadata)
        // - ATTENTION_SPAN: accuracy percentage (score is already 0-100)
        let rawScore = score;
        if (selectedTest === 'REACTION_TIME' && metadata.avgTime) {
          rawScore = metadata.avgTime as number;
        } else if (selectedTest === 'PATTERN_RECOGNITION' && metadata.correct !== undefined) {
          rawScore = metadata.correct as number;
        }

        // Include webcam fatigue score if available
        const submitMetadata = {
          ...metadata,
          webcam_fatigue_score: webcamFatigueRef.current?.score ?? null,
          fatigue_level: webcamFatigueRef.current?.level ?? null,
        };
        
        console.log('[TestPage] Submitting to API:', { test_type: selectedTest, raw_score: rawScore, duration, metadata: submitMetadata });
        
        const response = await testsApi.submit({
          test_type: selectedTest,
          raw_score: rawScore,
          duration,
          metadata: submitMetadata,
        });
        
        console.log('[TestPage] API response:', response.data);
      } catch (err) {
        console.error('[TestPage] Failed to save test result:', err);
      }
    } else {
      console.log('[TestPage] Skipping save - isDemo:', isDemo, 'selectedTest:', selectedTest);
    }
  };

  const handleSelectTest = (type: TestType) => {
    testStartTime.current = Date.now();
    setSelectedTest(type);
  };

  const handleBack = () => {
    setSelectedTest(null);
    setTestResult(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen relative">
      <GradientBackground />

      {/* Header */}
      <AppHeader currentPage="tests" userName={user?.name} isDemo={isDemo} onLogout={handleLogout} />

      <main className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedTest ? (
            // Test Selection View
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Cognitive Tests</h1>
                <p className="text-gray-400">Choose a test to measure your current cognitive state</p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {(Object.entries(testConfig) as [TestType, typeof testConfig[TestType]][]).map(([type, config], index) => (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="cursor-pointer h-full"
                      gradient="none"
                      hover={true}
                      glow={config.glow}
                    >
                      <div 
                        onClick={() => handleSelectTest(type)}
                        className="h-full"
                      >
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                          style={{
                            background: `linear-gradient(135deg, ${config.iconColor}30 0%, ${config.iconColor}10 100%)`,
                            border: `1px solid ${config.iconColor}50`,
                            boxShadow: `0 4px 20px ${config.iconColor}20`
                          }}
                        >
                          <config.icon className="w-7 h-7" style={{ color: config.iconColor }} strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{config.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{config.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {config.duration}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : testResult ? (
            // Results View
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-full sm:max-w-md mx-auto"
            >
              {/* Session Quality Card */}
              <SessionQualityCard
                testScore={testResult.score}
                testType={selectedTest ? testConfig[selectedTest].title : 'Test'}
                webcamFatigueScore={webcamFatigueRef.current?.score}
                fatigueLevel={webcamFatigueRef.current?.level}
                onTakeAnother={handleBack}
              />

              <Card className="text-center" glow="purple">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="mb-4 flex justify-center"
                >
                  <div 
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                      testResult.score >= 80 ? 'bg-emerald-500/20' : 
                      testResult.score >= 60 ? 'bg-sky-400/20' : 'bg-rose-400/20'
                    }`}
                  >
                    {testResult.score >= 80 ? (
                      <Trophy className="w-10 h-10 text-emerald-400" />
                    ) : testResult.score >= 60 ? (
                      <ThumbsUp className="w-10 h-10 text-sky-400" />
                    ) : (
                      <Dumbbell className="w-10 h-10 text-rose-400" />
                    )}
                  </div>
                </motion.div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Test Complete!</h2>
                
                <div className="my-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    className={`text-6xl font-bold ${
                      testResult.score >= 80 ? 'text-green-400' :
                      testResult.score >= 60 ? 'text-sky-400' : 'text-rose-400'
                    }`}
                  >
                    {testResult.score}
                  </motion.div>
                  <p className="text-gray-400">out of 100</p>
                </div>

                <p className="text-gray-300 mb-6">
                  {testResult.score >= 80 ? 'Excellent! Your brain is firing on all cylinders!' :
                   testResult.score >= 60 ? 'Good job! You\'re performing well.' :
                   'Keep practicing! Every test helps track your patterns.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleBack} variant="secondary" className="flex-1">
                    Take Another Test
                  </Button>
                  <Link to="/dashboard" className="flex-1">
                    <Button className="w-full">View Dashboard</Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ) : (
            // Active Test View
            <motion.div
              key="test"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4">
                <Button onClick={handleBack} variant="secondary" size="sm">
                  ← Back to Tests
                </Button>
              </div>
              
              <Card className="max-w-full sm:max-w-2xl mx-auto" gradient="none" glow="purple">
                {(() => {
                  const config = testConfig[selectedTest];
                  const TestComponent = config.Component;
                  return <TestComponent onComplete={handleTestComplete} />;
                })()}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Webcam Module */}
      <WebcamModule
        isActive={webcam.isActive}
        onToggle={webcam.toggle}
        onMetrics={(m, level) => {
          webcam.setLatestMetrics(m);
          webcam.setFatigueLevel(level);
          webcamFatigueRef.current = { score: m.webcamFatigueScore, level };
        }}
        isDemo={isDemo}
      />
    </div>
  );
}
