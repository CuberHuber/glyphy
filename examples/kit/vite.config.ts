import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const source = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    // Run the example against the packages' TypeScript sources, so a change in
    // the library shows up here without a build step in between.
    alias: {
      '@glyphy/core': source('../../packages/core/src/index.ts'),
      '@glyphy/react': source('../../packages/react/src/index.ts'),
      '@glyphy/motion': source('../../packages/motion/src/index.ts'),
      '@glyphy/tailwind': source('../../packages/tailwind/src/index.ts'),
    },
  },
});
