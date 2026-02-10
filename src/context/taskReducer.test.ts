import { describe, it, expect } from 'vitest';
import { taskReducer } from './TaskContext.tsx';
import type { TaskState } from './context.ts';
import type { Task } from '../types/index.ts';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    title: 'Test task',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const emptyState: TaskState = { tasks: [], loading: false, error: null };

describe('taskReducer', () => {
  describe('FETCH_START', () => {
    it('sets loading true and clears error', () => {
      const state: TaskState = { tasks: [], loading: false, error: 'old error' };
      const result = taskReducer(state, { type: 'FETCH_START' });
      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('FETCH_SUCCESS', () => {
    it('sets tasks and clears loading', () => {
      const tasks = [makeTask({ id: '1' }), makeTask({ id: '2' })];
      const state: TaskState = { tasks: [], loading: true, error: null };
      const result = taskReducer(state, { type: 'FETCH_SUCCESS', payload: tasks });
      expect(result.tasks).toEqual(tasks);
      expect(result.loading).toBe(false);
    });
  });

  describe('FETCH_ERROR', () => {
    it('sets error and clears loading', () => {
      const state: TaskState = { tasks: [], loading: true, error: null };
      const result = taskReducer(state, { type: 'FETCH_ERROR', payload: 'Network error' });
      expect(result.error).toBe('Network error');
      expect(result.loading).toBe(false);
    });
  });

  describe('ADD_TASK', () => {
    it('prepends task to list', () => {
      const existing = makeTask({ id: '1' });
      const newTask = makeTask({ id: '2', title: 'New' });
      const state: TaskState = { tasks: [existing], loading: false, error: null };
      const result = taskReducer(state, { type: 'ADD_TASK', payload: newTask });
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].id).toBe('2');
      expect(result.tasks[1].id).toBe('1');
    });
  });

  describe('UPDATE_TASK', () => {
    it('replaces the matching task', () => {
      const task = makeTask({ id: '1', title: 'Old' });
      const updated = makeTask({ id: '1', title: 'Updated' });
      const state: TaskState = { tasks: [task], loading: false, error: null };
      const result = taskReducer(state, { type: 'UPDATE_TASK', payload: updated });
      expect(result.tasks[0].title).toBe('Updated');
    });

    it('does not affect other tasks', () => {
      const task1 = makeTask({ id: '1' });
      const task2 = makeTask({ id: '2', title: 'Keep' });
      const updated = makeTask({ id: '1', title: 'Changed' });
      const state: TaskState = { tasks: [task1, task2], loading: false, error: null };
      const result = taskReducer(state, { type: 'UPDATE_TASK', payload: updated });
      expect(result.tasks[1]).toBe(task2);
    });
  });

  describe('DELETE_TASK', () => {
    it('removes the task by id', () => {
      const task = makeTask({ id: '1' });
      const state: TaskState = { tasks: [task], loading: false, error: null };
      const result = taskReducer(state, { type: 'DELETE_TASK', payload: '1' });
      expect(result.tasks).toHaveLength(0);
    });
  });

  describe('BATCH_DELETE', () => {
    it('removes multiple tasks by id', () => {
      const tasks = [makeTask({ id: '1' }), makeTask({ id: '2' }), makeTask({ id: '3' })];
      const state: TaskState = { tasks, loading: false, error: null };
      const result = taskReducer(state, { type: 'BATCH_DELETE', payload: ['1', '3'] });
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe('2');
    });

    it('handles empty id list', () => {
      const tasks = [makeTask({ id: '1' })];
      const state: TaskState = { tasks, loading: false, error: null };
      const result = taskReducer(state, { type: 'BATCH_DELETE', payload: [] });
      expect(result.tasks).toHaveLength(1);
    });
  });

  describe('BATCH_UPDATE', () => {
    it('updates multiple tasks', () => {
      const tasks = [
        makeTask({ id: '1', status: 'todo' }),
        makeTask({ id: '2', status: 'todo' }),
        makeTask({ id: '3', status: 'todo' }),
      ];
      const updated = [
        makeTask({ id: '1', status: 'done' }),
        makeTask({ id: '3', status: 'done' }),
      ];
      const state: TaskState = { tasks, loading: false, error: null };
      const result = taskReducer(state, { type: 'BATCH_UPDATE', payload: updated });
      expect(result.tasks[0].status).toBe('done');
      expect(result.tasks[1].status).toBe('todo');
      expect(result.tasks[2].status).toBe('done');
    });

    it('preserves task order', () => {
      const tasks = [makeTask({ id: '1' }), makeTask({ id: '2' }), makeTask({ id: '3' })];
      const updated = [makeTask({ id: '2', title: 'Changed' })];
      const state: TaskState = { tasks, loading: false, error: null };
      const result = taskReducer(state, { type: 'BATCH_UPDATE', payload: updated });
      expect(result.tasks.map((t) => t.id)).toEqual(['1', '2', '3']);
    });
  });

  describe('BATCH_ADD', () => {
    it('appends tasks to the end', () => {
      const existing = [makeTask({ id: '1' })];
      const newTasks = [makeTask({ id: '2' }), makeTask({ id: '3' })];
      const state: TaskState = { tasks: existing, loading: false, error: null };
      const result = taskReducer(state, { type: 'BATCH_ADD', payload: newTasks });
      expect(result.tasks).toHaveLength(3);
      expect(result.tasks.map((t) => t.id)).toEqual(['1', '2', '3']);
    });

    it('works on empty state', () => {
      const newTasks = [makeTask({ id: '1' })];
      const result = taskReducer(emptyState, { type: 'BATCH_ADD', payload: newTasks });
      expect(result.tasks).toHaveLength(1);
    });
  });
});
