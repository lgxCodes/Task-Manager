import { useState, useMemo } from 'react';
import type { Task, Status } from '../../types/index.ts';
import { STATUSES, STATUS_LABELS } from '../../types/index.ts';
import { Column } from '../Column/Column.tsx';

type BoardProps = {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: Status) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (taskId: string) => void;
};

const tabColors = {
  'todo': 'border-todo text-todo',
  'in-progress': 'border-in-progress text-in-progress',
  'done': 'border-done text-done',
} as const;

export function Board({
  tasks,
  onMoveTask,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
}: BoardProps) {
  const [activeTab, setActiveTab] = useState<Status>('todo');

  const grouped = useMemo(() => {
    const map: Record<Status, Task[]> = { 'todo': [], 'in-progress': [], 'done': [] };
    for (const t of tasks) {
      map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  return (
    <>
      {/* Mobile tabs */}
      <div className="flex sm:hidden border-b border-border bg-surface sticky top-12.25 z-5" role="tablist">
        {STATUSES.map((status) => (
          <button
            key={status}
            role="tab"
            aria-selected={activeTab === status}
            onClick={() => setActiveTab(status)}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide bg-transparent border-b-2 cursor-pointer transition-colors ${
              activeTab === status
                ? tabColors[status]
                : 'border-transparent text-text-muted'
            }`}
          >
            {STATUS_LABELS[status]} ({grouped[status].length})
          </button>
        ))}
      </div>

      {/* Mobile: single column */}
      <div className="sm:hidden p-4 flex-1" role="tabpanel">
        <Column
          status={activeTab}
          tasks={grouped[activeTab]}
          onDropTask={onMoveTask}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
        />
      </div>

      {/* Tablet/Desktop: grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6 p-6 flex-1">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={grouped[status]}
            onDropTask={onMoveTask}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </>
  );
}
