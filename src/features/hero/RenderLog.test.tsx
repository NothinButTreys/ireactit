import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { RenderLog } from './RenderLog';

vi.mock('@/features/nav/SectionProgress', () => ({
  useSectionProgress: () => ({ active: 'write', visited: new Set(['mount', 'write']) }),
}));

describe('<RenderLog />', () => {
  it('lists every step with its component and marks visited ones rendered', () => {
    render(<RenderLog />);
    const log = screen.getByRole('complementary', { name: 'Render log' });
    expect(within(log).getByText('2 / 5 committed')).toBeInTheDocument();
    const rows = within(log).getAllByRole('listitem');
    expect(rows.map((r) => r.textContent)).toEqual([
      'mount<Trey />✓ rendered',
      'write<TreyTsx />✓ rendered',
      'tree<Career />pending',
      'props<Projects />pending',
      'commit<Contact />pending',
    ]);
  });
});
