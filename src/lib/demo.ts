import type { Task } from '@/types'
import { parseYmd, today, weekdayIndex } from '@/lib/dates'

// Demo mode lets the app render realistic data during `npm run dev` without a
// Google login. Production builds (`npm run build`) use real Supabase data.
// Set VITE_DEMO=false to use live data in dev.
export const isDemo = import.meta.env.DEV && import.meta.env.VITE_DEMO !== 'false'

const TITLES = [
  'Tréning nohy', 'Prečítať 20 strán', 'Zaliať kvety', 'Nákup', 'Meeting Homoliak',
  'Thesis draft', 'Gym push day', 'Zavolať domov', 'Aave V2 repo check', 'Far Cry 1h',
  'Refactor README', 'Email odpovede', 'Upratať byt', 'Beh 5 km', 'Naučiť sa Vue',
  'Schôdzka s tímom', 'Vyniesť smeti', 'Plánovanie týždňa',
]

// Deterministic hash so the same date always yields the same tasks.
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0)
}

function tasksForDate(dateStr: string, todayStr: string): Task[] {
  const h = hash(dateStr)
  const wd = weekdayIndex(dateStr)
  // Sundays often empty; otherwise 0–4 tasks.
  let count = wd === 6 ? h % 2 : h % 5
  // A handful of empty weekdays for visual variety.
  if ((h >> 3) % 7 === 0) count = 0
  if (count === 0) return []

  const out: Task[] = []
  for (let i = 0; i < count; i++) {
    const hi = hash(dateStr + ':' + i)
    let status: 'todo' | 'done' = 'todo'
    if (dateStr < todayStr) {
      // Past: ~70% of days fully done, the rest partially "missed".
      status = h % 10 < 7 ? 'done' : (hi % 3 === 0 ? 'todo' : 'done')
    } else if (dateStr === todayStr) {
      status = hi % 3 === 0 ? 'done' : 'todo' // partial today
    }
    out.push({
      id: `demo-${dateStr}-${i}`,
      title: TITLES[(hi >>> 2) % TITLES.length],
      task_date: dateStr,
      status,
      category_id: null,
      note: null,
      created_at: dateStr + 'T08:00:00.000Z',
      completed_at: status === 'done' ? dateStr + 'T18:00:00.000Z' : null,
    })
  }
  return out
}

export function demoTasksForRange(from: string, to: string): Task[] {
  const todayStr = today()
  const out: Task[] = []
  const end = parseYmd(to)
  for (let d = parseYmd(from); d <= end; d.setDate(d.getDate() + 1)) {
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    out.push(...tasksForDate(ds, todayStr))
  }
  return out
}
