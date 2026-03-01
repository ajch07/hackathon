export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  field_of_study?: string | null;
  subjects?: string[] | null;
  onboarding_done?: string | null;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export type TestType = 'REACTION_TIME' | 'PATTERN_RECOGNITION' | 'ATTENTION_SPAN';

export type CognitiveRequirement = 'HIGH_FOCUS' | 'MEMORY_INTENSIVE' | 'CREATIVE' | 'ROUTINE';

export interface TestResult {
  id: string;
  userId: string;
  testType: TestType;
  rawScore: number;
  normalizedScore: number;
  duration: number;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface CognitiveSnapshot {
  id: string;
  userId: string;
  overallScore: number;
  focusScore: number;
  memoryScore: number;
  reactionScore: number;
  timeOfDay: string;
  timestamp: string;
}

export interface StudySchedule {
  id: string;
  userId: string;
  recommendedTime: string;
  subject: string;
  cognitiveRequirement: CognitiveRequirement;
  estimatedEnergyLevel: number;
  confidence: number;
  reason: string;
  completed: boolean;
}

export interface EnergyPattern {
  hourOfDay: number;
  dayOfWeek: number;
  averageCognitiveScore: number;
  sampleCount: number;
}

export interface TreeNode {
  id: string;
  name: string;
  score: number;
  children?: TreeNode[];
}

export interface DashboardData {
  tree: TreeNode;
  summary: CognitiveSnapshot;
  trends: { date: string; score: number }[];
}

export interface TestSubmission {
  test_type: TestType;
  raw_score: number;
  duration: number;
  metadata: Record<string, unknown>;
}

// Phase 2 Types

export interface WebcamMetrics {
  blinkRate: number;
  perclos: number;
  headStability: number;
  gazeStability: number;
  webcamFatigueScore: number;
}

export type FatigueLevel = 'alert' | 'mild_fatigue' | 'moderate_fatigue' | 'high_fatigue';

export interface WebcamSnapshotPayload {
  blink_rate: number;
  perclos: number;
  head_stability: number;
  gaze_stability: number;
  webcam_fatigue_score: number;
  test_result_id?: string;
}

export interface WebcamSnapshotResponse {
  success: boolean;
  combined_cognitive_score: number | null;
  fatigue_level: string | null;
}

export interface DNANotReady {
  ready: false;
  data_points: number;
  needed: number;
  message: string;
}

export interface DNAProfile {
  ready: true;
  id: string;
  user_id: string;
  last_calculated: string;
  peak_hours: string[];
  fatigue_zone: string[];
  avg_peak_score: number;
  typical_session_limit_mins: number;
  best_day_of_week: string;
  worst_day_of_week: string;
  primary_fatigue_signal: string;
  chronotype: string;
  personal_baseline: Record<string, number>;
  smart_insight: string;
  data_points_count: number;
}

export type DNAProfileResult = DNANotReady | DNAProfile;

export interface DailyPatternPoint {
  hour: number;
  avg_score: number;
  session_count: number;
}

export interface DNACalculateResponse {
  success: boolean;
  message: string;
  data_points_count: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}

export interface OnboardingData {
  field_of_study: string;
  subjects: string[];
}

export interface StudyProfile {
  field_of_study: string | null;
  subjects: string[];
  onboarding_done: boolean;
}
