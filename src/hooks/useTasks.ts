import { useContext, useCallback } from 'react';
import { TaskContext } from '../context/context.ts';
import * as api from '../api/tasks.ts';
import type { CreateTaskInput, UpdateTaskInput, Status, Task } from '../types/index.ts';

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }

  const { state, dispatch } = context;

  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    const response = await api.getTasks();
    if (response.success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
    } else {
      dispatch({ type: 'FETCH_ERROR', payload: response.error });
    }
  }, [dispatch]);

  const addTask = useCallback(async (input: CreateTaskInput): Promise<boolean> => {
    const response = await api.createTask(input);
    if (response.success) {
      dispatch({ type: 'ADD_TASK', payload: response.data });
      return true;
    }
    return false;
  }, [dispatch]);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput): Promise<boolean> => {
    const response = await api.updateTask(id, input);
    if (response.success) {
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      return true;
    }
    return false;
  }, [dispatch]);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    const response = await api.deleteTask(id);
    if (response.success) {
      dispatch({ type: 'DELETE_TASK', payload: id });
      return true;
    }
    return false;
  }, [dispatch]);

  const restoreTask = useCallback((task: Task): boolean => {
    const result = api.restoreTask(task);
    if (result.success) {
      dispatch({ type: 'ADD_TASK', payload: result.data });
      return true;
    }
    return false;
  }, [dispatch]);

  const moveTask = useCallback(async (id: string, newStatus: Status): Promise<boolean> => {
    return updateTask(id, { status: newStatus });
  }, [updateTask]);

  const getTaskById = useCallback((id: string): Task | undefined => {
    return state.tasks.find((t) => t.id === id);
  }, [state.tasks]);

  const exportTasksToJson = useCallback(() => {
    const json = api.exportTasks();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const batchDeleteTasks = useCallback(async (ids: string[]): Promise<boolean> => {
    const response = await api.batchDeleteTasks(ids);
    if (response.success) {
      dispatch({ type: 'BATCH_DELETE', payload: ids });
      return true;
    }
    return false;
  }, [dispatch]);

  const batchMoveTasks = useCallback(async (ids: string[], status: Status): Promise<boolean> => {
    const response = await api.batchUpdateTasks(ids, { status });
    if (response.success) {
      dispatch({ type: 'BATCH_UPDATE', payload: response.data });
      return true;
    }
    return false;
  }, [dispatch]);

  const batchRestoreTasks = useCallback((tasksToRestore: Task[]): boolean => {
    const result = api.batchRestoreTasks(tasksToRestore);
    if (result.success) {
      dispatch({ type: 'BATCH_ADD', payload: result.data });
      return true;
    }
    return false;
  }, [dispatch]);

  const importTasksFromJson = useCallback(async (file: File): Promise<boolean> => {
    const text = await file.text();
    const result = api.importTasks(text);
    if (result.success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      return true;
    }
    return false;
  }, [dispatch]);

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    moveTask,
    getTaskById,
    exportTasksToJson,
    importTasksFromJson,
    batchDeleteTasks,
    batchMoveTasks,
    batchRestoreTasks,
  };
}
