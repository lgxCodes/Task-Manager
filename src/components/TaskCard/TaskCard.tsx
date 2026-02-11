import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Task } from '../../types/index.ts';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../types/index.ts';
import { isOverdue, badgeStyles, priorityColors } from '../../utils/task.ts';

type TaskCardProps = {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (taskId: string) => void;
};

const borderColors = {
  'todo': 'border-l-todo',
  'in-progress': 'border-l-in-progress',
  'done': 'border-l-done',
} as const;

export const TaskCard = memo(function TaskCard({
  task,
  onDragStart,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: TaskCardProps) {
  const overdueClass = isOverdue(task.dueDate) ? 'ring-1 ring-danger/30' : '';
  const selectedClass = isSelected ? 'ring-2 ring-accent' : '';

  return (
    <Link
      to={`/task/${task.id}`}
      className="no-underline text-inherit block"
      draggable={!selectionMode}
      onDragStart={selectionMode ? undefined : (e) => onDragStart(e, task.id)}
      onClick={(e) => {
        if (selectionMode) {
          e.preventDefault();
          onToggleSelect?.(task.id);
        }
      }}
      onKeyDown={(e) => {
        if (selectionMode && e.key === ' ') {
          e.preventDefault();
          onToggleSelect?.(task.id);
        }
      }}
    >
      <div
        className={`bg-card rounded-lg p-4 border-l-4 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden animate-[card-enter_200ms_ease-out] ${borderColors[task.status]} ${overdueClass} ${selectedClass} ${selectionMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
      >
        {selectionMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="accent-accent float-right mt-0.5 ml-2 w-4 h-4 pointer-events-none"
            tabIndex={-1}
          />
        )}
        <h3 className="m-0 mb-1 text-[0.95rem] font-semibold wrap-break-word">{task.title}</h3>
        {task.description && (
          <p className="m-0 mb-2 text-sm text-text-muted leading-relaxed wrap-break-word line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span
            className={`text-[0.7rem] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${badgeStyles[task.status]}`}
          >
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`text-[0.7rem] font-semibold ${priorityColors[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
        {task.dueDate && (
          <div className="mt-2 text-xs">
            <span className={isOverdue(task.dueDate) ? 'text-danger font-bold' : 'text-text-muted'}>
              {isOverdue(task.dueDate) ? 'OVERDUE \u2022 ' : 'Due '}
              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(task.dueDate + 'T00:00:00'))}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
});
