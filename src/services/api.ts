import { Task } from '../types/task';
import env from '../config/env';

type TodoDTO = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

type GetTodosResponse = {
  todos: TodoDTO[];
  total: number;
};

const mapToTask = (dto: TodoDTO): Task => ({
  id: `api-${dto.id}`,
  title: dto.todo,
  description: '',
  completed: dto.completed,
  createdAt: Date.now(),
  fromApi: true,
});

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
};

export const getTodos = async (limit = 20, skip = 0): Promise<{ tasks: Task[]; total: number }> => {
  const data = await request<GetTodosResponse>(`${env.API_URL}?limit=${limit}&skip=${skip}`);
  return { tasks: data.todos.map(mapToTask), total: data.total };
};

export const getTodoById = async (apiId: number): Promise<Task> => {
  const dto = await request<TodoDTO>(`${env.API_URL}/${apiId}`);
  return mapToTask(dto);
};

export const addTodo = async (title: string): Promise<Task> => {
  const dto = await request<TodoDTO>(`${env.API_URL}/add`, {
    method: 'POST',
    body: JSON.stringify({ todo: title, completed: false, userId: 1 }),
  });
  return mapToTask(dto);
};

export const updateTodo = async (apiId: number, completed: boolean): Promise<Task> => {
  const dto = await request<TodoDTO>(`${env.API_URL}/${apiId}`, {
    method: 'PUT',
    body: JSON.stringify({ completed }),
  });
  return mapToTask(dto);
};

export const deleteTodo = async (apiId: number): Promise<void> => {
  await request(`${env.API_URL}/${apiId}`, { method: 'DELETE' });
};

export const getApiId = (taskId: string): number | null => {
  if (!taskId.startsWith('api-')) return null;
  const num = parseInt(taskId.replace('api-', ''), 10);
  return isNaN(num) ? null : num;
};
