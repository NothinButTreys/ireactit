import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'dist-server', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    plugins: { 'react-refresh': reactRefresh },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowExportNames: ['useRenderCount', 'useViewSource', 'useBump', 'useSectionProgress', 'NAV_OFFSET'] },
      ],
    },
  },
  {
    // Test-only "probe" components intentionally mutate an outer render counter to observe
    // re-render behaviour (a standard React Testing Library pattern). The React Compiler
    // purity rules from react-hooks/recommended are meant for shipped components, not these.
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/globals': 'off',
    },
  },
  {
    // Server-chain files: Vercel compiles functions without Vite's resolver, so
    // these must use relative imports with `.js` extensions and never `@/`.
    // See .superpowers/sdd/global-constraints.md.
    files: [
      'api/**/*.ts',
      'src/features/contact/server/**/*.ts',
      'src/lib/contactSchema.ts',
      'src/lib/rateLimit.ts',
      'src/lib/safeEqual.ts',
    ],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*'],
              message:
                'Server-chain files must use relative imports with .js extensions, never the @/ alias (Vercel compiles functions without Vite\'s resolver). See .superpowers/sdd/global-constraints.md.',
            },
          ],
        },
      ],
    },
  },
]);
