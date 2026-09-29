import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SECTION_HEADERS } from '@/content/sections';
import { SectionHeader } from './SectionHeader';

describe('<SectionHeader />', () => {
  it('renders the num, step and content title/sub for a step', () => {
    render(<SectionHeader step="write" />);
    const { num, title, sub } = SECTION_HEADERS.write;
    expect(screen.getByText(num)).toBeInTheDocument();
    expect(screen.getByText('write')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 2, name: title });
    expect(heading).toHaveAttribute('id', 'write-title');
    expect(screen.getByText(sub!)).toBeInTheDocument();
  });

  it('honours a title override while keeping the content num/sub', () => {
    render(<SectionHeader step="tree" title="One component tree." />);
    expect(screen.getByRole('heading', { level: 2, name: 'One component tree.' })).toHaveAttribute(
      'id',
      'tree-title',
    );
    expect(screen.getByText(SECTION_HEADERS.tree.num)).toBeInTheDocument();
    expect(screen.getByText(SECTION_HEADERS.tree.sub!)).toBeInTheDocument();
  });
});
