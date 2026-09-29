import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import 'lenis/dist/lenis.css';
import './styles.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('#root missing from index.html');

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is prerendered, so hydrate; `vite dev` serves only the marker comment, so render.
if (container.firstElementChild) {
  hydrateRoot(container, app, {
    onRecoverableError: (error, info) => console.error('[hydration]', error, info.componentStack),
  });
} else {
  createRoot(container).render(app);
}
document.documentElement.classList.add('hydrated');
