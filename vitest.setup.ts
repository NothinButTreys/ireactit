import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { matchMediaFor } from './src/test/matchMedia';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: matchMediaFor() });
}

// jsdom has no IntersectionObserver; a no-op default keeps components that observe sections renderable.
// Tests that exercise observation install their own fake.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// jsdom's <dialog> support is partial; model showModal/close deterministically (close fires 'close').
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

afterEach(() => {
  cleanup();
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    window.matchMedia = matchMediaFor();
  }
});
