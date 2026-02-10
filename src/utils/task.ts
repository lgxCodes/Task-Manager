import type { Status, Priority } from '../types/index.ts';

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}

export const badgeStyles: Record<Status, string> = {
  'todo': 'bg-todo/15 text-todo',
  'in-progress': 'bg-in-progress/15 text-in-progress',
  'done': 'bg-done/15 text-done',
};

export const priorityColors: Record<Priority, string> = {
  low: 'text-done',
  medium: 'text-in-progress',
  high: 'text-todo',
};
