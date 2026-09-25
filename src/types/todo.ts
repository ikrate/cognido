export type Priority = 'low' | 'medium' | 'high';

export type Category = 'Work' | 'Personal' | 'Study' | 'Health' | 'General';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  estimatedMinutes?: number;
  createdAt: number;
  completedAt?: number;
  aiSuggested?: boolean;
}

export type FilterStatus = 'all' | 'active' | 'completed';
