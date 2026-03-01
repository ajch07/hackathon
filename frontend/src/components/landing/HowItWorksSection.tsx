import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import {
  UserPlus, Brain, Camera, Dna, Calendar, Bot, Trophy,
  Sparkles, TrendingUp, Zap, ChevronRight, Eye, Timer, BarChart3,
} from 'lucide-react';

/* ── Mini Visual Previews ─────────────────────────────── */

function MiniSignUpVisual() {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
      {[70, 100, 60].map((w, i) => (
        <motion.div
          key={i}
          initial={{ width: 0 }}
          animate={{ width: `${w}%` }}
          transition={{ duration: 0.4, delay: i * 0.12 }}
          className="h-2 rounded-full"
          style={{ background: i === 2 ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.1)' }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-1 w-16 h-5 rounded-md bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center"
      >
        <span className="text-[8px] text-white font-bold">Sign Up</span>
      </motion.div>
    </div>
  );
}

function MiniTestVisual() {
  // Animated reaction time circles + score
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {[
          { color: '#f97316', icon: <Timer className="w-3 h-3 text-white" />, delay: 0 },
          { color: '#a855f7', icon: <Brain className="w-3 h-3 text-white" />, delay: 0.15 },
          { color: '#3b82f6', icon: <Eye className="w-3 h-3 text-white" />, delay: 0.3 },
        ].map((t, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: t.delay }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${t.color}30`, border: `1px solid ${t.color}50` }}
          >
            {t.icon}
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-right"
      >
        <div className="text-lg font-bold text-sky-400">87</div>
        <div className="text-[8px] text-gray-500">Score</div>
      </motion.div>
    </div>
  );
}

function MiniWebcamVisual() {
  // Animated face outline with fatigue bars
  return (
    <div className="flex items-center gap-3">
      {/* Mini face outline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-12 h-12 rounded-xl relative flex items-center justify-center"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
      >
        <Camera className="w-5 h-5 text-emerald-400" />
        {/* Scanning line */}
        <motion.div
          animate={{ top: ['10%', '90%', '10%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1 right-1 h-px bg-emerald-400/60"
        />
      </motion.div>
      {/* Fatigue meter bars */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-gray-400">Blink Rate</span>
          <span className="text-[9px] text-emerald-400 font-medium">Normal</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '35%' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-gray-400">Yawn Count</span>
          <span className="text-[9px] text-amber-400 font-medium">Low</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '15%' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-full rounded-full bg-amber-500"
          />
        </div>
      </div>
    </div>
  );
}

function MiniDNAVisual() {
  // Mini heatmap + chronotype badge
  const cells = [
    [3, 2, 4, 5, 5, 3, 2],
    [1, 3, 5, 5, 4, 2, 1],
    [2, 4, 3, 2, 1, 1, 0],
  ];
  const colors = ['#1f2937', '#ef4444', '#fb7185', '#38bdf8', '#10b981', '#10b981'];
  return (
    <div className="flex items-center gap-3">
      {/* Mini heatmap */}
      <div className="flex flex-col gap-0.5">
        {cells.map((row, r) => (
          <div key={r} className="flex gap-0.5">
            {row.map((v, c) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: r * 0.1 + c * 0.03 }}
                className="w-3 h-3 rounded-[2px]"
                style={{ background: colors[v], opacity: v === 0 ? 0.3 : 0.85 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-2 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 mb-1"
        >
          <span className="text-[9px] text-amber-400 font-semibold">Morning Lark</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[9px] text-gray-500"
        >
          Peak: 9 AM - 11 AM
        </motion.div>
      </div>
    </div>
  );
}

function MiniScheduleVisual() {
  const slots = [
    { time: '9 AM', subject: 'Math', energy: 92, color: '#10b981' },
    { time: '11 AM', subject: 'Physics', energy: 78, color: '#38bdf8' },
    { time: '3 PM', subject: 'Reading', energy: 55, color: '#fb7185' },
  ];
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
      {slots.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="flex items-center gap-2 px-2 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-[9px] text-gray-500 w-10 flex-shrink-0">{s.time}</span>
          <span className="text-[10px] text-white font-medium flex-1">{s.subject}</span>
          <div className="flex items-center gap-1">
            <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.energy}%` }}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
                className="h-full rounded-full"
                style={{ background: s.color }}
              />
            </div>
            <span className="text-[8px] font-medium" style={{ color: s.color }}>{s.energy}%</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MiniChatVisual() {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0 }}
        className="flex items-start gap-1.5"
      >
        <div className="w-4 h-4 rounded bg-violet-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-2.5 h-2.5 text-violet-300" />
        </div>
        <div className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[9px] text-gray-300">
          Based on your data, study Math at 9 AM when your focus peaks!
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <div className="px-2 py-1 rounded-lg bg-violet-500/15 border border-violet-500/25 text-[9px] text-violet-200">
          What about breaks?
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-start gap-1.5"
      >
        <div className="w-4 h-4 rounded bg-violet-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-2.5 h-2.5 text-violet-300" />
        </div>
        <div className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[9px] text-gray-300">
          Take a 15-min break at 10:30. Your fatigue score rises after 90 min.
        </div>
      </motion.div>
    </div>
  );
}

function MiniGrowthVisual() {
  // Animated mini trend line
  const points = [20, 35, 30, 50, 45, 60, 58, 72, 68, 82, 85];
  const maxY = 100;
  const w = 160;
  const h = 40;
  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / maxY) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex items-end gap-3">
      <svg width={w} height={h + 4} viewBox={`0 0 ${w} ${h + 4}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={0} y1={(i / 2) * h}
            x2={w} y2={(i / 2) * h}
            stroke="rgba(255,255,255,0.05)" strokeWidth={0.5}
          />
        ))}
        {/* Gradient fill */}
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={pathData + ` L${w},${h} L0,${h} Z`}
          fill="url(#trendGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
        {/* Line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="#a78bfa"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
        {/* End dot */}
        <motion.circle
          cx={w}
          cy={h - (points[points.length - 1] / maxY) * h}
          r={3}
          fill="#a78bfa"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.7 }}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="text-right flex-shrink-0"
      >
        <div className="text-base font-bold text-violet-400 flex items-center gap-1">
          +32%
          <TrendingUp className="w-3 h-3" />
        </div>
        <div className="text-[8px] text-gray-500">This month</div>
      </motion.div>
    </div>
  );
}

function MiniCorrelationVisual() {
  // Webcam score vs Test score mini dual bar chart
  const data = [
    { label: 'Mon', test: 72, webcam: 68 },
    { label: 'Tue', test: 85, webcam: 80 },
    { label: 'Wed', test: 60, webcam: 55 },
    { label: 'Thu', test: 90, webcam: 88 },
  ];
  const maxH = 32;

  return (
    <div>
      <div className="text-[9px] text-gray-500 mb-1.5">Webcam Fatigue vs Test Score</div>
      <div className="flex items-end gap-2">
        {data.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-0.5"
          >
            <div className="flex items-end gap-[2px]">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: (d.test / 100) * maxH }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                className="w-2 rounded-t-sm bg-sky-400"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: (d.webcam / 100) * maxH }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                className="w-2 rounded-t-sm bg-emerald-400"
              />
            </div>
            <span className="text-[7px] text-gray-600">{d.label}</span>
          </motion.div>
        ))}
        <div className="ml-1 flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-sm bg-sky-400" />
            <span className="text-[7px] text-gray-500">Test</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-sm bg-emerald-400" />
            <span className="text-[7px] text-gray-500">Webcam</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Journey Steps Data ───────────────────────────────── */

interface JourneyStep {
  icon: typeof UserPlus;
  title: string;
  description: string;
  color: string;
  gradient: string;
  tags: string[];
  visual: ReactNode;
}

const journeySteps: JourneyStep[] = [
  {
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'One-click signup. No credit card. Just you and your brain, ready to unlock its potential.',
    color: '#a78bfa',
    gradient: 'from-violet-500 to-purple-600',
    tags: ['Free Forever', '30s Setup'],
    visual: <MiniSignUpVisual />,
  },
  {
    icon: Brain,
    title: 'Play Brain Games',
    description: 'Three fun, gamified tests: catch the target ball for attention, repeat color sequences for memory, and tap when the circle turns green for reaction speed. Each takes under 2 minutes.',
    color: '#38bdf8',
    gradient: 'from-sky-500 to-blue-600',
    tags: ['Reaction Time', 'Pattern Memory', 'Attention Tracking'],
    visual: <MiniTestVisual />,
  },
  {
    icon: Camera,
    title: 'Webcam Fatigue Detection',
    description: 'While you test, our AI watches through your webcam (with permission) to detect blink rate, yawns, and head movement. It builds a real-time fatigue score and correlates it with your test performance.',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    tags: ['Blink Detection', 'Yawn Tracking', 'Fatigue Score', 'Real-time'],
    visual: <MiniWebcamVisual />,
  },
  {
    icon: BarChart3,
    title: 'See the Correlation',
    description: 'Your webcam fatigue score is plotted against your test scores over time. Watch how fatigue directly impacts your performance - the data tells the story your eyes can\'t hide.',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-sky-600',
    tags: ['Webcam vs Score Graph', 'Trend Analysis', 'Pearson Correlation'],
    visual: <MiniCorrelationVisual />,
  },
  {
    icon: Dna,
    title: 'Discover Your Learning DNA',
    description: 'After 3+ sessions, we generate your unique cognitive profile: chronotype (morning lark or night owl?), peak performance hours, fatigue zones, best/worst days, and a 24-hour energy heatmap.',
    color: '#34d399',
    gradient: 'from-emerald-500 to-green-600',
    tags: ['Chronotype', 'Peak Hours', 'Fatigue Zones', 'Weekly Heatmap'],
    visual: <MiniDNAVisual />,
  },
  {
    icon: Calendar,
    title: 'Get Your Smart Schedule',
    description: 'Our AI builds a personalized study plan based on YOUR data - scheduling hard subjects during peak hours and lighter review when energy dips. Log your sleep to make it even smarter.',
    color: '#f472b6',
    gradient: 'from-pink-500 to-rose-600',
    tags: ['Energy-Aware', 'Sleep Correlation', 'Auto-Optimized'],
    visual: <MiniScheduleVisual />,
  },
  {
    icon: Bot,
    title: 'Chat with Your AI Tutor',
    description: 'Ask anything - study plans, break timing, subject prioritization. The AI knows your cognitive data, energy patterns, and fatigue history. It gives advice that actually works for YOUR brain.',
    color: '#fbbf24',
    gradient: 'from-amber-500 to-orange-500',
    tags: ['Knows Your Data', 'Study Plans', 'Break Advice'],
    visual: <MiniChatVisual />,
  },
  {
    icon: Trophy,
    title: 'Watch Yourself Grow',
    description: 'Your cognitive tree grows with every session. Track score trends, see your improvement graph, compare weekly performance, and watch your brain literally level up over time.',
    color: '#a78bfa',
    gradient: 'from-violet-500 to-purple-600',
    tags: ['Cognitive Tree', 'Score Trends', 'Visual Dashboard'],
    visual: <MiniGrowthVisual />,
  },
];

/* ── Main Component ───────────────────────────────────── */

export function JourneySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.03 });

  return (
    <section ref={sectionRef} className="py-14 sm:py-20 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, #3b82f6, #10b981)' }}
        />
      </div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 sm:mb-14 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: 'spring', delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-5"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-violet-300 font-medium">Your Path to Peak Performance</span>
        </motion.div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
          The{' '}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            CogniTrack
          </span>{' '}
          Journey
        </h2>
        <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
          From your first test to peak performance - here's exactly how CogniTrack transforms the way you study.
        </p>
      </motion.div>

      {/* Journey Steps */}
      <div className="max-w-3xl mx-auto relative z-10 px-2">
        {/* Vertical timeline line */}
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px z-0">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 3, ease: 'easeOut', delay: 0.2 }}
            className="w-full h-full origin-top"
            style={{
              background: 'linear-gradient(to bottom, rgba(167,139,250,0.5), rgba(56,189,248,0.4), rgba(16,185,129,0.4), rgba(6,182,212,0.4), rgba(52,211,153,0.4), rgba(244,114,182,0.4), rgba(251,191,36,0.4), rgba(167,139,250,0.4), transparent)',
            }}
          />
        </div>

        <div className="relative z-10 space-y-3 sm:space-y-4">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const staggerDelay = index * 0.12 + 0.3;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: staggerDelay, ease: 'easeOut' }}
                className="flex gap-4 sm:gap-5 items-start group"
              >
                {/* Timeline Node */}
                <div className="flex-shrink-0 relative mt-4 sm:mt-5">
                  {/* Pulse ring */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? {
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0, 0.3],
                    } : {}}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: staggerDelay + 0.5,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: step.color, filter: 'blur(6px)' }}
                  />
                  {/* Node circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ type: 'spring', delay: staggerDelay, damping: 12 }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center relative shadow-lg`}
                    style={{ boxShadow: `0 4px 20px ${step.color}40` }}
                  >
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white border-2 border-[#0f0f2e]"
                      style={{ background: step.color }}
                    >
                      {index + 1}
                    </div>
                  </motion.div>
                </div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 rounded-2xl p-4 sm:p-5 cursor-pointer relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}10 0%, rgba(255,255,255,0.03) 100%)`,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${step.color}25`,
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none"
                    style={{ background: step.color }}
                  />

                  <div className="relative z-10">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-white">{step.title}</h3>
                      <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </div>

                    {/* Description */}
                    <p className="text-[13px] sm:text-sm text-gray-400 leading-relaxed mb-3">
                      {step.description}
                    </p>

                    {/* Mini Visual Preview */}
                    <div className="mb-3 p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                      {step.visual}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {step.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
                          style={{
                            background: `${step.color}12`,
                            color: step.color,
                            border: `1px solid ${step.color}20`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Traveling dot */}
        <motion.div
          initial={{ top: 0, opacity: 0 }}
          animate={isInView ? {
            top: ['0%', '100%'],
            opacity: [0, 1, 1, 1, 0],
          } : {}}
          transition={{ duration: 5, delay: 0.5, ease: 'easeInOut' }}
          className="absolute left-6 sm:left-8 w-2 h-2 -ml-[3px] rounded-full z-20 pointer-events-none"
          style={{
            background: '#a78bfa',
            boxShadow: '0 0 12px rgba(167, 139, 250, 0.8), 0 0 24px rgba(167, 139, 250, 0.4)',
          }}
        />
      </div>

      {/* Bottom CTA area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 1.8 }}
        className="text-center mt-12 sm:mt-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2 mb-5">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </motion.div>
          <span className="text-emerald-400 text-sm font-medium">
            Students report 15% better focus within 2 weeks
          </span>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            2 min average test
          </div>
          <div className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            AI webcam analysis
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            Science-backed
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Free forever
          </div>
        </div>
      </motion.div>
    </section>
  );
}
