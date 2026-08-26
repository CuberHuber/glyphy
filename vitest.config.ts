import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const resolve = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@glyphy/core': resolve('./packages/core/src/index.ts'),
      '@glyphy/react': resolve('./packages/react/src/index.ts'),
      '@glyphy/motion': resolve('./packages/motion/src/index.ts'),
      '@glyphy/tailwind': resolve('./packages/tailwind/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/*/test/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['packages/*/src/**/index.ts', 'packages/tailwind/src/tokens.ts'],
      // The gate. Lowering a number here needs a reason in the pull request.
      thresholds: {
        statements: 95,
        branches: 92,
        functions: 95,
        lines: 95,
      },
    },
  },
});
