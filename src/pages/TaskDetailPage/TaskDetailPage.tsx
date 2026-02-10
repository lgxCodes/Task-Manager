import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTasks } from '../../hooks/useTasks.ts';
import { useToast } from '../../hooks/useToast.ts';
import { TaskForm } from '../../components/TaskForm/TaskForm.tsx';
import { Button, LoadingSpinner, ErrorMessage, ConfirmDialog } from '../../components/ui/index.ts';
import { STATUS_LABELS, PRIORITY_LABELS, STATUSES } from '../../types/index.ts';
import type { CreateTaskInput, Status } from '../../types/index.ts';
import { isOverdue, badgeStyles, priorityColors } from '../../utils/task.ts';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading, error, fetchTasks, updateTask, deleteTask, restoreTask, moveTask, getTaskById } = useTasks();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, [tasks.length, fetchTasks]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (isEditing && isFormDirty) {
          setShowLeaveConfirm(true);
        } else {
          navigate('/');
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, isFormDirty, navigate]);

  const task = id ? getTaskById(id) : undefined;

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <ErrorMessage message={error} onRetry={fetchTasks} />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="text-center p-8">
          <h2>Task not found</h2>
          <Link to="/" className="text-accent no-underline text-sm hover:underline">
            Back to Board
          </Link>
        </div>
      </div>
    );
  }

  async function handleUpdate(data: CreateTaskInput) {
    if (!id) return;
    const success = await updateTask(id, data);
    if (success) {
      setIsEditing(false);
      showToast('Task updated');
    } else {
      showToast('Failed to update task', 'error');
    }
  }

  async function handleMove(newStatus: Status) {
    if (!id) return;
    const success = await moveTask(id, newStatus);
    if (success) {
      showToast(`Task moved to ${STATUS_LABELS[newStatus]}`);
    } else {
      showToast('Failed to move task', 'error');
    }
  }

  async function handleDelete() {
    if (!id || !task) return;
    const taskCopy = { ...task };
    const success = await deleteTask(id);
    if (success) {
      navigate('/');
      showToast('Task deleted', 'success', {
        label: 'Undo',
        onClick: () => restoreTask(taskCopy),
      });
    } else {
      showToast('Failed to delete task', 'error');
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-175 mx-auto">
        <button
          type="button"
          onClick={() => {
            if (isEditing && isFormDirty) {
              setShowLeaveConfirm(true);
              return;
            }
            navigate('/');
          }}
          className="inline-block text-accent no-underline text-sm mb-6 hover:underline bg-transparent border-none cursor-pointer p-0 font-[inherit]"
        >
          &larr; Back to Board
        </button>

        {isEditing ? (
          <div className="bg-surface rounded-xl p-4 sm:p-6">
            <h2 className="m-0 mb-4 text-xl">Edit Task</h2>
            <TaskForm
              initialData={{
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              onDirtyChange={setIsFormDirty}
              submitLabel="Save Changes"
            />
          </div>
        ) : (
          <div className="bg-surface rounded-xl p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="m-0 text-xl sm:text-2xl font-bold wrap-break-word min-w-0">{task.title}</h1>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded uppercase tracking-wide whitespace-nowrap ${badgeStyles[task.status]}`}
              >
                {STATUS_LABELS[task.status]}
              </span>
            </div>

            {task.description && (
              <p className="text-text-primary leading-relaxed m-0 mb-6 whitespace-pre-wrap wrap-break-word">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-6">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Priority:</span>
                <span className={`font-semibold ${priorityColors[task.priority]}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Due:</span>
                  <span className={`font-semibold ${isOverdue(task.dueDate) ? 'text-danger' : 'text-text-primary'}`}>
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(task.dueDate + 'T00:00:00'))}
                    {isOverdue(task.dueDate) && ' (Overdue)'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 text-sm text-text-muted mb-6 pt-4 border-t border-border">
              <span>
                Created: {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(task.createdAt))}
              </span>
              <span>
                Updated: {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(task.updatedAt))}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm mb-6 pt-4 border-t border-border">
              <span className="text-text-muted">Status:</span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { if (s !== task.status) handleMove(s); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    s === task.status
                      ? `${badgeStyles[s]} border border-current cursor-default`
                      : 'bg-bg border border-border text-text-primary cursor-pointer hover:border-accent'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Unsaved changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={() => {
          setShowLeaveConfirm(false);
          navigate('/');
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete task"
        message={`Are you sure you want to delete ${task.title}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
