import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Board } from './Board.tsx';
import type { Task } from '../../types/index.ts';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Test task',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderBoard(tasks: Task[], props: Partial<Parameters<typeof Board>[0]> = {}) {
  return render(
    <MemoryRouter>
      <Board
        tasks={tasks}
        onMoveTask={props.onMoveTask ?? vi.fn()}
        selectionMode={props.selectionMode}
        selectedIds={props.selectedIds}
        onToggleSelect={props.onToggleSelect}
      />
    </MemoryRouter>,
  );
}

describe('Board', () => {
  it('renders three columns on desktop with correct counts', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'todo' }),
      makeTask({ id: '3', status: 'in-progress' }),
      makeTask({ id: '4', status: 'done' }),
    ];
    renderBoard(tasks);

    expect(screen.getAllByRole('heading', { name: 'To Do' })).toHaveLength(2);
    expect(screen.getAllByRole('heading', { name: 'In Progress' })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: 'Done' })).toHaveLength(1);
  });

  it('shows task counts in mobile tabs', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'todo' }),
      makeTask({ id: '3', status: 'done' }),
    ];
    renderBoard(tasks);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('To Do (2)');
    expect(tabs[1]).toHaveTextContent('In Progress (0)');
    expect(tabs[2]).toHaveTextContent('Done (1)');
  });

  it('switches active tab on click', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo', title: 'Todo task' }),
      makeTask({ id: '2', status: 'done', title: 'Done task' }),
    ];
    renderBoard(tasks);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('renders empty state when a column has no tasks', () => {
    renderBoard([]);
    const empties = screen.getAllByText('No tasks');
    expect(empties.length).toBeGreaterThanOrEqual(1);
  });

  it('renders task cards for each task', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo', title: 'First' }),
      makeTask({ id: '2', status: 'todo', title: 'Second' }),
    ];
    renderBoard(tasks);
    expect(screen.getAllByText('First').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Second').length).toBeGreaterThanOrEqual(1);
  });
});
