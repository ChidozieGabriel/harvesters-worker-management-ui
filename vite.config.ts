import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      viteMockServe({
        mockPath: 'mock', // Directory for mock files at project root
        enable: command === 'serve', // Enable only during dev server
        watchFiles: true,            // Hot reload mock files
        logger: true,              // Show mock requests in terminal
      }),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});