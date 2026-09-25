import { Category, Priority } from '@/types/todo';

export interface ParsedTask {
  cleanTitle: string;
  priority: Priority;
  category: Category;
  estimatedMinutes?: number;
  detectedTags: string[];
}

export function parseSmartTask(input: string): ParsedTask {
  let text = input.trim();
  const detectedTags: string[] = [];

  // Default values
  let priority: Priority = 'medium';
  let category: Category = 'General';
  let estimatedMinutes: number | undefined;

  // 1. Explicit Priority with !high, !med, !medium, !low
  const priorityMatch = text.match(/!(high|med|medium|low)\b/i);
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase();
    priority = p === 'high' ? 'high' : p === 'low' ? 'low' : 'medium';
    detectedTags.push(`!${priority}`);
    text = text.replace(priorityMatch[0], '').trim();
  }

  // 2. Explicit Category with #tag
  const categoryMatch = text.match(/#(work|personal|study|health|general)\b/i);
  if (categoryMatch) {
    const c = categoryMatch[1].toLowerCase();
    category =
      c === 'work'
        ? 'Work'
        : c === 'personal'
        ? 'Personal'
        : c === 'study'
        ? 'Study'
        : c === 'health'
        ? 'Health'
        : 'General';
    detectedTags.push(`#${category.toLowerCase()}`);
    text = text.replace(categoryMatch[0], '').trim();
  }

  // 3. Time estimate like ~15m, ~30m, ~1h, ~2h
  const timeMatch = text.match(/~(\d+)(m|h)\b/i);
  if (timeMatch) {
    const val = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();
    estimatedMinutes = unit === 'h' ? val * 60 : val;
    detectedTags.push(`~${val}${unit}`);
    text = text.replace(timeMatch[0], '').trim();
  }

  // 4. Intelligent Heuristic / Keyword Fallbacks if not explicitly set
  const lower = text.toLowerCase();

  if (!priorityMatch) {
    if (
      lower.includes('urgent') ||
      lower.includes('asap') ||
      lower.includes('critical') ||
      lower.includes('emergency') ||
      lower.includes('deadline') ||
      lower.includes('today!') ||
      lower.includes('important')
    ) {
      priority = 'high';
      detectedTags.push('✨ Auto High');
    } else if (
      lower.includes('someday') ||
      lower.includes('maybe') ||
      lower.includes('low priority') ||
      lower.includes('whenever')
    ) {
      priority = 'low';
      detectedTags.push('✨ Auto Low');
    }
  }

  if (!categoryMatch) {
    if (
      lower.includes('workout') ||
      lower.includes('gym') ||
      lower.includes('run') ||
      lower.includes('doctor') ||
      lower.includes('medicine') ||
      lower.includes('water') ||
      lower.includes('sleep')
    ) {
      category = 'Health';
      detectedTags.push('✨ Health');
    } else if (
      lower.includes('meeting') ||
      lower.includes('client') ||
      lower.includes('email') ||
      lower.includes('deploy') ||
      lower.includes('bug') ||
      lower.includes('code') ||
      lower.includes('project') ||
      lower.includes('report')
    ) {
      category = 'Work';
      detectedTags.push('✨ Work');
    } else if (
      lower.includes('study') ||
      lower.includes('exam') ||
      lower.includes('learn') ||
      lower.includes('read') ||
      lower.includes('course') ||
      lower.includes('tutorial')
    ) {
      category = 'Study';
      detectedTags.push('✨ Study');
    } else if (
      lower.includes('grocery') ||
      lower.includes('buy') ||
      lower.includes('call') ||
      lower.includes('mom') ||
      lower.includes('home') ||
      lower.includes('clean') ||
      lower.includes('cook')
    ) {
      category = 'Personal';
      detectedTags.push('✨ Personal');
    }
  }

  return {
    cleanTitle: text || input,
    priority,
    category,
    estimatedMinutes,
    detectedTags,
  };
}
