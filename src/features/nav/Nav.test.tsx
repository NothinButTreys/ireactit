import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Nav } from './Nav';
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { ViewSourceProvider } from '@/features/view-source/ViewSource';

vi.mock('./useActiveSection', () => ({ useActiveSection: () => 'tree' }));

function renderNav() {
  return render(
    <RenderCounterProvider>
      <ViewSourceProvider>
        <Nav />
      </ViewSourceProvider>
    </RenderCounterProvider>,
  );
}

describe('<Nav />', () => {
  it('renders the lifecycle rail in render-cycle order with hash links', () => {
    renderNav();
    const rail = screen.getByRole('navigation', { name: 'Render cycle' });
    const links = within(rail).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['#mount', '#write', '#tree', '#props', '#commit']);
    expect(links.map((l) => l.textContent)).toEqual(['mount', 'write', 'tree', 'props', 'commit']);
  });

  it('marks the active step with aria-current', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'tree' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'mount' })).not.toHaveAttribute('aria-current');
  });

  it('shows the wordmark, the toggles and the render counter', () => {
    renderNav();
    expect(screen.getByRole('link', { name: '<IReactIt/>' })).toHaveAttribute('href', '#mount');
    expect(screen.getByRole('button', { name: 'View source' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /theme/ })).toBeInTheDocument();
    expect(screen.getByText('renders: 0')).toBeInTheDocument();
  });
});
