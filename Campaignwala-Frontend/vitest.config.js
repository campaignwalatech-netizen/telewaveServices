import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.js',
    include: ['tests/**/*.test.jsx', 'tests/**/*.test.js'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
