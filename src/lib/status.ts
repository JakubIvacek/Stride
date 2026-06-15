import type { Task } from '@/types'

// The single source of truth for the app-wide color logic (see CLAUDE.md):
//   done    → green   (all tasks that day are done)
//   missed  → red     (past day that had tasks but wasn't finished)
//   planned → gray    (today/future, not yet judged)
//   none    → nothing (day had no tasks)
export type DayStatus = 'done' | 'missed' | 'planned' | 'none'

export function dayStatus(tasks: Task[], dateStr: string, todayStr: string): DayStatus {
  if (tasks.length === 0) return 'none'
  if (tasks.every(t => t.status === 'done')) return 'done'
  if (dateStr < todayStr) return 'missed'
  return 'planned'
}

export const STATUS_COLOR: Record<DayStatus, string> = {
  done: 'var(--color-text-success)',
  missed: 'var(--color-text-danger)',
  planned: 'var(--color-text-tertiary)',
  none: 'transparent',
}
