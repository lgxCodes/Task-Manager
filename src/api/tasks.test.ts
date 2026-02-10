import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  batchDeleteTasks,
  batchUpdateTasks,
  restoreTask,
  batchRestoreTasks,
  importTasks,
  exportTasks,
} from './tasks.ts';
import type { Task, CreateTaskInput } from '../types/index.ts';

const STORAGE_KEY = 'taskmanager_tasks';

function seedTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Test task',
    description: 'A description',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('getTasks', () => {
  it('returns empty array when storage is empty', async () => {
    const result = await getTasks();
    expect(result).toEqual({ success: true, data: [] });
  });

  it('returns stored tasks', async () => {
    const tasks = [makeTask({ id: '1' }), makeTask({ id: '2' })];
    seedTasks(tasks);
    const result = await getTasks();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });
});

describe('createTask', () => {
  it('creates a task and stores it', async () => {
    const input: CreateTaskInput = {
      title: 'New task',
      description: 'Desc',
      status: 'todo',
      priority: 'high',
      dueDate: null,
    };
    const result = await createTask(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('New task');
      expect(result.data.priority).toBe('high');
      expect(result.data.id).toBeTruthy();
      expect(result.data.createdAt).toBeTruthy();
    }

    const stored = await getTasks();
    if (stored.success) {
      expect(stored.data).toHaveLength(1);
    }
  });
});

describe('updateTask', () => {
  it('updates an existing task', async () => {
    const task = makeTask({ id: 'abc' });
    seedTasks([task]);
    const result = await updateTask('abc', { title: 'Updated title' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated title');
      expect(result.data.description).toBe(task.description);
    }
  });

  it('returns error for non-existent task', async () => {
    const result = await updateTask('missing', { title: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Task not found');
    }
  });
});

describe('deleteTask', () => {
  it('removes a task', async () => {
    const task = makeTask({ id: 'del-1' });
    seedTasks([task]);
    const result = await deleteTask('del-1');
    expect(result.success).toBe(true);

    const stored = await getTasks();
    if (stored.success) {
      expect(stored.data).toHaveLength(0);
    }
  });

  it('returns error for non-existent task', async () => {
    const result = await deleteTask('missing');
    expect(result.success).toBe(false);
  });
});

describe('batchDeleteTasks', () => {
  it('removes multiple tasks', async () => {
    const tasks = [makeTask({ id: '1' }), makeTask({ id: '2' }), makeTask({ id: '3' })];
    seedTasks(tasks);
    const result = await batchDeleteTasks(['1', '3']);
    expect(result.success).toBe(true);

    const stored = await getTasks();
    if (stored.success) {
      expect(stored.data).toHaveLength(1);
      expect(stored.data[0].id).toBe('2');
    }
  });
});

describe('batchUpdateTasks', () => {
  it('updates multiple tasks with shared input', async () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'todo' }),
      makeTask({ id: '3', status: 'todo' }),
    ];
    seedTasks(tasks);
    const result = await batchUpdateTasks(['1', '3'], { status: 'done' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data.every((t) => t.status === 'done')).toBe(true);
    }

    const stored = await getTasks();
    if (stored.success) {
      const statuses = stored.data.map((t) => t.status);
      expect(statuses).toEqual(['done', 'todo', 'done']);
    }
  });
});

describe('restoreTask', () => {
  it('adds a task back to storage', () => {
    const task = makeTask({ id: 'restored' });
    const result = restoreTask(task);
    expect(result.success).toBe(true);

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Task[];
    expect(raw).toHaveLength(1);
    expect(raw[0].id).toBe('restored');
  });
});

describe('batchRestoreTasks', () => {
  it('adds multiple tasks back', () => {
    seedTasks([makeTask({ id: 'existing' })]);
    const toRestore = [makeTask({ id: 'r1' }), makeTask({ id: 'r2' })];
    const result = batchRestoreTasks(toRestore);
    expect(result.success).toBe(true);

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Task[];
    expect(raw).toHaveLength(3);
  });
});

describe('importTasks', () => {
  it('imports valid JSON', () => {
    const tasks = [makeTask({ id: '1' })];
    const result = importTasks(JSON.stringify(tasks));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });

  it('merges with existing tasks', () => {
    seedTasks([makeTask({ id: 'existing', title: 'Existing' })]);
    const imported = [makeTask({ id: 'new', title: 'New' })];
    const result = importTasks(JSON.stringify(imported));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data.map((t) => t.id)).toEqual(['existing', 'new']);
    }
  });

  it('imported tasks override existing tasks with same ID', () => {
    seedTasks([makeTask({ id: '1', title: 'Old' })]);
    const imported = [makeTask({ id: '1', title: 'Updated' })];
    const result = importTasks(JSON.stringify(imported));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Updated');
    }
  });

  it('rejects objects missing required fields', () => {
    const result = importTasks('[{"foo": "bar"}]');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('No valid tasks');
    }
  });

  it('returns error for invalid JSON', () => {
    const result = importTasks('not json');
    expect(result.success).toBe(false);
  });

  it('returns error for non-array JSON', () => {
    const result = importTasks('{"key": "value"}');
    expect(result.success).toBe(false);
  });
});

describe('exportTasks', () => {
  it('returns JSON string of stored tasks', () => {
    const tasks = [makeTask({ id: '1' })];
    seedTasks(tasks);
    const json = exportTasks();
    const parsed = JSON.parse(json) as Task[];
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('1');
  });
});

describe('localStorage quota handling', () => {
  it('surfaces a helpful error when storage is full', async () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const err = new DOMException('quota exceeded', 'QuotaExceededError');
      throw err;
    });

    const input: CreateTaskInput = {
      title: 'Big task',
      description: 'x',
      status: 'todo',
      priority: 'low',
      dueDate: null,
    };
    const result = await createTask(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Storage is full');
    }

    Storage.prototype.setItem = original;
  });
});
