import type { Task, CreateTaskInput, UpdateTaskInput, ApiResponse, Status, Priority } from '../types/index.ts';
import { STATUSES, PRIORITIES } from '../types/index.ts';

const STORAGE_KEY = 'taskmanager_tasks';

const validStatuses = new Set<string>(STATUSES);
const validPriorities = new Set<string>(PRIORITIES);

function isValidTask(obj: unknown): obj is Task {
  if (typeof obj !== 'object' || obj === null) return false;
  const t = obj as Record<string, unknown>;
  return (
    typeof t.id === 'string' && t.id.length > 0 &&
    typeof t.title === 'string' && t.title.length > 0 &&
    typeof t.description === 'string' &&
    typeof t.status === 'string' && validStatuses.has(t.status) &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string'
  );
}

function normalizeTask(obj: Record<string, unknown>): Task {
  return {
    id: obj.id as string,
    title: obj.title as string,
    description: (obj.description as string) || '',
    status: (validStatuses.has(obj.status as string) ? obj.status : 'todo') as Status,
    priority: (validPriorities.has(obj.priority as string) ? obj.priority : 'medium') as Priority,
    dueDate: typeof obj.dueDate === 'string' ? obj.dueDate : null,
    createdAt: obj.createdAt as string,
    updatedAt: obj.updatedAt as string,
  };
}

function migrateTasks(tasks: Task[]): Task[] {
  return tasks.map((t) => ({
    ...t,
    priority: t.priority ?? 'medium',
    dueDate: t.dueDate ?? null,
  }));
}

function readTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return migrateTasks(JSON.parse(raw) as Task[]);
  } catch {
    return [];
  }
}

function writeTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('Storage is full. Try deleting some tasks or clearing browser data.');
    }
    throw new Error('Failed to save tasks');
  }
}

export async function getTasks(): Promise<ApiResponse<Task[]>> {
  try {
    const tasks = readTasks();
    return { success: true, data: tasks };
  } catch {
    return { success: false, error: 'Failed to load tasks' };
  }
}

export async function createTask(input: CreateTaskInput): Promise<ApiResponse<Task>> {
  try {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    const tasks = readTasks();
    tasks.push(task);
    writeTasks(tasks);
    return { success: true, data: task };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create task' };
  }
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<ApiResponse<Task>> {
  try {
    const tasks = readTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return { success: false, error: 'Task not found' };
    }
    const updated: Task = {
      ...tasks[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updated;
    writeTasks(tasks);
    return { success: true, data: updated };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update task' };
  }
}

export function exportTasks(): string {
  const tasks = readTasks();
  return JSON.stringify(tasks, null, 2);
}

export function importTasks(json: string): ApiResponse<Task[]> {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'Invalid format: expected an array of tasks' };
    }
    const valid = parsed.filter(isValidTask).map((t) => normalizeTask(t as Record<string, unknown>));
    if (valid.length === 0) {
      return { success: false, error: 'No valid tasks found in file' };
    }
    const existing = readTasks();
    const importedIds = new Set(valid.map((t) => t.id));
    const kept = existing.filter((t) => !importedIds.has(t.id));
    const merged = [...kept, ...valid];
    writeTasks(merged);
    return { success: true, data: merged };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Invalid JSON file' };
  }
}

export function restoreTask(task: Task): ApiResponse<Task> {
  try {
    const tasks = readTasks();
    tasks.push(task);
    writeTasks(tasks);
    return { success: true, data: task };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to restore task' };
  }
}

export async function batchDeleteTasks(ids: string[]): Promise<ApiResponse<{ ids: string[] }>> {
  try {
    const idSet = new Set(ids);
    const tasks = readTasks();
    const remaining = tasks.filter((t) => !idSet.has(t.id));
    writeTasks(remaining);
    return { success: true, data: { ids } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete tasks' };
  }
}

export async function batchUpdateTasks(
  ids: string[],
  input: UpdateTaskInput
): Promise<ApiResponse<Task[]>> {
  try {
    const idSet = new Set(ids);
    const tasks = readTasks();
    const now = new Date().toISOString();
    const updated: Task[] = [];
    const result = tasks.map((t) => {
      if (idSet.has(t.id)) {
        const patched = { ...t, ...input, updatedAt: now };
        updated.push(patched);
        return patched;
      }
      return t;
    });
    writeTasks(result);
    return { success: true, data: updated };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update tasks' };
  }
}

export function batchRestoreTasks(tasksToRestore: Task[]): ApiResponse<Task[]> {
  try {
    const tasks = readTasks();
    tasks.push(...tasksToRestore);
    writeTasks(tasks);
    return { success: true, data: tasksToRestore };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to restore tasks' };
  }
}

export async function deleteTask(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    const tasks = readTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return { success: false, error: 'Task not found' };
    }
    tasks.splice(index, 1);
    writeTasks(tasks);
    return { success: true, data: { id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete task' };
  }
}
