import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressCard } from '@/components/progress-card';
import { SmartInput } from '@/components/smart-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoItem } from '@/components/todo-item';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { loadTodos, saveTodos } from '@/services/storage';
import { Category, FilterStatus, Priority, Todo } from '@/types/todo';

const CATEGORY_FILTERS: (Category | 'All')[] = ['All', 'Work', 'Personal', 'Study', 'Health'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load initial todos from AsyncStorage
  useEffect(() => {
    loadTodos().then((data) => {
      setTodos(data);
      setLoading(false);
    });
  }, []);

  // Sync to storage on state change
  const updateAndPersist = useCallback((newTodos: Todo[]) => {
    setTodos(newTodos);
    saveTodos(newTodos);
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      const updated = todos.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? Date.now() : undefined,
            }
          : item
      );
      updateAndPersist(updated);
    },
    [todos, updateAndPersist]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = todos.filter((item) => item.id !== id);
      updateAndPersist(updated);
    },
    [todos, updateAndPersist]
  );

  const handleAddTodo = useCallback(
    (task: {
      title: string;
      priority: Priority;
      category: Category;
      estimatedMinutes?: number;
      aiSuggested?: boolean;
    }) => {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: task.title,
        completed: false,
        priority: task.priority,
        category: task.category,
        estimatedMinutes: task.estimatedMinutes,
        createdAt: Date.now(),
        aiSuggested: task.aiSuggested,
      };
      const updated = [newTodo, ...todos];
      updateAndPersist(updated);
      setIsAddModalOpen(false);
    },
    [todos, updateAndPersist]
  );

  const handleClearCompleted = useCallback(() => {
    const hasCompleted = todos.some((t) => t.completed);
    if (!hasCompleted) return;

    if (Platform.OS === 'web') {
      const updated = todos.filter((t) => !t.completed);
      updateAndPersist(updated);
    } else {
      Alert.alert(
        'Clear Completed',
        'Are you sure you want to remove all completed tasks?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: () => {
              const updated = todos.filter((t) => !t.completed);
              updateAndPersist(updated);
            },
          },
        ]
      );
    }
  }, [todos, updateAndPersist]);

  // Filtered Todos
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      // Status filter
      if (filterStatus === 'active' && item.completed) return false;
      if (filterStatus === 'completed' && !item.completed) return false;

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

      return true;
    });
  }, [todos, filterStatus, selectedCategory]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Pinned Sticky Header: Title and Progress Bar stay still while tasks scroll */}
      <View
        style={[
          styles.stickyHeaderWrapper,
          {
            paddingTop: Math.max(insets.top, Spacing.three),
            backgroundColor: theme.background,
          },
        ]}>
        <View style={styles.stickyHeaderContent}>
          <ThemedText type="title" style={styles.brandTitle}>
            Cognido
          </ThemedText>
          <ProgressCard todos={todos} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Spacing.two,
            paddingBottom: insets.bottom + BottomTabInset + 88, // extra room for floating + button
          },
        ]}>
        <View style={styles.container}>

          {/* Filter Status & Category Tabs */}
          <View style={styles.filtersSection}>
            <View style={styles.statusFilters}>
              {(['all', 'completed'] as FilterStatus[]).map((status) => {
                const isActive = filterStatus === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => setFilterStatus(status)}
                    style={[
                      styles.filterTab,
                      isActive && styles.filterTabActive,
                    ]}>
                    <ThemedText
                      style={[
                        styles.filterTabText,
                        isActive && styles.filterTabTextActive,
                      ]}>
                      {status === 'all'
                        ? `All (${todos.length})`
                        : `Completed (${todos.filter((t) => t.completed).length})`}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* Category horizontal pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}>
              {CATEGORY_FILTERS.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryFilterChip,
                      isSelected && styles.categoryFilterChipActive,
                    ]}>
                    <ThemedText
                      style={[
                        styles.categoryFilterText,
                        isSelected && styles.categoryFilterTextActive,
                      ]}>
                      #{cat}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Todo List Header */}
          <View style={styles.listHeaderRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              TASKS ({filteredTodos.length})
            </ThemedText>
            {todos.some((t) => t.completed) && (
              <Pressable onPress={handleClearCompleted}>
                <ThemedText type="code" style={styles.clearCompletedText}>
                  Clear Completed
                </ThemedText>
              </Pressable>
            )}
          </View>

          {/* Todo Items List */}
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
          ) : filteredTodos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                press + to add tasks
              </ThemedText>
            </View>
          ) : (
            <View style={styles.todoList}>
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button (+) centered in the bottom */}
      <View
        pointerEvents="box-none"
        style={[
          styles.fabWrapper,
          { bottom: insets.bottom + BottomTabInset + 16 },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add new task"
          onPress={() => setIsAddModalOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
          <ThemedText style={styles.fabIcon}>+</ThemedText>
        </Pressable>
      </View>

      {/* Smart Task Add Popup Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsAddModalOpen(false)}
          />
          <View
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom, Spacing.four) },
            ]}>
            <SmartInput
              onAddTodo={handleAddTodo}
              onClose={() => setIsAddModalOpen(false)}
              autoFocus
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  stickyHeaderWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    zIndex: 10,
  },
  stickyHeaderContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 8, // doubled space between title and progress bar
    paddingBottom: Spacing.two,
  },
  brandTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  filtersSection: {
    gap: Spacing.two,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  categoryScroll: {
    gap: Spacing.one,
    paddingVertical: 2,
  },
  categoryFilterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  categoryFilterChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  clearCompletedText: {
    color: '#ef4444',
    fontSize: 12,
  },
  todoList: {
    gap: Spacing.two,
  },
  loader: {
    marginTop: Spacing.five,
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  // Floating Action Button
  fabWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: '#2563eb',
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 38,
    marginTop: -2,
  },
  // Modal Sheet
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
});
