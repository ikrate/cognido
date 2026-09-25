import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '@/types/todo';

const STORAGE_KEY = '@cognido_todos_v1';
const LEGACY_STORAGE_KEY = '@intellinote_todos_v1';

const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    title: 'Review CogniDo project roadmap',
    completed: false,
    priority: 'high',
    category: 'Work',
    estimatedMinutes: 30,
    createdAt: Date.now() - 3600000 * 2,
    aiSuggested: true,
  },
  {
    id: '2',
    title: 'Test smart task parser with #work or !high',
    completed: true,
    priority: 'medium',
    category: 'Study',
    estimatedMinutes: 15,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: '3',
    title: 'Drink 2L of water today',
    completed: false,
    priority: 'low',
    category: 'Health',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: '4',
    title: 'Call family this evening',
    completed: false,
    priority: 'medium',
    category: 'Personal',
    createdAt: Date.now() - 3600000 * 6,
  },
];

export async function loadTodos(): Promise<Todo[]> {
  try {
    let json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json == null) {
      json = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      if (json != null) {
        await AsyncStorage.setItem(STORAGE_KEY, json);
      }
    }
    if (json != null) {
      return JSON.parse(json);
    }
    // Initialize with starter todos if first time
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TODOS));
    return INITIAL_TODOS;
  } catch (error) {
    console.warn('Failed to load todos from storage', error);
    return INITIAL_TODOS;
  }
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.warn('Failed to save todos to storage', error);
  }
}
