import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GradientBackground } from '../components/common/GradientBackground';
import { LoginForm } from '../components/auth/LoginForm';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { mockUser } from '../utils/mockData';
import { Brain, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { login, setDemo } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoMode = () => {
    // IMPORTANT: Call login first, then setDemo (login clears isDemo)
    login(mockUser, 'demo-token');
    setDemo(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative">
      <GradientBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.08] backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                CogniTrack
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
            <p className="text-gray-400 mt-2">Sign in to continue tracking your cognitive performance</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-500">or</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleDemoMode}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Try Demo Mode
              </span>
            </Button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Explore with pre-loaded sample data
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
