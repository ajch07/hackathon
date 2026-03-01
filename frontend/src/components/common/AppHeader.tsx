import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';
import { Button } from './Button';

interface AppHeaderProps {
  currentPage: 'dashboard' | 'tests' | 'scheduler' | 'dna' | 'chat';
  userName?: string;
  isDemo?: boolean;
  onLogout: () => void;
}

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', key: 'dashboard' as const },
  { path: '/tests', label: 'Tests', key: 'tests' as const },
  { path: '/scheduler', label: 'Scheduler', key: 'scheduler' as const },
  { path: '/dna', label: 'DNA', key: 'dna' as const },
  { path: '/chat', label: 'AI Tutor', key: 'chat' as const },
];

export function AppHeader({ currentPage, userName, isDemo, onLogout }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Body scroll lock when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="relative z-30 px-4 sm:px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            CogniTrack
          </span>
          {isDemo && (
            <span className="ml-2 px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-full font-medium border border-violet-500/30">
              Demo
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.path}
              className={
                currentPage === link.key
                  ? 'text-white font-medium'
                  : 'text-gray-400 hover:text-white transition-colors'
              }
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
            <span className="text-sm text-gray-300">
              Hi, {userName || 'User'}
            </span>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 border border-white/10"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop - covers entire screen with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 z-40"
              style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer - solid dark background for clarity */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 z-50 flex flex-col border-l border-violet-400/50 shadow-2xl"
              style={{ background: '#0c0c1d' }}
              role="dialog"
              aria-label="Navigation menu"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-violet-400/30 bg-violet-900/40">
                <span className="text-sm text-white font-medium">
                  Hi, {userName || 'User'}
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-500/30 border border-violet-400/50"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 py-4 px-3">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-xl text-base font-semibold mb-2 transition-colors ${
                        currentPage === link.key
                          ? 'bg-violet-600 text-white border border-violet-400 shadow-lg shadow-violet-500/40'
                          : 'text-white bg-violet-900/50 hover:bg-violet-700 border border-violet-700/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Logout */}
              <div className="px-5 pb-6 pt-2 border-t border-violet-400/30 bg-violet-900/30">
                <Button variant="secondary" size="md" onClick={onLogout} className="w-full">
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
