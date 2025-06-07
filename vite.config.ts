import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_BASE_DIR } = loadEnv(mode, process.cwd());
  return {
    base: VITE_BASE_DIR,
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  }
});
