import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  splitting: false,
  external: [
    'react',
    'react/jsx-runtime',
    'motion',
    'motion/react',
    '@glyphy/core',
    '@glyphy/react',
  ],
});
