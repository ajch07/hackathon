import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setDemo: (isDemo: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isDemo: localStorage.getItem('isDemo') === 'true',
  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.removeItem('isDemo');
    set({ user, token, isAuthenticated: true, isDemo: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isDemo');
    set({ user: null, token: null, isAuthenticated: false, isDemo: false });
  },
  setDemo: (isDemo) => {
    if (isDemo) {
      localStorage.setItem('isDemo', 'true');
    } else {
      localStorage.removeItem('isDemo');
    }
    set({ isDemo });
  },
}));
