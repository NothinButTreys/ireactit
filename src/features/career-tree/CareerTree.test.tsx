import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CareerTree } from './CareerTree';
import { REDUCED_MOTION_QUERY } from '@/lib/usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

const nodes = () => screen.getAllByRole('listitem').filter((li) => li.hasAttribute('data-state'));

describe('<CareerTree />', () => {
  it('headlines the career length and opens <Career>', () => {
    render(<CareerTree />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^\d+ years, one component tree\.$/);
    expect(screen.getByText(/<Career/)).toBeInTheDocument();
  });

  it('when scroll-driven, mounts only the first role and expands only the newest one', () => {
    render(<CareerTree />);
    const [first, second] = nodes();
    expect(first).toHaveAttribute('data-state', 'mounted');
    expect(second).toHaveAttribute('data-state', 'pending');
    expect(within(first!).getByText(/Daggerheart Card Creator/)).toBeVisible();
    expect(within(second!).queryByRole('list')).not.toBeInTheDocument();
  });

  it('under reduced motion, mounts and expands every role', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    render(<CareerTree />);
    for (const node of nodes()) expect(node).toHaveAttribute('data-state', 'mounted');
    expect(screen.getByText(/Owned technical breakdowns/)).toBeInTheDocument();
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
