import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Set to your GitHub Pages project path, e.g. '/living-seasons/'.
  // Leave as '/' for a user/org pages site or a custom domain.
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200
  }
});
