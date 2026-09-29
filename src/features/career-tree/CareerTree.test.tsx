import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CareerTree } from './CareerTree';
import { PINNABLE_QUERY } from './usePinnable';
import { experience } from '@/content/experience';
import { REDUCED_MOTION_QUERY } from '@/lib/usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

const recent = experience.filter((role) => role.era === 'recent');
const nodes = () => screen.getAllByRole('listitem').filter((li) => li.hasAttribute('data-state'));
const detailPanes = (container: HTMLElement) => container.querySelectorAll('[data-career-detail]');

describe('<CareerTree />', () => {
  it('headlines the career length and opens <Career>', () => {
    render(<CareerTree />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^\d+ years, one component tree\.$/);
    expect(screen.getByText(/<Career/)).toBeInTheDocument();
  });

  describe('pinned (large, tall viewport with motion allowed)', () => {
    it('mounts only the first role and shows its highlights in the detail pane', () => {
      mockMatchMedia([PINNABLE_QUERY]);
      const { container } = render(<CareerTree />);
      const [first, second] = nodes();
      expect(first).toHaveAttribute('data-state', 'mounted');
      expect(second).toHaveAttribute('data-state', 'pending');
      const panes = detailPanes(container);
      expect(panes).toHaveLength(1);
      const pane = panes[0] as HTMLElement;
      expect(pane).toHaveAttribute('aria-hidden', 'true');
      expect(pane).toHaveAttribute('inert');
      for (const highlight of recent[0]!.highlights) expect(pane).toHaveTextContent(highlight);
      expect(pane).not.toHaveTextContent(recent[1]!.highlights[0]!);
      expect(screen.getByText(/mounting 1 \/ 6/)).toBeInTheDocument();
    });

    it("keeps every role's highlights in the DOM, visually hidden inside its node", () => {
      mockMatchMedia([PINNABLE_QUERY]);
      render(<CareerTree />);
      const roleNodes = nodes().slice(0, recent.length);
      recent.forEach((role, i) => {
        const node = roleNodes[i]!;
        const list = within(node).getByRole('list');
        expect(list.closest('.sr-only')).not.toBeNull();
        for (const highlight of role.highlights) expect(within(list).getByText(highlight)).toBeInTheDocument();
      });
    });

    it('lets the node list scroll inside the stage instead of growing it', () => {
      mockMatchMedia([PINNABLE_QUERY]);
      const { container } = render(<CareerTree />);
      const list = container.querySelector('ol[data-lenis-prevent]');
      expect(list).not.toBeNull();
      expect(list).toHaveClass('overflow-y-auto');
    });
  });

  describe('static (phones, tablets, short laptops, reduced motion, prerender)', () => {
    it('mounts every role and shows its highlights inline with no detail pane', () => {
      const { container } = render(<CareerTree />);
      for (const node of nodes()) expect(node).toHaveAttribute('data-state', 'mounted');
      expect(detailPanes(container)).toHaveLength(0);
      for (const role of recent) {
        for (const highlight of role.highlights) {
          const item = screen.getByText(highlight);
          expect(item.closest('.sr-only')).toBeNull();
        }
      }
    });

    it('is static under reduced motion even on a large, tall viewport', () => {
      mockMatchMedia([PINNABLE_QUERY, REDUCED_MOTION_QUERY]);
      const { container } = render(<CareerTree />);
      for (const node of nodes()) expect(node).toHaveAttribute('data-state', 'mounted');
      expect(detailPanes(container)).toHaveLength(0);
      expect(screen.getByText(/Owned technical breakdowns/).closest('.sr-only')).toBeNull();
    });
  });

  it('keeps the six early roles in a collapsible <EarlyCareer> node', async () => {
    render(<CareerTree />);
    const summary = screen.getByText(/<EarlyCareer/).closest('summary')!;
    const details = summary.closest('details')!;
    expect(details).not.toHaveAttribute('open');
    await userEvent.click(summary);
    expect(details).toHaveAttribute('open');
    expect(within(details).getByText('Firesquire.com')).toBeInTheDocument();
    expect(within(details).getByText('May 2006 – Jan 2009')).toBeInTheDocument();
  });
});
