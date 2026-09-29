import { afterEach, describe, expect, it, onTestFinished } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { CareerTree } from './CareerTree';
import { PINNABLE_QUERY } from './usePinnable';
import { experience } from '@/content/experience';
import { REDUCED_MOTION_QUERY } from '@/lib/usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

const recent = experience.filter((role) => role.era === 'recent');
const nodes = () => screen.getAllByRole('listitem').filter((li) => li.hasAttribute('data-state'));
const detailPane = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-career-detail]');
const html = document.documentElement;
const earlySummary = () => document.querySelector('summary')!;

/** Pinning needs JS running (html.js) and a large, tall viewport. */
function pinnable() {
  html.classList.add('js');
  mockMatchMedia([PINNABLE_QUERY]);
}

/** Element tags only, skipping the detail pane's swapped content: what could change layout between modes. */
function shape(el: Element): string {
  if (el.hasAttribute('data-career-detail')) return 'pane';
  return `${el.tagName}(${[...el.children].map(shape).join(',')})`;
}

describe('<CareerTree />', () => {
  afterEach(() => html.classList.remove('js'));

  it('headlines the career length and opens <Career>', () => {
    render(<CareerTree />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^\d+ years, one component tree\.$/);
    expect(screen.getByText(/<Career/)).toBeInTheDocument();
  });

  it('renders one markup whether pinned or static; CSS (the pinned: variant) switches the layout', () => {
    const { container, unmount } = render(<CareerTree />);
    const staticShape = shape(container);
    unmount();
    pinnable();
    const pinned = render(<CareerTree />);
    expect(pinned.container.querySelector('[data-pinned]')).not.toBeNull();
    expect(shape(pinned.container)).toBe(staticShape);
  });

  it("always renders the detail pane (shown only by the pinned: variant) and every node's highlights", () => {
    const { container } = render(<CareerTree />);
    const pane = detailPane(container)!;
    expect(pane).toHaveAttribute('aria-hidden', 'true');
    expect(pane).toHaveAttribute('inert');
    expect(pane).toHaveClass('hidden', 'pinned:block');
    nodes()
      .slice(0, recent.length)
      .forEach((node, i) => {
        const list = within(node).getByRole('list');
        expect(list.closest('.pinned\\:sr-only')).not.toBeNull();
        for (const highlight of recent[i]!.highlights) expect(within(list).getByText(highlight)).toBeInTheDocument();
      });
  });

  it('leaves the detail pane empty when static, so the prerendered HTML has no duplicate copy', () => {
    const { container } = render(<CareerTree />);
    expect(detailPane(container)).toBeEmptyDOMElement();
  });

  describe('pinned (html.js, large, tall viewport, motion allowed)', () => {
    it('mounts only the first role and shows its highlights in the detail pane', () => {
      pinnable();
      const { container } = render(<CareerTree />);
      const [first, second] = nodes();
      expect(first).toHaveAttribute('data-state', 'mounted');
      expect(second).toHaveAttribute('data-state', 'pending');
      const pane = detailPane(container)!;
      for (const highlight of recent[0]!.highlights) expect(pane).toHaveTextContent(highlight);
      expect(pane).not.toHaveTextContent(recent[1]!.highlights[0]!);
      expect(screen.getByText(/mounting 1 \/ 6/)).toBeInTheDocument();
    });

    it('lets the node list scroll natively (data-lenis-prevent) only while <EarlyCareer> is open', async () => {
      pinnable();
      const { container } = render(<CareerTree />);
      const list = container.querySelector('ol')!;
      expect(list).toHaveClass('pinned:overflow-y-auto');
      expect(list).not.toHaveAttribute('data-lenis-prevent');
      await userEvent.click(earlySummary());
      expect(list).toHaveAttribute('data-lenis-prevent');
      await userEvent.click(earlySummary());
      expect(list).not.toHaveAttribute('data-lenis-prevent');
    });

    it('honours an <EarlyCareer> opened before hydration (data-lenis-prevent once pinned)', async () => {
      let root: Root | undefined;
      const container = document.createElement('div');
      container.innerHTML = renderToString(<CareerTree />);
      document.body.appendChild(container);
      onTestFinished(() => {
        act(() => root?.unmount());
        container.remove();
      });
      const details = container.querySelector('details')!;
      details.open = true; // the visitor toggled it in the prerendered HTML, before the bundle hydrated
      await new Promise((r) => setTimeout(r, 0)); // let the pre-hydration toggle event fire, unheard
      pinnable();
      await act(async () => {
        root = hydrateRoot(container, <CareerTree />);
      });
      expect(container.querySelector('[data-pinned]')).not.toBeNull();
      expect(details.open).toBe(true);
      expect(container.querySelector('ol')).toHaveAttribute('data-lenis-prevent');
    });

    it('keeps an open <EarlyCareer> open when it stops pinning (no remount)', async () => {
      pinnable();
      render(<CareerTree />);
      const summary = earlySummary();
      await userEvent.click(summary);
      await act(async () => {
        html.classList.remove('js');
        await Promise.resolve();
      });
      expect(nodes()[0]!.closest('[data-pinned]')).toBeNull();
      expect(summary.closest('details')).toHaveAttribute('open');
      expect(summary.isConnected).toBe(true);
    });
  });

  describe('static (phones, tablets, short laptops, reduced motion, no html.js, prerender)', () => {
    it('mounts every role with no newest highlight and never prevents Lenis', async () => {
      const { container } = render(<CareerTree />);
      for (const node of nodes()) expect(node).toHaveAttribute('data-state', 'mounted');
      expect(container.querySelector('[data-pinned]')).toBeNull();
      await userEvent.click(earlySummary());
      expect(container.querySelector('[data-lenis-prevent]')).toBeNull();
    });

    it('is static under reduced motion even on a large, tall viewport', () => {
      html.classList.add('js');
      mockMatchMedia([PINNABLE_QUERY, REDUCED_MOTION_QUERY]);
      const { container } = render(<CareerTree />);
      for (const node of nodes()) expect(node).toHaveAttribute('data-state', 'mounted');
      expect(container.querySelector('[data-pinned]')).toBeNull();
    });

    it('is static without html.js (failsafe fired), even on a large, tall viewport', () => {
      mockMatchMedia([PINNABLE_QUERY]);
      const { container } = render(<CareerTree />);
      for (const node of nodes()) expect(node).toHaveAttribute('data-state', 'mounted');
      expect(container.querySelector('[data-pinned]')).toBeNull();
    });
  });

  it('keeps the six early roles in a collapsible <EarlyCareer> node', async () => {
    render(<CareerTree />);
    const summary = earlySummary();
    const details = summary.closest('details')!;
    expect(details).not.toHaveAttribute('open');
    await userEvent.click(summary);
    expect(details).toHaveAttribute('open');
    expect(within(details).getByText('Firesquire.com')).toBeInTheDocument();
    expect(within(details).getByText('May 2006 – Jan 2009')).toBeInTheDocument();
  });
});
