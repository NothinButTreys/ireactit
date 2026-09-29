import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { sourceSnippets } from './vite-plugins/sourceSnippets.ts';

export default defineConfig({
  plugins: [react(), sourceSnippets()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/content/**', 'src/features/**/*.ts', 'src/features/**/server/**'],
      exclude: ['**/*.test.*', 'src/content/snippets/**'],
      thresholds: { lines: 90 },
    },
  },
});
