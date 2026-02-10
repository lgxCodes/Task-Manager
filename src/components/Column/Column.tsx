import { useState, useRef, useCallback } from 'react';
import type { Task, Status } from '../../types/index.ts';
import { STATUS_LABELS } from '../../types/index.ts';
import { TaskCard } from '../TaskCard/TaskCard.tsx';
import { EmptyState } from '../ui/index.ts';

type ColumnProps = {
  status: Status;
  tasks: Task[];
  onDropTask: (taskId: string, newStatus: Status) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (taskId: string) => void;
};

export function Column({
  status,
  tasks,
  onDropTask,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOver(true);
  }

  function handleDragLeave() {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  }

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const dragHandlers = selectionMode
    ? {}
    : {
        onDragOver: handleDragOver,
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      };

  return (
    <div
      className={`bg-column-bg rounded-xl p-4 min-h-50 flex flex-col transition-all duration-200 overflow-hidden min-w-0 ${isDragOver && !selectionMode ? 'bg-column-hover outline-2 outline-dashed outline-accent -outline-offset-2 scale-[1.01]' : ''}`}
      {...dragHandlers}
    >
      <div className="flex items-center justify-between mb-4 px-1 gap-2">
        <h2 className="m-0 text-sm font-bold uppercase tracking-wider text-text-muted">
          {STATUS_LABELS[status]}
        </h2>
        <span className="text-xs font-semibold bg-surface px-2 py-0.5 rounded text-text-muted">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {tasks.length === 0 ? (
          <EmptyState message="No tasks" />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              selectionMode={selectionMode}
              isSelected={selectedIds?.has(task.id) ?? false}
              onToggleSelect={onToggleSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
