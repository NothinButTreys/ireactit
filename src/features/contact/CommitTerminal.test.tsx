import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommitTerminal } from './CommitTerminal';
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
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toBeInTheDocument();
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
    const honeypot = document.querySelector<HTMLInputElement>('input[name="company"]')!;
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
