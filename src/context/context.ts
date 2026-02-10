import { createContext } from 'react';
import type { Task } from '../types/index.ts';

export type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

export type TaskAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'BATCH_DELETE'; payload: string[] }
  | { type: 'BATCH_UPDATE'; payload: Task[] }
  | { type: 'BATCH_ADD'; payload: Task[] };

export type TaskContextValue = {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
};

export const TaskContext = createContext<TaskContextValue | null>(null);

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant, action?: ToastAction) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
