export type Status = 'todo' | 'in-progress' | 'done';

export const STATUSES: readonly Status[] = ['todo', 'in-progress', 'done'] as const;

export const STATUS_LABELS: Record<Status, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

export type Priority = 'low' | 'medium' | 'high';

export const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'] as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type ApiResponse<T> =
  | { data: T; success: true }
  | { error: string; success: false };
