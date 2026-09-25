import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Category, Priority, Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  high: { label: 'High', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  medium: { label: 'Med', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  low: { label: 'Low', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
};

const CATEGORY_CONFIG: Record<Category, { color: string; bg: string }> = {
  Work: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
  Personal: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' },
  Study: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  Health: { color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.12)' },
  General: { color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const priority = PRIORITY_CONFIG[todo.priority] ?? PRIORITY_CONFIG.medium;
  const category = CATEGORY_CONFIG[todo.category] ?? CATEGORY_CONFIG.General;

  return (
    <ThemedView type="backgroundElement" style={[styles.container, todo.completed && styles.containerCompleted]}>
      {/* Checkbox */}
      <Pressable
        hitSlop={8}
        onPress={() => onToggle(todo.id)}
        style={[styles.checkbox, todo.completed && styles.checkboxActive]}>
        {todo.completed && <ThemedText style={styles.checkmark}>✓</ThemedText>}
      </Pressable>

      {/* Main Content */}
      <View style={styles.content}>
        <Pressable onPress={() => onToggle(todo.id)}>
          <ThemedText
            type="default"
            style={[styles.title, todo.completed && styles.titleCompleted]}>
            {todo.title}
          </ThemedText>
        </Pressable>

        {/* Tags Row */}
        <View style={styles.tagsRow}>
          {/* Priority Badge */}
          <View style={[styles.badge, { backgroundColor: priority.bg }]}>
            <View style={[styles.badgeDot, { backgroundColor: priority.color }]} />
            <ThemedText style={[styles.badgeText, { color: priority.color }]}>
              {priority.label}
            </ThemedText>
          </View>

          {/* Category Badge */}
          <View style={[styles.badge, { backgroundColor: category.bg }]}>
            <ThemedText style={[styles.badgeText, { color: category.color }]}>
              #{todo.category}
            </ThemedText>
          </View>

          {/* Time Estimate if available */}
          {todo.estimatedMinutes ? (
            <View style={styles.timeBadge}>
              <ThemedText type="code" themeColor="textSecondary" style={styles.timeText}>
                ⏱ {todo.estimatedMinutes >= 60
                  ? `${Math.floor(todo.estimatedMinutes / 60)}h${todo.estimatedMinutes % 60 ? ` ${todo.estimatedMinutes % 60}m` : ''}`
                  : `${todo.estimatedMinutes}m`}
              </ThemedText>
            </View>
          ) : null}

          {/* AI suggested marker */}
          {todo.aiSuggested && (
            <View style={styles.aiBadge}>
              <ThemedText style={styles.aiText}>✨ smart</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Delete Action */}
      <Pressable
        hitSlop={12}
        onPress={() => onDelete(todo.id)}
        style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}>
        <ThemedText style={styles.deleteIcon}>✕</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  containerCompleted: {
    opacity: 0.65,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  content: {
    flex: 1,
    gap: Spacing.two,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeBadge: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 11,
  },
  aiBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiText: {
    color: '#ec4899',
    fontSize: 10,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  deleteBtnPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  deleteIcon: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
