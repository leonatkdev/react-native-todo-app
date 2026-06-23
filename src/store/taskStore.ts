import { Task } from '../types/task';

let tasks: Task[] = [];
const listeners = new Set<(tasks: Task[]) => void>();

const notify = () => {
  listeners.forEach(fn => fn([...tasks]));
};

export const getTasks = (): Task[] => [...tasks];

export const setTasks = (next: Task[]): void => {
  tasks = [...next];
  notify();
};

export const addTask = (task: Task): void => {
  tasks = [task, ...tasks];
  notify();
};

export const removeTask = (id: string): void => {
  tasks = tasks.filter(t => t.id !== id);
  notify();
};

export const updateTask = (id: string, updates: Partial<Task>): void => {
  tasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
  notify();
};

export const watchTasks = (fn: (tasks: Task[]) => void): () => void => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
