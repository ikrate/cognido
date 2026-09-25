import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Category, Priority } from '@/types/todo';
import { parseSmartTask } from '@/utils/smart-parser';

interface SmartInputProps {
  onAddTodo: (task: {
    title: string;
    priority: Priority;
    category: Category;
    estimatedMinutes?: number;
    aiSuggested?: boolean;
  }) => void;
  onClose?: () => void;
  autoFocus?: boolean;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Health', 'General'];
const PRIORITIES: { id: Priority; label: string; color: string }[] = [
  { id: 'high', label: 'High', color: '#ef4444' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'low', label: 'Low', color: '#10b981' },
];

export function SmartInput({ onAddTodo, onClose, autoFocus = true }: SmartInputProps) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);

  // Live NLP smart detection as user types
  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    return parseSmartTask(text);
  }, [text]);

  const effectivePriority = selectedPriority ?? parsed?.priority ?? 'medium';
  const effectiveCategory = selectedCategory ?? parsed?.category ?? 'General';

  const handleAdd = () => {
    if (!text.trim()) return;

    const taskData = parseSmartTask(text);
    onAddTodo({
      title: taskData.cleanTitle,
      priority: selectedPriority ?? taskData.priority,
      category: selectedCategory ?? taskData.category,
      estimatedMinutes: taskData.estimatedMinutes,
      aiSuggested: taskData.detectedTags.some((t) => t.startsWith('✨')),
    });

    setText('');
    setSelectedCategory(null);
    setSelectedPriority(null);
    onClose?.();
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.headerTitle}>
            Add task
          </ThemedText>
          {parsed?.detectedTags && parsed.detectedTags.length > 0 && (
            <View style={styles.smartBadgeRow}>
              {parsed.detectedTags.map((tag, idx) => (
                <View key={idx} style={styles.smartTag}>
                  <ThemedText style={styles.smartTagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {onClose && (
          <Pressable hitSlop={12} onPress={onClose} style={styles.closeBtn}>
            <ThemedText style={styles.closeIcon}>✕</ThemedText>
          </Pressable>
        )}
      </View>

      {/* Input box */}
      <View style={[styles.inputContainer, { borderColor: theme.backgroundSelected }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="e.g. Finish slides !high #work ~45m"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="done"
          autoFocus={autoFocus}
          onSubmitEditing={handleAdd}
        />
        <Pressable
          onPress={handleAdd}
          disabled={!text.trim()}
          style={({ pressed }) => [
            styles.addButton,
            !text.trim() && styles.addButtonDisabled,
            pressed && styles.addButtonPressed,
          ]}>
          <ThemedText style={styles.addButtonText}>Add</ThemedText>
        </Pressable>
      </View>

      {/* Quick Selectors Row */}
      <View style={styles.selectorsRow}>
        {/* Category Chips */}
        <View style={styles.chipsGroup}>
          {CATEGORIES.map((cat) => {
            const isSelected = effectiveCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                style={[
                  styles.chip,
                  isSelected && styles.chipActive,
                ]}>
                <ThemedText
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}>
                  #{cat}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Priority Chips */}
        <View style={styles.chipsGroup}>
          {PRIORITIES.map((p) => {
            const isSelected = effectivePriority === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelectedPriority(selectedPriority === p.id ? null : p.id)}
                style={[
                  styles.priorityChip,
                  isSelected && { backgroundColor: p.color, borderColor: p.color },
                ]}>
                <ThemedText
                  style={[
                    styles.priorityChipText,
                    isSelected && { color: '#ffffff', fontWeight: '700' },
                  ]}>
                  {p.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
    flex: 1,
  },
  headerTitle: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
  },
  closeIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
  smartBadgeRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  smartTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  smartTagText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    paddingHorizontal: Spacing.two,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonPressed: {
    backgroundColor: '#2563eb',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  selectorsRow: {
    gap: Spacing.two,
  },
  chipsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(150, 150, 150, 0.12)',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  priorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.25)',
  },
  priorityChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
