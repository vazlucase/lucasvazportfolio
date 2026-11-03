import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { analyticsPlugin } from './server/vite-analytics.mts';

export default defineConfig({
  plugins: [react(), analyticsPlugin()],
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: false,
    strictPort: true,
    fs: { deny: ['.env', '.env.*', '*.{crt,pem,key}', '**/.git/**', '**/.analytics-data/**', '**/secrets/**', '**/.vercel/**'] },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
