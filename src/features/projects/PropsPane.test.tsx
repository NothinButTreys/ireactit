import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropsPane } from './PropsPane';
import { projects } from '@/content/projects';

const project = projects[0]!;

describe('<PropsPane />', () => {
  it('shows the project props at the root and prompts to pick a node', () => {
    render(<PropsPane project={project} selected="root" onSelect={() => {}} />);
    expect(screen.getByText('stack')).toBeInTheDocument();
    expect(screen.getByText(/Select a node/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open the Card Creator/ })).toHaveAttribute('href', project.links[0]!.href);
  });

  it('shows the selected node state and steps to neighbours', async () => {
    const onSelect = vi.fn();
    render(<PropsPane project={project} selected="architecture" onSelect={onSelect} />);
    expect(screen.getByText(project.nodes.architecture.body)).toBeInTheDocument();
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /HardParts/ }));
    expect(onSelect).toHaveBeenCalledWith('hardParts');
    await userEvent.click(screen.getByRole('button', { name: /MyRole/ }));
    expect(onSelect).toHaveBeenCalledWith('myRole');
  });
});
