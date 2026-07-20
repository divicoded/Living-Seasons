import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages project site is served from a subpath:
  // https://divicoded.github.io/Living-Seasons/
  base: '/Living-Seasons/',
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
