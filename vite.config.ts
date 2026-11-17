import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    // Must come before the React plugin
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  resolve: {
    // Root-relative, not an absolute path: on Windows an absolute path can differ in
    // drive-letter case from the root, and Vite then loads the same module twice
    // (two React contexts, "must be used within Provider" errors).
    alias: { '@': '/src' },
  },
  server: { port: 5173 },
});
