// Export/import the user's data as a JSON backup. Import is additive (it adds
// the backup's categories + tasks alongside whatever already exists) and remaps
// category ids so references stay intact.
import { useTasksStore } from '@/stores/tasks'
import { useCategoriesStore } from '@/stores/categories'
import { today } from '@/lib/dates'
import type { Task, TaskRepeat } from '@/types'

export async function exportBackup() {
  const tasksStore = useTasksStore()
  const catStore = useCategoriesStore()
  const tasks = await tasksStore.getAllTasks()
  const payload = {
    app: 'stride',
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: catStore.categories.map(c => ({ id: c.id, name: c.name, color: c.color })),
    tasks: tasks.map(({ id: _id, ...t }) => t),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stride-backup-${today()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export type ImportResult = { categories: number; tasks: number }

export async function importBackup(file: File): Promise<ImportResult> {
  const data = JSON.parse(await file.text())
  if (!data || !Array.isArray(data.tasks)) throw new Error('Invalid backup file')
  const tasksStore = useTasksStore()
  const catStore = useCategoriesStore()

  // insert categories, mapping old id -> new id
  const idMap = new Map<string, string>()
  const cats: any[] = Array.isArray(data.categories) ? data.categories : []
  for (const c of cats) {
    if (!c?.name) continue
    const created = await catStore.addCategory(c.name, c.color || '#8E8E93')
    if (c.id) idMap.set(c.id, created.id)
  }

  // insert tasks with remapped category_id
  const rows: Partial<Task>[] = data.tasks
    .filter((t: any) => t?.title && t?.task_date)
    .map((t: any) => ({
      title: String(t.title),
      task_date: String(t.task_date),
      task_time: t.task_time ?? null,
      duration_min: t.duration_min ?? null,
      priority: !!t.priority,
      repeat: (['none', 'daily', 'weekly', 'monthly'].includes(t.repeat) ? t.repeat : 'none') as TaskRepeat,
      status: t.status === 'done' ? 'done' : 'todo',
      category_id: t.category_id ? (idMap.get(t.category_id) ?? null) : null,
      note: t.note ?? null,
      position: typeof t.position === 'number' ? t.position : 0,
      completed_at: t.completed_at ?? null,
    }))
  await tasksStore.importTasks(rows)
  return { categories: cats.length, tasks: rows.length }
}
