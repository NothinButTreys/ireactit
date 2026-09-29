import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Nav } from './Nav';
import { SectionProgressProvider } from './SectionProgress';
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { ViewSourceProvider } from '@/features/view-source/ViewSource';

vi.mock('./useActiveSection', () => ({ useActiveSection: () => 'tree' }));

function renderNav() {
  return render(
    <RenderCounterProvider>
      <ViewSourceProvider>
        <SectionProgressProvider>
          <Nav />
        </SectionProgressProvider>
      </ViewSourceProvider>
    </RenderCounterProvider>,
  );
}

describe('<Nav />', () => {
  it('renders the render-cycle rail twice (desktop bar + mobile pill), in order, with hash links', () => {
    renderNav();
    const rails = screen.getAllByRole('navigation', { name: 'Render cycle' });
    expect(rails).toHaveLength(2);
    for (const rail of rails) {
      const links = within(rail).getAllByRole('link');
      expect(links.map((l) => l.getAttribute('href'))).toEqual(['#mount', '#write', '#tree', '#props', '#commit']);
      expect(links.map((l) => l.textContent)).toEqual(['mount', 'write', 'tree', 'props', 'commit']);
    }
  });

  it('marks the active step with aria-current in both rails', () => {
    renderNav();
    for (const link of screen.getAllByRole('link', { name: 'tree' })) {
      expect(link).toHaveAttribute('aria-current', 'location');
    }
    for (const link of screen.getAllByRole('link', { name: 'mount' })) {
      expect(link).not.toHaveAttribute('aria-current');
    }
  });

  it('offers a skip link to the main content first', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveTextContent('Skip to content');
    expect(links[0]).toHaveAttribute('href', '#main');
  });

  it('shows the wordmark, the toggles and the render counter', () => {
    renderNav();
    expect(screen.getByRole('link', { name: '<IReactIt/>' })).toHaveAttribute('href', '#mount');
    expect(screen.getByRole('button', { name: 'View source' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /theme/ })).toBeInTheDocument();
    expect(screen.getByText('renders: 0')).toBeInTheDocument();
  });
});
