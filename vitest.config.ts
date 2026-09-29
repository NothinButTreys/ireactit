import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/content/**', 'src/features/**/use*.ts', 'src/features/**/server/**'],
      // sendContactEmail.ts is thin Resend wiring with no unit test in Task 5's brief; it is
      // exercised by the Task 7 e2e/DITL suite instead.
      exclude: ['**/*.test.*', 'src/features/contact/server/sendContactEmail.ts'],
      thresholds: { lines: 90 },
    },
  },
});
