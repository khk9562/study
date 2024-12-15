import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/ui': path.resolve(__dirname, './src/ui'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/layout': path.resolve(__dirname, './src/layout'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/features': path.resolve(__dirname, './src/features'),
    },
  },
});
