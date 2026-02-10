import { useReducer } from 'react';
import type { ReactNode } from 'react';
import { TaskContext } from './context.ts';
import type { TaskState, TaskAction } from './context.ts';

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, tasks: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
    case 'BATCH_DELETE': {
      const idSet = new Set(action.payload);
      return {
        ...state,
        tasks: state.tasks.filter((t) => !idSet.has(t.id)),
      };
    }
    case 'BATCH_UPDATE': {
      const updateMap = new Map(action.payload.map((t) => [t.id, t]));
      return {
        ...state,
        tasks: state.tasks.map((t) => updateMap.get(t.id) ?? t),
      };
    }
    case 'BATCH_ADD':
      return { ...state, tasks: [...state.tasks, ...action.payload] };
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}
