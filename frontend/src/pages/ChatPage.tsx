import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientBackground } from '../components/common/GradientBackground';
import { Button } from '../components/common/Button';
import { OnboardingModal } from '../components/chat/OnboardingModal';
import { useAuthStore } from '../store/authStore';
import { chatApi } from '../services/api';
import { Brain, Send, Bot, UserIcon, Trash2, Sparkles, BookOpen } from 'lucide-react';
import type { ChatMessage } from '../types';

const QUICK_PROMPTS = [
  'Make me a weekly study plan',
  'When should I study my hardest subject?',
  'How can I improve my focus score?',
  'Suggest a break schedule based on my fatigue data',
];

export function ChatPage() {
  const { user, isDemo, logout } = useAuthStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history and check onboarding
  useEffect(() => {
    if (isDemo) {
      setHistoryLoading(false);
      return;
    }

    const init = async () => {
      try {
        // Check if onboarding is done
        const profileRes = await chatApi.getStudyProfile();
        if (!profileRes.data.onboarding_done) {
          setShowOnboarding(true);
        }

        // Load chat history
        const historyRes = await chatApi.getHistory();
        setMessages(historyRes.data.messages);
      } catch (err) {
        console.error('[ChatPage] Failed to load:', err);
      }
      setHistoryLoading(false);
    };
    init();
  }, [isDemo]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setInput('');

    // Add user message optimistically
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    if (isDemo) {
      // Simulate response in demo mode
      setTimeout(() => {
        const demoResponse: ChatMessage = {
          id: `demo-${Date.now()}`,
          role: 'assistant',
          content: "I'm your CogniTrack Study Assistant! In the full version, I analyze your cognitive test data, energy patterns, and fatigue levels to create personalized study plans. Try logging in with a real account to get AI-powered study recommendations based on your actual performance data.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, demoResponse]);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const res = await chatApi.sendMessage(message);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('[ChatPage] Failed to send message:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please make sure the OpenAI API key is configured and try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleClearChat = async () => {
    setMessages([]);
  };

  const handleOnboardingComplete = (field: string, subjects: string[]) => {
    setShowOnboarding(false);
    // Send an initial greeting
    const greeting = `Hi! I just set up my profile. I'm studying ${field} with subjects: ${subjects.join(', ')}. Can you suggest a study plan based on my cognitive data?`;
    handleSend(greeting);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <GradientBackground />

      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md flex-shrink-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              CogniTrack
            </span>
            {isDemo && (
              <span className="ml-2 px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-full font-medium border border-violet-500/30">
                Demo Mode
              </span>
            )}
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/tests" className="text-gray-400 hover:text-white transition-colors">Tests</Link>
            <Link to="/scheduler" className="text-gray-400 hover:text-white transition-colors">Scheduler</Link>
            <Link to="/dna" className="text-gray-400 hover:text-white transition-colors">DNA</Link>
            <Link to="/chat" className="text-white font-medium">AI Tutor</Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              <span className="text-sm text-gray-300">Hi, {user?.name || 'User'}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Chat Area */}
      <main className="relative z-10 flex-1 flex flex-col max-w-5xl w-full mx-auto px-6">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"
              />
            </div>
          ) : messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">CogniTrack Study Assistant</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                I analyze your cognitive test data, energy patterns, and fatigue levels to create personalized study plans just for you.
              </p>

              {/* Quick prompts */}
              <div className="grid grid-cols-2 gap-3 max-w-lg">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-gray-300 text-left hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-150"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 mb-1.5" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-violet-500/20 border border-violet-500/30 text-white'
                          : 'bg-white/[0.06] border border-white/10 text-gray-200'
                      }`}
                    >
                      {msg.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <UserIcon className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 pb-6 pt-2">
          {/* Context bar */}
          {messages.length > 0 && (
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BookOpen className="w-3 h-3" />
                <span>Using your cognitive data for personalized responses</span>
              </div>
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear chat
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your study plan, optimal hours, fatigue management..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-md text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none resize-none text-sm"
                style={{ minHeight: 48, maxHeight: 120 }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
