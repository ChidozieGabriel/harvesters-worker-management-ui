/**
 * Navigation Service
 * 
 * Centralized navigation service that handles all routing and authentication-related
 * navigation throughout the application. This service decouples navigation logic
 * from React components and provides a consistent interface for programmatic navigation.
 */

import { NavigateFunction } from 'react-router-dom';

export interface NavigationService {
  /**
   * Initialize the navigation service with React Router's navigate function
   */
  initialize: (navigate: NavigateFunction) => void;
  
  /**
   * Navigate to a specific path
   */
  navigateTo: (path: string, options?: { replace?: boolean; state?: any }) => void;
  
  /**
   * Navigate to login page
   */
  navigateToLogin: (options?: { replace?: boolean; returnUrl?: string }) => void;
  
  /**
   * Navigate to dashboard
   */
  navigateToDashboard: (options?: { replace?: boolean }) => void;
  
  /**
   * Navigate back in history
   */
  goBack: () => void;
  
  /**
   * Replace current route
   */
  replace: (path: string, state?: any) => void;
  
  /**
   * Check if navigation is available
   */
  isInitialized: () => boolean;
  
  /**
   * Handle authentication redirect (401 errors)
   */
  handleAuthenticationError: () => void;
  
  /**
   * Handle successful login redirect
   */
  handleLoginSuccess: (returnUrl?: string) => void;
  
  /**
   * Handle logout redirect
   */
  handleLogout: () => void;
}

class NavigationServiceImpl implements NavigationService {
  private navigate: NavigateFunction | null = null;
  private isReady = false;

  initialize(navigate: NavigateFunction): void {
    this.navigate = navigate;
    this.isReady = true;
    console.log('🧭 Navigation service initialized');
  }

  isInitialized(): boolean {
    return this.isReady && this.navigate !== null;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized()) {
      console.error('❌ Navigation service not initialized. Call initialize() first.');
      throw new Error('Navigation service not initialized');
    }
  }

  navigateTo(path: string, options: { replace?: boolean; state?: any } = {}): void {
    this.ensureInitialized();
    
    if (options.replace) {
      this.navigate!(path, { replace: true, state: options.state });
    } else {
      this.navigate!(path, { state: options.state });
    }
    
    console.log(`🧭 Navigated to: ${path}`, options);
  }

  navigateToLogin(options: { replace?: boolean; returnUrl?: string } = {}): void {
    this.ensureInitialized();
    
    const state = options.returnUrl ? { returnUrl: options.returnUrl } : undefined;
    
    this.navigate!('/login', { 
      replace: options.replace ?? true, 
      state 
    });
    
    console.log('🧭 Navigated to login', { returnUrl: options.returnUrl });
  }

  navigateToDashboard(options: { replace?: boolean } = {}): void {
    this.ensureInitialized();
    
    this.navigate!('/dashboard', { replace: options.replace ?? true });
    console.log('🧭 Navigated to dashboard');
  }

  goBack(): void {
    this.ensureInitialized();
    this.navigate!(-1);
    console.log('🧭 Navigated back');
  }

  replace(path: string, state?: any): void {
    this.ensureInitialized();
    this.navigate!(path, { replace: true, state });
    console.log(`🧭 Replaced current route with: ${path}`);
  }

  handleAuthenticationError(): void {
    console.warn('🔒 Authentication error detected, redirecting to login');
    
    // Get current path to use as return URL (excluding login page)
    const currentPath = window.location.pathname;
    const returnUrl = currentPath !== '/login' ? currentPath : undefined;
    
    this.navigateToLogin({ replace: true, returnUrl });
  }

  handleLoginSuccess(returnUrl?: string): void {
    console.log('✅ Login successful, redirecting...', { returnUrl });
    
    if (returnUrl && returnUrl !== '/login') {
      this.navigateTo(returnUrl, { replace: true });
    } else {
      this.navigateToDashboard({ replace: true });
    }
  }

  handleLogout(): void {
    console.log('👋 Logout detected, redirecting to login');
    this.navigateToLogin({ replace: true });
  }
}

// Create singleton instance
export const navigationService: NavigationService = new NavigationServiceImpl();

// Export default for convenience
export default navigationService;