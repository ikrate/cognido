import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { Todo } from '@/types/todo';

interface ProgressCardProps {
  todos: Todo[];
}

export function ProgressCard({ todos }: ProgressCardProps) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.percentText}>
        {percent}%
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
});
