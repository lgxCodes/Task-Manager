import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm.tsx';

describe('TaskForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders all form fields', () => {
    render(<TaskForm {...defaultProps} />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty title', async () => {
    render(<TaskForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Create Task'));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('clears validation error when typing a title', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Create Task'));
    expect(screen.getByText('Title is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Title'), 'x');
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  it('submits with trimmed values', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), '  My Task  ');
    await user.type(screen.getByLabelText('Description'), '  Some desc  ');
    fireEvent.click(screen.getByText('Create Task'));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My Task',
      description: 'Some desc',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
    });
  });

  it('populates fields from initialData', () => {
    render(
      <TaskForm
        {...defaultProps}
        initialData={{
          title: 'Existing',
          description: 'Desc',
          status: 'done',
          priority: 'high',
          dueDate: '2025-06-15',
        }}
      />,
    );
    expect(screen.getByLabelText('Title')).toHaveValue('Existing');
    expect(screen.getByLabelText('Description')).toHaveValue('Desc');
    expect(screen.getByLabelText('Status')).toHaveValue('done');
    expect(screen.getByLabelText('Priority')).toHaveValue('high');
    expect(screen.getByLabelText('Due Date')).toHaveValue('2025-06-15');
  });

  it('uses custom submit label', () => {
    render(<TaskForm {...defaultProps} submitLabel="Save Changes" />);
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('calls onCancel directly when form is clean', () => {
    const onCancel = vi.fn();
    render(<TaskForm {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows confirm dialog when cancelling dirty form', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TaskForm {...defaultProps} onCancel={onCancel} />);

    await user.type(screen.getByLabelText('Title'), 'dirty');
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('confirm dialog "Discard" calls onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TaskForm {...defaultProps} onCancel={onCancel} />);

    await user.type(screen.getByLabelText('Title'), 'dirty');
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Discard'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('confirm dialog "Keep editing" keeps form open', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TaskForm {...defaultProps} onCancel={onCancel} />);

    await user.type(screen.getByLabelText('Title'), 'dirty');
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Keep editing'));

    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
  });

  it('reports dirty state via onDirtyChange', async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();
    render(<TaskForm {...defaultProps} onDirtyChange={onDirtyChange} />);

    expect(onDirtyChange).toHaveBeenCalledWith(false);

    await user.type(screen.getByLabelText('Title'), 'x');
    expect(onDirtyChange).toHaveBeenCalledWith(true);
  });
});
