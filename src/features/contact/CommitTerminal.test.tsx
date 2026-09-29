import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { CommitTerminal } from './CommitTerminal';
import { profile } from '@/content/profile';
import { RenderCounterBadge, RenderCounterProvider } from '@/features/render-counter/RenderCounter';

function renderTerminal() {
  return render(
    <RenderCounterProvider>
      <CommitTerminal />
      <RenderCounterBadge />
    </RenderCounterProvider>,
  );
}

async function fillValid() {
  await userEvent.type(screen.getByLabelText(/--author/), 'Ada Lovelace');
  await userEvent.type(screen.getByLabelText(/--email/), 'ada@example.com');
  await userEvent.type(screen.getByLabelText(/-m/), 'Loved the render cycle!');
}

describe('<CommitTerminal />', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows field errors and sends nothing when invalid', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderTerminal();
    await userEvent.click(screen.getByRole('button', { name: 'git push' }));
    expect(screen.getByLabelText(/--author/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Tell me your name')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prerenders a POST form with the push button disabled until hydrated, plus a no-JS LinkedIn fallback', () => {
    const html = renderToString(
      <RenderCounterProvider>
        <CommitTerminal />
      </RenderCounterProvider>,
    );
    const doc = document.createElement('div');
    doc.innerHTML = html;
    expect(doc.querySelector('form')).toHaveAttribute('method', 'post');
    expect(doc.querySelector('form')).not.toHaveAttribute('action');
    expect(doc.querySelector('button[type="submit"]')).toBeDisabled();
    expect(html).toMatch(/<p data-no-js-only=""[^>]*>.*LinkedIn.*<\/p>/s);
    expect(html).toContain(`href="${profile.links.linkedin}"`);
  });

  it('enables the push button once hydrated', () => {
    renderTerminal();
    expect(screen.getByRole('button', { name: 'git push' })).toBeEnabled();
  });

  it('has an accessible name for the form itself', () => {
    renderTerminal();
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
  });

  it('moves focus to the first invalid field (name) on an empty submit', async () => {
    renderTerminal();
    await userEvent.click(screen.getByRole('button', { name: 'git push' }));
    expect(screen.getByLabelText(/--author/)).toHaveFocus();
  });

  it('moves focus to the first invalid field in name → email → message order', async () => {
    renderTerminal();
    await userEvent.type(screen.getByLabelText(/--author/), 'Ada Lovelace');
    await userEvent.click(screen.getByRole('button', { name: 'git push' }));
    expect(screen.getByLabelText(/--email/)).toHaveFocus();
  });


  it('delivers, clears the form and counts a render', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 })));
    renderTerminal();
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: 'git push' }));
    expect(await screen.findByText(/delivered to trey\/main/)).toBeInTheDocument();
    expect(screen.getByLabelText(/-m/)).toHaveValue('');
    expect(screen.getByText('renders: 1')).toBeInTheDocument();
  });

  it('keeps the message and offers a fallback when the push is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 502 })));
    renderTerminal();
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: 'git push' }));
    expect(await screen.findByText(/push rejected/)).toBeInTheDocument();
    expect(screen.getByLabelText(/-m/)).toHaveValue('Loved the render cycle!');
    // The rejected push log offers LinkedIn; the other link is the no-JS fallback, which CSS hides under html.js.
    const links = screen.getAllByRole('link', { name: /LinkedIn/ });
    expect(links.filter((a) => !a.closest('[data-no-js-only]'))).toHaveLength(1);
  });

  it('submits with Ctrl+Enter from the message box', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    renderTerminal();
    await fillValid();
    await userEvent.type(screen.getByLabelText(/-m/), '{Control>}{Enter}{/Control}');
    expect(await screen.findByText(/delivered to trey\/main/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('hides the honeypot from people and the tab order', () => {
    renderTerminal();
    expect(document.querySelector('input[name="company"]')).toBeNull();
    const honeypot = document.querySelector<HTMLInputElement>('input[name="hp_url"]')!;
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
