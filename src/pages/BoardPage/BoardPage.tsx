import { useEffect, useState, useMemo, useCallback, useDeferredValue } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasks } from '../../hooks/useTasks.ts';
import { useToast } from '../../hooks/useToast.ts';
import { Board } from '../../components/Board/Board.tsx';
import { Header } from '../../components/Header/Header.tsx';
import { SearchFilterBar } from '../../components/SearchFilterBar/SearchFilterBar.tsx';
import type { SortOrder } from '../../components/SearchFilterBar/SearchFilterBar.tsx';
import { TaskForm } from '../../components/TaskForm/TaskForm.tsx';
import { Modal, ErrorMessage } from '../../components/ui/index.ts';
import { STATUS_LABELS, PRIORITIES } from '../../types/index.ts';
import type { CreateTaskInput, Status, Priority } from '../../types/index.ts';

export function BoardPage() {
  const {
    tasks, error, fetchTasks, addTask, moveTask,
    exportTasksToJson, importTasksFromJson,
    batchDeleteTasks, batchMoveTasks, batchRestoreTasks,
  } = useTasks();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(() => {
    const param = searchParams.get('priority');
    if (!param) return [];
    return param.split(',').filter((p): p is Priority => (PRIORITIES as readonly string[]).includes(p));
  });
  const [sortOrder, setSortOrder] = useState<SortOrder | null>(() => {
    const param = searchParams.get('sort');
    return param === 'newest' || param === 'oldest' ? param : null;
  });

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const deferredQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredQuery) params.set('q', deferredQuery);
    if (selectedPriorities.length > 0) params.set('priority', selectedPriorities.join(','));
    if (sortOrder) params.set('sort', sortOrder);
    setSearchParams(params, { replace: true });
  }, [deferredQuery, selectedPriorities, sortOrder, setSearchParams]);

  const openCreateModal = useCallback(() => setShowCreateModal(true), []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [deferredQuery, selectedPriorities, sortOrder]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === 'Escape' && selectionMode) {
        setSelectionMode(false);
        setSelectedIds(new Set());
        return;
      }

      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openCreateModal();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCreateModal, selectionMode]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (deferredQuery) {
      const q = deferredQuery.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    if (selectedPriorities.length > 0) {
      result = result.filter((t) => selectedPriorities.includes(t.priority));
    }
    if (sortOrder) {
      result = [...result].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
    }
    return result;
  }, [tasks, deferredQuery, selectedPriorities, sortOrder]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const toggleSelect = useCallback((taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredTasks.map((t) => t.id)));
  }, [filteredTasks]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleCreateTask = useCallback(async (data: CreateTaskInput) => {
    const success = await addTask(data);
    if (success) {
      setShowCreateModal(false);
      showToast('Task created');
    } else {
      showToast('Failed to create task', 'error');
    }
  }, [addTask, showToast]);

  const handleImport = useCallback(async (file: File) => {
    const success = await importTasksFromJson(file);
    if (success) {
      showToast('Tasks imported');
    } else {
      showToast('Failed to import tasks', 'error');
    }
  }, [importTasksFromJson, showToast]);

  const handleMoveTask = useCallback(async (taskId: string, newStatus: Status) => {
    const success = await moveTask(taskId, newStatus);
    if (success) {
      showToast(`Task moved to ${STATUS_LABELS[newStatus]}`);
    } else {
      showToast('Failed to move task', 'error');
    }
  }, [moveTask, showToast]);

  const handleBatchMove = useCallback(async (status: Status) => {
    const ids = [...selectedIds];
    const success = await batchMoveTasks(ids, status);
    if (success) {
      showToast(`${ids.length} task${ids.length > 1 ? 's' : ''} moved to ${STATUS_LABELS[status]}`);
      setSelectedIds(new Set());
    } else {
      showToast('Failed to move tasks', 'error');
    }
  }, [selectedIds, batchMoveTasks, showToast]);

  const handleBatchDelete = useCallback(async () => {
    const ids = [...selectedIds];
    const taskCopies = tasks.filter((t) => ids.includes(t.id)).map((t) => ({ ...t }));
    const success = await batchDeleteTasks(ids);
    if (success) {
      setSelectedIds(new Set());
      showToast(
        `${ids.length} task${ids.length > 1 ? 's' : ''} deleted`,
        'success',
        {
          label: 'Undo',
          onClick: () => batchRestoreTasks(taskCopies),
        }
      );
    } else {
      showToast('Failed to delete tasks', 'error');
    }
  }, [selectedIds, tasks, batchDeleteTasks, batchRestoreTasks, showToast]);

  function renderContent() {
    if (error) {
      return <ErrorMessage message={error} onRetry={fetchTasks} />;
    }

    return (
      <Board
        tasks={filteredTasks}
        onMoveTask={handleMoveTask}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onCreateClick={openCreateModal}
        onExport={exportTasksToJson}
        onImport={handleImport}
      />
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriorities={selectedPriorities}
        onPrioritiesChange={setSelectedPriorities}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        selectionMode={selectionMode}
        onSelectionModeToggle={toggleSelectionMode}
        selectedCount={selectedIds.size}
        totalCount={filteredTasks.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onMoveTo={handleBatchMove}
        onDelete={handleBatchDelete}
      />
      <main className="flex-1 flex flex-col">{renderContent()}</main>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}
