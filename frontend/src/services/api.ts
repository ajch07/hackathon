import axios from 'axios';
import type { AuthResponse, LoginDto, RegisterDto, TestSubmission, TestResult, DashboardData, StudySchedule, EnergyPattern, WebcamSnapshotPayload, WebcamSnapshotResponse, DNAProfileResult, DailyPatternPoint, DNACalculateResponse, ChatMessage, ChatHistoryResponse, OnboardingData, StudyProfile } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginDto) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterDto) => api.post<AuthResponse>('/auth/register', data),
  getMe: () => api.get<AuthResponse['user']>('/auth/me'),
};

export const testsApi = {
  submit: (data: TestSubmission) => api.post<TestResult>('/tests/submit', data),
  getResults: () => api.get<TestResult[]>('/tests/results'),
  getStats: () => api.get<{ avg: number; count: number }>('/tests/stats'),
};

export const dashboardApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTree: () => api.get<any>('/dashboard/tree'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSummary: () => api.get<any>('/dashboard/summary'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTrends: () => api.get<any>('/dashboard/trends'),
};

export const schedulerApi = {
  getRecommendations: () => api.get<StudySchedule[]>('/scheduler/recommendations'),
  getEnergyPattern: () => api.get<EnergyPattern[]>('/scheduler/energy-pattern'),
  logSleep: (hours: number) => api.post('/scheduler/sleep', { hours }),
  markComplete: (id: string) => api.post(`/scheduler/mark-complete/${id}`),
};

export const demoApi = {
  getDashboard: () => api.get<DashboardData>('/demo/dashboard'),
  getUser: () => api.get<AuthResponse['user']>('/demo/user'),
};

export const webcamApi = {
  saveSnapshot: (data: WebcamSnapshotPayload) => api.post<WebcamSnapshotResponse>('/webcam/snapshot', data),
};

export const dnaApi = {
  getProfile: () => api.get<DNAProfileResult>('/dna/profile'),
  getDailyPattern: () => api.get<DailyPatternPoint[]>('/dna/daily-pattern'),
  calculate: () => api.post<DNACalculateResponse>('/dna/calculate'),
};

export const chatApi = {
  sendMessage: (message: string) => api.post<ChatMessage>('/chat/message', { message }),
  getHistory: () => api.get<ChatHistoryResponse>('/chat/history'),
  saveOnboarding: (data: OnboardingData) => api.post<{ success: boolean }>('/chat/onboarding', data),
  getStudyProfile: () => api.get<StudyProfile>('/chat/profile'),
};

export default api;
