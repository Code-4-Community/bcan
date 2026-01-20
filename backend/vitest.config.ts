import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test-setup.ts'],
    // Exclude compiled JS test files in dist folder
    exclude: ['node_modules', 'dist'],
  },
});
