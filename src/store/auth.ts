import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { User } from '../services/types';
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

interface TokenProcessingResult {
  token: string | null;
  user: User | null;
}

// Reusable function to process and validate JWT tokens
const processToken = (token: string | null): TokenProcessingResult => {
  if (!token) {
    return { token: null, user: null };
  }

  try {
    const decoded = jwtDecode(token) as any;

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return { token: null, user: null };
    }

    const user = decoded as User;

    return {
      token,
      user
    };
  } catch (error) {
    // Token is invalid, remove it from localStorage
    localStorage.removeItem('token');
    console.warn('Invalid token found, removing it');
    return { token: null, user: null };
  }
};

// Helper function to initialize user from stored token
const initializeUserFromToken = (): TokenProcessingResult => {
  const token = localStorage.getItem('token');
  return processToken(token);
};

export const useAuthStore = create<AuthState>((set, get) => {
  const initialState = initializeUserFromToken();

  return {
    token: initialState.token,
    user: initialState.user,
    setToken: (token: string) => {
      localStorage.setItem('token', token);
      const result = processToken(token);

      if (result.token && result.user) {
        set({ token: result.token, user: result.user });
      } else {
        // If processing failed, clear everything
        localStorage.removeItem('token');
        set({ token: null, user: null });
      }
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
  };
});