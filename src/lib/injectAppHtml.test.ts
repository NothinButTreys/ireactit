import { describe, expect, it } from 'vitest';
import { injectAppHtml } from './injectAppHtml';

describe('injectAppHtml', () => {
  it('replaces the marker inside #root with the prerendered app', () => {
    const template = '<div id="root"><!--app-html--></div>';
    expect(injectAppHtml(template, '<h1>hi</h1>')).toBe('<div id="root"><h1>hi</h1></div>');
  });

  it('does not interpret $ patterns in the app html', () => {
    const out = injectAppHtml('<!--app-html-->', 'costs $& and $1');
    expect(out).toBe('costs $& and $1');
  });

  it('fails loudly when the marker is missing', () => {
    expect(() => injectAppHtml('<div id="root"></div>', 'x')).toThrow('<!--app-html--> marker missing');
  });
});
