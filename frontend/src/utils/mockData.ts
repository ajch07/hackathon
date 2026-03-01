import type { DashboardData, TestResult, StudySchedule, EnergyPattern, User, DNAProfile, DailyPatternPoint } from '../types';

export const mockUser: User = {
  id: 'demo-user-001',
  email: 'demo@cognitrack.app',
  name: 'Alex Student',
  createdAt: new Date().toISOString(),
};

// Empty state for new users - all scores are 0
export const emptyTreeData: DashboardData['tree'] = {
  id: 'root',
  name: 'Overall',
  score: 0,
  children: [
    {
      id: 'focus',
      name: 'Focus',
      score: 0,
      children: [],
    },
    {
      id: 'memory',
      name: 'Memory',
      score: 0,
      children: [],
    },
    {
      id: 'reaction',
      name: 'Reaction',
      score: 0,
      children: [],
    },
  ],
};

export const emptySummary: DashboardData['summary'] = {
  id: 'snapshot-new',
  userId: 'new-user',
  overallScore: 0,
  focusScore: 0,
  memoryScore: 0,
  reactionScore: 0,
  timeOfDay: '',
  timestamp: new Date().toISOString(),
};

export const emptyTrends: DashboardData['trends'] = [];

export const emptyDashboardData: DashboardData = {
  tree: emptyTreeData,
  summary: emptySummary,
  trends: emptyTrends,
};

// Demo data with pre-filled scores
export const mockTreeData: DashboardData['tree'] = {
  id: 'root',
  name: 'Overall',
  score: 78,
  children: [
    {
      id: 'focus',
      name: 'Focus',
      score: 82,
      children: [
        { id: 'focus-1', name: 'Mon 9AM', score: 85 },
        { id: 'focus-2', name: 'Tue 10AM', score: 79 },
        { id: 'focus-3', name: 'Wed 9AM', score: 88 },
        { id: 'focus-4', name: 'Thu 11AM', score: 76 },
        { id: 'focus-5', name: 'Fri 9AM', score: 82 },
      ],
    },
    {
      id: 'memory',
      name: 'Memory',
      score: 75,
      children: [
        { id: 'memory-1', name: 'Mon 2PM', score: 72 },
        { id: 'memory-2', name: 'Tue 3PM', score: 78 },
        { id: 'memory-3', name: 'Wed 2PM', score: 71 },
        { id: 'memory-4', name: 'Thu 4PM', score: 80 },
        { id: 'memory-5', name: 'Fri 2PM', score: 74 },
      ],
    },
    {
      id: 'reaction',
      name: 'Reaction',
      score: 76,
      children: [
        { id: 'reaction-1', name: 'Mon 8AM', score: 82 },
        { id: 'reaction-2', name: 'Tue 8AM', score: 74 },
        { id: 'reaction-3', name: 'Wed 8AM', score: 79 },
        { id: 'reaction-4', name: 'Thu 8AM', score: 71 },
        { id: 'reaction-5', name: 'Fri 8AM', score: 74 },
      ],
    },
  ],
};

export const mockSummary: DashboardData['summary'] = {
  id: 'snapshot-001',
  userId: 'demo-user-001',
  overallScore: 78,
  focusScore: 82,
  memoryScore: 75,
  reactionScore: 76,
  timeOfDay: '10:30',
  timestamp: new Date().toISOString(),
};

export const mockTrends: DashboardData['trends'] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toISOString().split('T')[0],
    score: 65 + Math.floor(Math.random() * 25),
  };
});

export const mockTestResults: TestResult[] = [
  {
    id: 'test-001',
    userId: 'demo-user-001',
    testType: 'REACTION_TIME',
    rawScore: 285,
    normalizedScore: 79,
    duration: 60,
    metadata: { attempts: 10, avgTime: 285 },
    timestamp: new Date().toISOString(),
  },
  {
    id: 'test-002',
    userId: 'demo-user-001',
    testType: 'PATTERN_RECOGNITION',
    rawScore: 8,
    normalizedScore: 80,
    duration: 90,
    metadata: { correct: 8, total: 10 },
    timestamp: new Date().toISOString(),
  },
  {
    id: 'test-003',
    userId: 'demo-user-001',
    testType: 'ATTENTION_SPAN',
    rawScore: 72,
    normalizedScore: 72,
    duration: 60,
    metadata: { trackingAccuracy: 0.72 },
    timestamp: new Date().toISOString(),
  },
];

export const mockSchedules: StudySchedule[] = [
  {
    id: 'sched-001',
    userId: 'demo-user-001',
    recommendedTime: new Date(Date.now() + 3600000).toISOString(),
    subject: 'Mathematics',
    cognitiveRequirement: 'HIGH_FOCUS',
    estimatedEnergyLevel: 85,
    confidence: 0.92,
    reason: 'Your focus peaks at 9 AM based on 15 test sessions. Best time for problem-solving!',
    completed: false,
  },
  {
    id: 'sched-002',
    userId: 'demo-user-001',
    recommendedTime: new Date(Date.now() + 7200000).toISOString(),
    subject: 'Language Learning',
    cognitiveRequirement: 'MEMORY_INTENSIVE',
    estimatedEnergyLevel: 78,
    confidence: 0.85,
    reason: 'Your memory performance is strong in late morning. Ideal for vocabulary!',
    completed: false,
  },
  {
    id: 'sched-003',
    userId: 'demo-user-001',
    recommendedTime: new Date(Date.now() + 14400000).toISOString(),
    subject: 'Creative Writing',
    cognitiveRequirement: 'CREATIVE',
    estimatedEnergyLevel: 65,
    confidence: 0.78,
    reason: 'Moderate energy levels are perfect for creative tasks. Let ideas flow!',
    completed: false,
  },
  {
    id: 'sched-004',
    userId: 'demo-user-001',
    recommendedTime: new Date(Date.now() + 21600000).toISOString(),
    subject: 'Review Notes',
    cognitiveRequirement: 'ROUTINE',
    estimatedEnergyLevel: 45,
    confidence: 0.88,
    reason: 'Evening review works well even at lower energy. Perfect for revision!',
    completed: false,
  },
];

export const mockEnergyPattern: EnergyPattern[] = Array.from({ length: 24 }, (_, hour) => {
  let score: number;
  if (hour >= 6 && hour <= 10) {
    score = 70 + Math.floor(Math.random() * 20);
  } else if (hour >= 14 && hour <= 16) {
    score = 50 + Math.floor(Math.random() * 15);
  } else if (hour >= 19 && hour <= 22) {
    score = 60 + Math.floor(Math.random() * 15);
  } else {
    score = 30 + Math.floor(Math.random() * 20);
  }
  return {
    hourOfDay: hour,
    dayOfWeek: 1,
    averageCognitiveScore: score,
    sampleCount: 5 + Math.floor(Math.random() * 10),
  };
});

export const mockDashboardData: DashboardData = {
  tree: mockTreeData,
  summary: mockSummary,
  trends: mockTrends,
};

// Mock DNA Profile for demo mode
export const mockDNAProfile: DNAProfile = {
  ready: true,
  id: 'dna-demo-001',
  user_id: 'demo-user-001',
  last_calculated: new Date().toISOString(),
  peak_hours: ['09:00-10:00', '16:00-17:00'],
  fatigue_zone: ['22:00-23:00', '14:00-15:00'],
  avg_peak_score: 87,
  typical_session_limit_mins: 45,
  best_day_of_week: 'Tuesday',
  worst_day_of_week: 'Sunday',
  primary_fatigue_signal: 'perclos',
  chronotype: 'morning',
  personal_baseline: {
    '0': 25, '1': 20, '2': 18, '3': 15, '4': 20, '5': 35,
    '6': 55, '7': 70, '8': 82, '9': 88, '10': 85, '11': 78,
    '12': 72, '13': 65, '14': 58, '15': 62, '16': 75, '17': 70,
    '18': 65, '19': 60, '20': 55, '21': 45, '22': 35, '23': 28,
  },
  smart_insight: 'You are a morning learner. Schedule Math and Coding before noon for maximum retention.',
  data_points_count: 47,
};

// Mock daily pattern for demo
export const mockDailyPattern: DailyPatternPoint[] = Array.from({ length: 24 }, (_, hour) => {
  let score: number;
  if (hour >= 8 && hour <= 11) {
    score = 75 + Math.floor(Math.random() * 15);
  } else if (hour >= 15 && hour <= 17) {
    score = 65 + Math.floor(Math.random() * 15);
  } else if (hour >= 20 && hour <= 23) {
    score = 35 + Math.floor(Math.random() * 15);
  } else if (hour >= 0 && hour <= 5) {
    score = 15 + Math.floor(Math.random() * 15);
  } else {
    score = 50 + Math.floor(Math.random() * 20);
  }
  return {
    hour,
    avg_score: score,
    session_count: hour >= 6 && hour <= 22 ? 3 + Math.floor(Math.random() * 5) : 0,
  };
});

// Mock trend data with webcam scores for demo
export const mockTrendsWithWebcam = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  const overall = 65 + Math.floor(Math.random() * 25);
  return {
    date: date.toISOString().split('T')[0],
    overall,
    webcam: overall - 5 + Math.floor(Math.random() * 10),
  };
});
