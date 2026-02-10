import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TaskCard } from './TaskCard.tsx';
import type { Task } from '../../types/index.ts';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    title: 'Test task',
    description: 'A description',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderCard(task: Task, props: Partial<Parameters<typeof TaskCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <TaskCard
        task={task}
        onDragStart={props.onDragStart ?? vi.fn()}
        selectionMode={props.selectionMode}
        isSelected={props.isSelected}
        onToggleSelect={props.onToggleSelect}
      />
    </MemoryRouter>,
  );
}

describe('TaskCard', () => {
  it('renders title, description, status, and priority', () => {
    renderCard(makeTask({ title: 'My Task', description: 'Details here', status: 'in-progress', priority: 'high' }));
    expect(screen.getByText('My Task')).toBeInTheDocument();
    expect(screen.getByText('Details here')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('hides description when empty', () => {
    renderCard(makeTask({ description: '' }));
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('links to the task detail page', () => {
    renderCard(makeTask({ id: 'abc-123' }));
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/task/abc-123');
  });

  it('shows due date when present', () => {
    renderCard(makeTask({ dueDate: '2025-12-25' }));
    expect(screen.getByText(/Dec 25/)).toBeInTheDocument();
  });

  it('shows overdue indicator for past dates', () => {
    renderCard(makeTask({ dueDate: '2020-01-01' }));
    expect(screen.getByText(/OVERDUE/)).toBeInTheDocument();
  });

  it('does not show due date section when null', () => {
    renderCard(makeTask({ dueDate: null }));
    expect(screen.queryByText(/Due/)).not.toBeInTheDocument();
    expect(screen.queryByText(/OVERDUE/)).not.toBeInTheDocument();
  });

  describe('selection mode', () => {
    it('shows checkbox when selection mode is on', () => {
      renderCard(makeTask(), { selectionMode: true });
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('does not show checkbox when selection mode is off', () => {
      renderCard(makeTask(), { selectionMode: false });
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('calls onToggleSelect on click in selection mode', () => {
      const onToggle = vi.fn();
      renderCard(makeTask({ id: 'sel-1' }), {
        selectionMode: true,
        onToggleSelect: onToggle,
      });
      fireEvent.click(screen.getByRole('link'));
      expect(onToggle).toHaveBeenCalledWith('sel-1');
    });

    it('checkbox reflects isSelected prop', () => {
      renderCard(makeTask(), { selectionMode: true, isSelected: true });
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });
});
