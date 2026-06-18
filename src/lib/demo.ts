import type { Category, Task } from '@/types'
import { parseYmd, today, weekdayIndex } from '@/lib/dates'

// Demo mode lets the app render realistic data during `npm run dev` without a
// Google login. Production builds (`npm run build`) use real Supabase data.
// Set VITE_DEMO=false to use live data in dev.
export const isDemo = import.meta.env.DEV && import.meta.env.VITE_DEMO !== 'false'

export const DEMO_CATEGORIES: Category[] = [
  { id: 'demo-cat-1', name: 'Thesis', color: '#007aff' },
  { id: 'demo-cat-2', name: 'Práca', color: '#ff9500' },
  { id: 'demo-cat-3', name: 'Gym', color: '#34c759' },
  { id: 'demo-cat-4', name: 'Iné', color: '#af52de' },
]

const TITLES = [
  'Tréning nohy', 'Prečítať 20 strán', 'Zaliať kvety', 'Nákup', 'Meeting Homoliak',
  'Thesis draft', 'Gym push day', 'Zavolať domov', 'Aave V2 repo check', 'Far Cry 1h',
  'Refactor README', 'Email odpovede', 'Upratať byt', 'Beh 5 km', 'Naučiť sa Vue',
  'Schôdzka s tímom', 'Vyniesť smeti', 'Plánovanie týždňa',
]

const NOTES = [
  'Nezabudnúť detaily', 'Pred obedom', 'Volať vopred', 'Vziať doklady', 'Cca 1 hodina',
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
    // ~4 of every 6 tasks get a category, the rest stay uncategorised
    const catPick = hash(dateStr + ':cat:' + i) % 6
    const category_id = catPick < DEMO_CATEGORIES.length ? DEMO_CATEGORIES[catPick].id : null
    // ~1 of every 3 tasks gets a time of day (08:00–20:00), the rest stay untimed
    const th = hash(dateStr + ':time:' + i)
    const task_time = th % 3 === 0 ? `${String(8 + (th >> 3) % 13).padStart(2, '0')}:${(th >> 6) % 2 ? '30' : '00'}` : null
    // ~1 of every 3 tasks gets an estimated duration
    const dh = hash(dateStr + ':dur:' + i)
    const DURS = [15, 30, 45, 60, 90, 120]
    const duration_min = dh % 3 === 0 ? DURS[(dh >> 4) % DURS.length] : null
    out.push({
      id: `demo-${dateStr}-${i}`,
      title: TITLES[(hi >>> 2) % TITLES.length],
      task_date: dateStr,
      task_time,
      duration_min,
      status,
      category_id,
      note: hi % 4 === 0 ? NOTES[(hi >>> 5) % NOTES.length] : null,
      position: i,
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
