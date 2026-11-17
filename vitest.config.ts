import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Standalone on purpose: the router codegen plugin from vite.config.ts is not needed in tests.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
