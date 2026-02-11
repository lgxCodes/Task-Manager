import { useState, useRef, useEffect } from 'react';
import type { Priority, Status } from '../../types/index.ts';
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from '../../types/index.ts';

export type SortOrder = 'newest' | 'oldest';

type SearchFilterBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriorities: Priority[];
  onPrioritiesChange: (priorities: Priority[]) => void;
  sortOrder: SortOrder | null;
  onSortOrderChange: (order: SortOrder | null) => void;
  selectionMode: boolean;
  onSelectionModeToggle: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMoveTo: (status: Status) => void;
  onDelete: () => void;
};

const menuItemClass =
  'w-full text-left px-3 py-2 text-sm bg-transparent border-none cursor-pointer hover:bg-bg transition-colors';

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedPriorities,
  onPrioritiesChange,
  sortOrder,
  onSortOrderChange,
  selectionMode,
  onSelectionModeToggle,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onMoveTo,
  onDelete,
}: SearchFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsSelectOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsFilterOpen(false);
        setIsSelectOpen(false);
      }
    }
    function handleSlashKey(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleSlashKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleSlashKey);
    };
  }, []);

  function togglePriority(p: Priority) {
    if (selectedPriorities.includes(p)) {
      onPrioritiesChange(selectedPriorities.filter((sp) => sp !== p));
    } else {
      onPrioritiesChange([...selectedPriorities, p]);
    }
  }

  function toggleSort(order: SortOrder) {
    onSortOrderChange(sortOrder === order ? null : order);
  }

  const activeCount = selectedPriorities.length + (sortOrder ? 1 : 0);
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-3 bg-surface border-b border-border">
      <input
        type="text"
        ref={searchInputRef}
        placeholder="Search tasks..."
        aria-label="Search tasks"
        className="flex-1 min-w-48 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="relative" ref={filterRef}>
        <button
          type="button"
          className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-muted cursor-pointer hover:border-accent focus:outline-none focus:border-accent transition-colors"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          aria-haspopup="true"
          aria-expanded={isFilterOpen}
        >
          Filter{activeCount > 0 && ` (${activeCount})`}
        </button>
        {isFilterOpen && (
          <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 min-w-44 py-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
              Sort
            </div>
            <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-primary hover:bg-bg cursor-pointer">
              <input
                type="radio"
                name="sort-order"
                checked={sortOrder === 'newest'}
                onChange={() => toggleSort('newest')}
                className="accent-accent"
              />
              Newest
            </label>
            <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-primary hover:bg-bg cursor-pointer">
              <input
                type="radio"
                name="sort-order"
                checked={sortOrder === 'oldest'}
                onChange={() => toggleSort('oldest')}
                className="accent-accent"
              />
              Oldest
            </label>
            <div className="border-t border-border my-1" />
            <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
              Priority
            </div>
            {PRIORITIES.map((p) => (
              <label
                key={p}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-primary hover:bg-bg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPriorities.includes(p)}
                  onChange={() => togglePriority(p)}
                  className="accent-accent"
                />
                {PRIORITY_LABELS[p]}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={`px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors ${
            selectionMode
              ? 'bg-accent text-white border-accent'
              : 'bg-bg border-border text-text-muted hover:border-accent'
          }`}
          onClick={() => {
            if (!selectionMode) {
              onSelectionModeToggle();
              setIsSelectOpen(true);
            } else {
              onSelectionModeToggle();
              setIsSelectOpen(false);
            }
          }}
          aria-haspopup="true"
          aria-expanded={isSelectOpen}
        >
          Select{selectionMode && ` (${selectedCount})`}
        </button>
        {selectionMode && isSelectOpen && (
          <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 min-w-48 py-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
              {selectedCount} of {totalCount} selected
            </div>
            <button
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className={`${menuItemClass} text-text-primary`}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
            <div className="border-t border-border my-1" />
            <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
              Move to
            </div>
            {STATUSES.map((s) => (
              <button
                key={s}
                disabled={!hasSelection}
                onClick={() => {
                  onMoveTo(s);
                  setIsSelectOpen(false);
                }}
                className={`${menuItemClass} ${hasSelection ? 'text-text-primary' : 'text-text-muted opacity-50 cursor-not-allowed'}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
            <div className="border-t border-border my-1" />
            <button
              disabled={!hasSelection}
              onClick={() => {
                onDelete();
                setIsSelectOpen(false);
              }}
              className={`${menuItemClass} ${hasSelection ? 'text-danger' : 'text-text-muted opacity-50 cursor-not-allowed'}`}
            >
              Delete selected
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => {
                onSelectionModeToggle();
                setIsSelectOpen(false);
              }}
              className={`${menuItemClass} text-text-muted`}
            >
              Cancel select
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
