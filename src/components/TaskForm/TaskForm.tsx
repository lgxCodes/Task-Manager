import { useState, useEffect, useMemo } from 'react';
import type { CreateTaskInput, Status, Priority } from '../../types/index.ts';
import { STATUSES, STATUS_LABELS, PRIORITIES, PRIORITY_LABELS } from '../../types/index.ts';
import { Button, ConfirmDialog } from '../ui/index.ts';

type TaskFormProps = {
  initialData?: {
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    dueDate: string | null;
  };
  onSubmit: (data: CreateTaskInput) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  submitLabel?: string;
};

const inputClasses =
  'w-full px-3 py-2 border border-border rounded-lg text-sm font-[inherit] bg-bg text-text-primary transition-colors focus:outline-none focus:border-accent';

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  onDirtyChange,
  submitLabel = 'Create Task',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [status, setStatus] = useState<Status>(initialData?.status ?? 'todo');
  const [priority, setPriority] = useState<Priority>(initialData?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [titleError, setTitleError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isDirty = useMemo(() => {
    const init = initialData;
    return (
      title !== (init?.title ?? '') ||
      description !== (init?.description ?? '') ||
      status !== (init?.status ?? 'todo') ||
      priority !== (init?.priority ?? 'medium') ||
      dueDate !== (init?.dueDate ?? '')
    );
  }, [title, description, status, priority, dueDate, initialData]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  function handleCancel() {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      onCancel();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Title is required');
      return;
    }

    setTitleError('');
    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || null,
    });
  }

  return (
    <>
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-text-muted" htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          className={`${inputClasses} ${titleError ? 'border-danger' : ''}`}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
          placeholder="Enter task title"
        />
        {titleError && <span className="text-xs text-danger">{titleError}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-text-muted" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          className={`${inputClasses} resize-y min-h-15`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-semibold text-text-muted" htmlFor="task-status">
            Status
          </label>
          <select
            id="task-status"
            className={`${inputClasses} cursor-pointer`}
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-semibold text-text-muted" htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            className={`${inputClasses} cursor-pointer`}
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-text-muted" htmlFor="task-due-date">
          Due Date
        </label>
        <input
          id="task-due-date"
          className={inputClasses}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <Button type="submit">{submitLabel}</Button>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>

    <ConfirmDialog
      isOpen={showConfirm}
      title="Unsaved changes"
      message="You have unsaved changes. Are you sure you want to discard them?"
      confirmLabel="Discard"
      cancelLabel="Keep editing"
      onConfirm={() => {
        setShowConfirm(false);
        onCancel();
      }}
      onCancel={() => setShowConfirm(false)}
    />
    </>
  );
}
