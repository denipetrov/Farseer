import { defineConfig } from 'vitest/config';

// Standalone on purpose: the router codegen plugin from vite.config.ts is not needed in tests.
export default defineConfig({
  resolve: {
    // Root-relative, not an absolute path: on Windows an absolute path can differ in
    // drive-letter case from the root, and Vite then loads the same module twice
    // (two React contexts, "must be used within Provider" errors).
    alias: { '@': '/src' },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // CSS is stubbed out in tests, except the global stylesheets, which tests read (`?raw`)
    // to check them against palette.ts and the icon files
    css: { include: [/src\/styles\/[^/]+\.css/] },
  },
});
