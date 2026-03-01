import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GradientBackground } from '../components/common/GradientBackground';
import { useAuthStore } from '../store/authStore';
import { mockUser } from '../utils/mockData';
import { Brain, Sparkles } from 'lucide-react';

export function DemoPage() {
  const { login, setDemo } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-trigger demo mode
    // IMPORTANT: Call login first, then setDemo (login clears isDemo)
    login(mockUser, 'demo-token');
    setDemo(true);
    
    // Small delay to show loading state, then redirect
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 1000);

    return () => clearTimeout(timer);
  }, [login, setDemo, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GradientBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Brain className="w-10 h-10 text-white" />
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 mx-auto mb-4 border-4 border-violet-500 border-t-transparent rounded-full"
        />

        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-400" />
          Loading Demo Mode
        </h2>
        <p className="text-gray-400">Preparing sample data for you...</p>
      </motion.div>
    </div>
  );
}
