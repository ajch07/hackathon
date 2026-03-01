import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceArea, Legend,
} from 'recharts';
import { GradientBackground } from '../components/common/GradientBackground';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import { dnaApi, dashboardApi } from '../services/api';
import { mockDNAProfile, mockDailyPattern, mockTrendsWithWebcam } from '../utils/mockData';
import { Brain, Clock, Sun, Moon, Calendar, TrendingUp, Copy, Check, Dna, ArrowRight, Star, AlertTriangle, Zap, Camera } from 'lucide-react';
import type { DNAProfile, DailyPatternPoint } from '../types';

const HOUR_LABELS = [
  '12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM',
  '12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM',
];

function getBarColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#38bdf8';
  if (score >= 40) return '#fb7185';
  return '#ef4444';
}

function getChronoIcon(type: string) {
  switch (type) {
    case 'morning': return <Sun className="w-5 h-5 text-amber-400" />;
    case 'afternoon': return <Sun className="w-5 h-5 text-orange-400" />;
    case 'evening': return <Moon className="w-5 h-5 text-violet-400" />;
    case 'night': return <Moon className="w-5 h-5 text-indigo-400" />;
    default: return <Clock className="w-5 h-5 text-gray-400" />;
  }
}

// Pearson correlation
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);
  const meanX = xSlice.reduce((a, b) => a + b, 0) / n;
  const meanY = ySlice.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xSlice[i] - meanX;
    const dy = ySlice[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

// Weekly heatmap cell color
function heatmapColor(score: number): string {
  if (score <= 0) return '#1f2937';
  if (score < 40) return '#ef4444';
  if (score < 70) return '#fb7185';
  if (score < 85) return '#38bdf8';
  return '#10b981';
}

export function DNAPage() {
  const { user, isDemo, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dnaReady, setDnaReady] = useState(false);
  const [dna, setDna] = useState<DNAProfile | null>(null);
  const [dataPoints, setDataPoints] = useState(0);
  const [dailyPattern, setDailyPattern] = useState<DailyPatternPoint[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; overall: number; webcam: number | null }[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Demo mode - use mock data
      if (isDemo) {
        setDna(mockDNAProfile);
        setDnaReady(true);
        setDataPoints(mockDNAProfile.data_points_count);
        setDailyPattern(mockDailyPattern);
        setTrendData(mockTrendsWithWebcam);
        setLoading(false);
        return;
      }

      // Real user - fetch from API (each call independent so one failure doesn't break all)
      try {
        const profileRes = await dnaApi.getProfile();
        const profile = profileRes.data;
        console.log('[DNAPage] API profile response:', profile);

        if (profile.ready) {
          setDnaReady(true);
          setDna(profile as DNAProfile);
          setDataPoints((profile as DNAProfile).data_points_count);
        } else {
          setDnaReady(false);
          const notReady = profile as { data_points?: number; ready: false };
          console.log('[DNAPage] Not ready, data_points:', notReady.data_points);
          setDataPoints(notReady.data_points || 0);
        }
      } catch (err) {
        console.error('[DNAPage] Failed to load DNA profile:', err);
      }

      try {
        const patternRes = await dnaApi.getDailyPattern();
        setDailyPattern(patternRes.data);
      } catch (err) {
        console.error('[DNAPage] Failed to load daily pattern:', err);
      }

      try {
        const trendsRes = await dashboardApi.getTrends();
        const trends = trendsRes.data as { date: string; score: number; webcam_score?: number }[];
        setTrendData(
          trends.map((t) => ({
            date: t.date,
            overall: t.score,
            webcam: t.webcam_score ?? null,
          }))
        );
      } catch (err) {
        console.error('[DNAPage] Failed to load trends:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [isDemo]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCopy = () => {
    if (!dna) return;
    const text = [
      `CogniTrack Learning DNA Profile`,
      `Chronotype: ${dna.chronotype}`,
      `Peak Hours: ${dna.peak_hours?.join(', ')}`,
      `Fatigue Zone: ${dna.fatigue_zone?.join(', ')}`,
      `Avg Peak Score: ${dna.avg_peak_score}/100`,
      `Session Limit: ${dna.typical_session_limit_mins} mins`,
      `Best Day: ${dna.best_day_of_week}`,
      `Worst Day: ${dna.worst_day_of_week}`,
      `Insight: ${dna.smart_insight}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // Parse peak hours to get the raw numbers for chart highlighting
  const peakHourNums: number[] = [];
  const fatigueHourNums: number[] = [];
  if (dna) {
    dna.peak_hours?.forEach((h) => {
      const num = parseInt(h.split(':')[0], 10);
      if (!isNaN(num)) peakHourNums.push(num);
    });
    dna.fatigue_zone?.forEach((h) => {
      const num = parseInt(h.split(':')[0], 10);
      if (!isNaN(num)) fatigueHourNums.push(num);
    });
  }

  // Build heatmap data from daily pattern (simplified - we only have hour grouping, not day+hour)
  // We'll use available snapshot data grouped by hour
  const heatmapData: number[][] = Array.from({ length: 7 }, () => Array(24).fill(-1));
  dailyPattern.forEach((p) => {
    if (p.session_count > 0) {
      for (let d = 0; d < 7; d++) {
        heatmapData[d][p.hour] = p.avg_score;
      }
    }
  });

  // Correlation
  const overallScores = trendData.map((t) => t.overall);
  const webcamScores = trendData.filter((t) => t.webcam !== null).map((t) => t.webcam!);
  const hasWebcamData = webcamScores.length >= 3;
  const correlation = hasWebcamData
    ? pearsonCorrelation(
        trendData.filter((t) => t.webcam !== null).map((t) => t.overall),
        webcamScores
      )
    : 0;

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
            <Link to="/dna" className="text-white font-medium">DNA</Link>
            <Link to="/chat" className="text-gray-400 hover:text-white transition-colors">AI Tutor</Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              <span className="text-sm text-gray-300">Hi, {user?.name || 'User'}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Learning DNA</h1>
          <p className="text-gray-400">Your personalized cognitive profile based on test data</p>
        </motion.div>

        {!dnaReady ? (
          /* Not Ready State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div
              className="p-10 rounded-3xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Dna className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Your Learning DNA</h2>
              <p className="text-gray-300 mb-6">Complete more test sessions to unlock your personalized cognitive profile</p>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{dataPoints} of 3 sessions</span>
                  <span className="text-violet-400">{Math.round((dataPoints / 3) * 100)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (dataPoints / 3) * 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* What unlocks */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                {[
                  { icon: Clock, label: 'Peak Hours' },
                  { icon: AlertTriangle, label: 'Fatigue Zone' },
                  { icon: Sun, label: 'Chronotype' },
                  { icon: Zap, label: 'Session Limit' },
                  { icon: Calendar, label: 'Weekly Pattern' },
                  { icon: TrendingUp, label: 'Smart Insight' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    <Icon className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                ))}
              </div>

              <Link to="/tests">
                <Button size="lg" className="group">
                  <span className="flex items-center gap-2">
                    Take a Test Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : dna ? (
          <div className="space-y-8">
            {/* SECTION 1: DNA Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(139,92,246,0.25)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Dna className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Learning DNA Profile</h2>
                    <p className="text-sm text-gray-400">Based on {dna.data_points_count} sessions</p>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-sm text-gray-300 hover:text-white hover:border-white/30 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {getChronoIcon(dna.chronotype)}
                    <span className="text-sm text-gray-400">Chronotype</span>
                  </div>
                  <p className="text-lg font-semibold text-white capitalize">{dna.chronotype}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Peak Hours</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{dna.peak_hours?.join(', ') || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span className="text-sm text-gray-400">Fatigue Zone</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{dna.fatigue_zone?.join(', ') || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-gray-400">Avg Peak Score</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{dna.avg_peak_score}/100</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-sky-400" />
                    <span className="text-sm text-gray-400">Session Limit</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{dna.typical_session_limit_mins} mins</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Best Day</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{dna.best_day_of_week}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-rose-400" />
                    <span className="text-sm text-gray-400">Worst Day</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{dna.worst_day_of_week}</p>
                </div>
              </div>

              {/* Insight */}
              {dna.smart_insight && (
                <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-violet-200">{dna.smart_insight}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* SECTION 2: 24-Hour Energy Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl p-8"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h2 className="text-xl font-semibold text-white mb-6">24-Hour Energy Timeline</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyPattern.map((p) => ({ ...p, name: HOUR_LABELS[p.hour] }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    interval={2}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`${Math.round(value)}`, 'Avg Score']}
                  />
                  {/* Fatigue zone reference areas */}
                  {fatigueHourNums.map((h) => (
                    <ReferenceArea
                      key={`fz-${h}`}
                      x1={HOUR_LABELS[h]}
                      x2={HOUR_LABELS[(h + 1) % 24]}
                      fill="#ef4444"
                      fillOpacity={0.08}
                    />
                  ))}
                  <Bar
                    dataKey="avg_score"
                    radius={[4, 4, 0, 0]}
                    fill="#38bdf8"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    shape={(props: any) => {
                      const { x, y, width, height, payload } = props;
                      const color = getBarColor(payload.avg_score);
                      const isPeak = peakHourNums.includes(payload.hour);
                      return (
                        <g>
                          <rect x={x} y={y} width={width} height={height} fill={color} rx={4} ry={4} />
                          {isPeak && (
                            <text x={x + width / 2} y={y - 6} textAnchor="middle" fill="#fbbf24" fontSize={12}>
                              ★
                            </text>
                          )}
                        </g>
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* SECTION 3: Webcam vs Test Score Correlation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-8"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Webcam vs Test Score Correlation</h2>
                {hasWebcamData && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Correlation: {correlation.toFixed(2)}
                  </span>
                )}
              </div>

              {hasWebcamData ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                    <Line type="monotone" dataKey="overall" stroke="#38bdf8" name="Test Score" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="webcam" stroke="#10b981" name="Webcam Score" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-12 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)' }}
                >
                  <Camera className="w-10 h-10 text-gray-500 mb-3" />
                  <p className="text-gray-400 text-sm">Enable webcam during tests to see fatigue correlation</p>
                </div>
              )}
            </motion.div>

            {/* SECTION 4: Weekly Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl p-8"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h2 className="text-xl font-semibold text-white mb-6">Weekly Performance Heatmap</h2>

              <div className="overflow-x-auto">
                <div className="inline-block">
                  {/* Hour labels */}
                  <div className="flex ml-12 mb-1">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="text-center" style={{ width: 16, marginRight: 2 }}>
                        {i % 3 === 0 && (
                          <span className="text-[9px] text-gray-500">{i}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIdx) => (
                    <div key={day} className="flex items-center mb-0.5">
                      <span className="text-xs text-gray-400 w-12 text-right pr-2">{day}</span>
                      <div className="flex">
                        {Array.from({ length: 24 }, (_, hourIdx) => {
                          const score = heatmapData[dayIdx][hourIdx];
                          return (
                            <div
                              key={hourIdx}
                              className="rounded-sm"
                              style={{
                                width: 14,
                                height: 14,
                                marginRight: 2,
                                marginBottom: 2,
                                backgroundColor: score < 0 ? '#1f2937' : heatmapColor(score),
                                opacity: score < 0 ? 0.4 : 1,
                              }}
                              title={score >= 0 ? `${day} ${hourIdx}:00 - Score: ${Math.round(score)}` : `${day} ${hourIdx}:00 - No data`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Legend */}
                  <div className="flex items-center gap-2 mt-3 ml-12">
                    <span className="text-[10px] text-gray-500">Low</span>
                    {['#ef4444', '#fb7185', '#38bdf8', '#10b981'].map((c) => (
                      <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                    ))}
                    <span className="text-[10px] text-gray-500">High</span>
                    <div className="w-3 h-3 rounded-sm bg-gray-700 ml-2" style={{ opacity: 0.4 }} />
                    <span className="text-[10px] text-gray-500">No data</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
