import type { Task } from '@/types'

// Order tasks within a day: timed tasks first, ascending by time of day;
// untimed tasks keep their manual (drag & drop) position order below them.
// Ties fall back to position so the order stays stable.
export function byDayOrder(a: Task, b: Task): number {
  const ta = a.task_time, tb = b.task_time
  if (ta && tb) return ta.localeCompare(tb) || a.position - b.position
  if (ta) return -1
  if (tb) return 1
  return a.position - b.position
}
