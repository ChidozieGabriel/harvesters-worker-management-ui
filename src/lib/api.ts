import axios from 'axios';
import navigationService from '../services/navigation';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const invalidateToken = () => {
  localStorage.removeItem('token');
  
  // Use navigation service instead of window.location
  if (navigationService.isInitialized()) {
    navigationService.handleAuthenticationError();
  } else {
    // Fallback only if navigation service isn't ready yet
    console.warn('⚠️ Navigation service not ready, using fallback redirect');
    window.location.href = '/login';
  }
}

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    if (response?.data?.status === 401) {
      invalidateToken()
      response.status = 401
      return Promise.reject(response.data);
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      invalidateToken()
    }
    return Promise.reject(error);
  }
);

export default api;