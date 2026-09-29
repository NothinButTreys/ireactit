import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionProgressProvider, useSectionProgress } from './SectionProgress';

const active = vi.hoisted(() => ({ current: 'mount' }));
vi.mock('./useActiveSection', () => ({ useActiveSection: () => active.current }));

function Probe() {
  const { active: now, visited } = useSectionProgress();
  return (
    <p>
      {now}|{[...visited].join(',')}
    </p>
  );
}

describe('SectionProgress', () => {
  it('exposes the active section and accumulates every section visited', () => {
    active.current = 'mount';
    const { rerender } = render(
      <SectionProgressProvider>
        <Probe />
      </SectionProgressProvider>,
    );
    expect(screen.getByText('mount|mount')).toBeInTheDocument();
    active.current = 'tree';
    rerender(
      <SectionProgressProvider>
        <Probe />
      </SectionProgressProvider>,
    );
    expect(screen.getByText('tree|mount,tree')).toBeInTheDocument();
  });

  it('throws a helpful error outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow('useSectionProgress must be used inside <SectionProgressProvider>');
    spy.mockRestore();
  });
});
