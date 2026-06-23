export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
  fromApi: boolean;
};

export type FilterType = 'all' | 'active' | 'done';
