// Central API service entry point with environment-based configuration
// This file automatically detects the environment and loads the appropriate API implementation

// Environment detection
const isDevelopment = import.meta.env.MODE === 'development';
const apiMode = import.meta.env.VITE_APP_API_MODE;

// Determine which API implementation to use
const useMockApi = isDevelopment || apiMode === 'mock';

console.log(`🔧 [API CONFIG] Environment: ${import.meta.env.MODE}`);
console.log(`🔧 [API CONFIG] API Mode: ${apiMode || 'auto'}`);
console.log(`🔧 [API CONFIG] Using ${useMockApi ? 'MOCK' : 'REAL'} API implementation`);

// Conditionally export the appropriate API implementation
if (useMockApi) {
  // Development/Mock environment - use mock API
  export * from './mock';
} else {
  // Production environment - use real API
  export * from './real';
}

// Export types for convenience
export * from './types';