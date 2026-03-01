import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GradientBackground } from '../components/common/GradientBackground';
import { Button } from '../components/common/Button';
import { Brain, TreeDeciduous, Calendar, Moon, Zap, Clock, TrendingUp } from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'Cognitive Tests',
      description: 'Quick 2-min tests to measure your reaction time, pattern recognition, and attention span.',
      glow: 'purple',
      iconColor: '#a78bfa',
    },
    {
      icon: TreeDeciduous,
      title: 'Visual Dashboard',
      description: 'See your cognitive performance as an interactive tree - watch it grow with your progress!',
      glow: 'cyan',
      iconColor: '#22d3ee',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Get personalized study recommendations based on when your brain works best.',
      glow: 'pink',
      iconColor: '#f472b6',
    },
    {
      icon: Moon,
      title: 'Sleep Correlation',
      description: 'Track how your sleep affects your performance and optimize your routine.',
      glow: 'purple',
      iconColor: '#c4b5fd',
    },
  ];

  const glowClasses: Record<string, string> = {
    purple: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]',
    cyan: 'hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]',
    pink: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.3)]',
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground />

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              CogniTrack
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <Link to="/login">
              <Button variant="secondary" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Study Smarter, Not
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Harder</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Discover when your brain is at peak performance. Take quick cognitive tests,
              track your energy patterns, and get smart recommendations for optimal study times.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <Link to="/register">
                <Button size="lg">Start Free - No Credit Card</Button>
              </Link>
              <Link to="/demo">
                <Button variant="secondary" size="lg">View Demo</Button>
              </Link>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 12px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${
                    feature.glow === 'purple' ? 'rgba(139, 92, 246, 0.2)' :
                    feature.glow === 'cyan' ? 'rgba(34, 211, 238, 0.2)' :
                    'rgba(236, 72, 153, 0.2)'
                  }`;
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${feature.iconColor}30 0%, ${feature.iconColor}10 100%)`,
                    border: `1px solid ${feature.iconColor}40`,
                  }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.iconColor }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex justify-center gap-6 flex-wrap"
          >
            {[
              { value: '2 min', label: 'Average test time', icon: Clock, color: '#a78bfa' },
              { value: '15%', label: 'Productivity boost', icon: TrendingUp, color: '#34d399' },
              { value: '24/7', label: 'Track your patterns', icon: Zap, color: '#fbbf24' },
            ].map((stat) => (
              <motion.div 
                key={stat.label} 
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="text-center px-6 py-4 rounded-xl cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          CogniTrack - Cognitive Load & Energy Manager
        </div>
      </footer>
    </div>
  );
}
