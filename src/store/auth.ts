import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from '../types/api';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    role: UserRole;
  } | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    set({ token, user: decoded as any });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
  isAuthenticated: () => {
    return !!get().token;
  },
  isAdmin: () => {
    return get().user?.role === UserRole.Admin;
  },
}));