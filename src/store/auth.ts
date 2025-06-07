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

// Helper function to initialize user from stored token
const initializeUserFromToken = () => {
  const token = localStorage.getItem('token');
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
    
    return {
      token,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      }
    };
  } catch (error) {
    // Token is invalid, remove it
    localStorage.removeItem('token');
    console.warn('Invalid token found in localStorage, removing it');
    return { token: null, user: null };
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  const initialState = initializeUserFromToken();
  
  return {
    token: initialState.token,
    user: initialState.user,
    setToken: (token: string) => {
      localStorage.setItem('token', token);
      try {
        const decoded = jwtDecode(token) as any;
        set({ 
          token, 
          user: {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
          }
        });
      } catch (error) {
        console.error('Failed to decode token:', error);
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