import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

describe('<ThemeToggle />', () => {
  it('defaults to dark when the system does not prefer light', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('switches to light, writes data-theme and persists the choice', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(await screen.findByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });

  it('respects an explicit data-theme set before mount', () => {
    document.documentElement.dataset.theme = 'light';
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });
});
