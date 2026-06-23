import env from '../config/env';

function mapToTask(dto) {
  return {
    id: `api-${dto.id}`,
    title: dto.todo,
    description: '',
    completed: dto.completed,
    createdAt: Date.now(),
    fromApi: true,
  };
}

async function request(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getTodos(limit = 20, skip = 0) {
  const data = await request(`${env.API_URL}?limit=${limit}&skip=${skip}`);
  return { tasks: data.todos.map(mapToTask), total: data.total };
}

export async function getTodoById(apiId) {
  const dto = await request(`${env.API_URL}/${apiId}`);
  return mapToTask(dto);
}

export async function addTodo(title) {
  const dto = await request(`${env.API_URL}/add`, {
    method: 'POST',
    body: JSON.stringify({ todo: title, completed: false, userId: 1 }),
  });
  return mapToTask(dto);
}

export async function updateTodo(apiId, completed) {
  const dto = await request(`${env.API_URL}/${apiId}`, {
    method: 'PUT',
    body: JSON.stringify({ completed }),
  });
  return mapToTask(dto);
}

export async function deleteTodo(apiId) {
  return request(`${env.API_URL}/${apiId}`, { method: 'DELETE' });
}

export function getApiId(taskId) {
  if (!taskId.startsWith('api-')) return null;
  const num = parseInt(taskId.replace('api-', ''), 10);
  return isNaN(num) ? null : num;
}
