import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { devApi } from './vite-plugins/devApi';
import { sourceSnippets } from './vite-plugins/sourceSnippets';

export default defineConfig(({ mode }) => {
  // Make .env / .env.local visible to server-side code (the dev API) the same way Vercel does.
  Object.assign(process.env, { ...loadEnv(mode, process.cwd(), ''), ...process.env });
  return {
    plugins: [react(), tailwindcss(), devApi(), sourceSnippets()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  };
});
