import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoTasksForRange, isDemo } from '@/lib/demo'
import { addDays, nextRepeatDate, today } from '@/lib/dates'
import type { Task, TaskRepeat, TaskStatus } from '@/types'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const overdue = ref<Task[]>([]) // incomplete tasks from before today (any week)
  const loading = ref(false)

  // next free position within a day (append to the end), based on loaded tasks
  function nextPosition(task_date: string): number {
    const inDay = tasks.value.filter(t => t.task_date === task_date)
    return inDay.length ? Math.max(...inDay.map(t => t.position ?? 0)) + 1 : 0
  }

  // all of the user's tasks (for export/backup)
  async function getAllTasks(): Promise<Task[]> {
    if (isDemo) return demoTasksForRange(addDays(today(), -120), addDays(today(), 30))
    const { data, error } = await supabase
      .from('tasks').select('*').order('task_date', { ascending: true })
    if (error) throw error
    return data ?? []
  }

  // bulk-insert imported tasks (rows already carry remapped category_id);
  // strips id/user_id so the DB assigns fresh ones
  async function importTasks(rows: Partial<Task>[]) {
    if (!rows.length) return
    const clean = rows.map(({ id: _id, ...r }) => r)
    if (isDemo) {
      clean.forEach(r => tasks.value.push({ ...(r as Task), id: `demo-${crypto.randomUUID()}` }))
      return
    }
    const { error } = await supabase.from('tasks').insert(clean)
    if (error) throw error
  }

  // e.g. Monday–Sunday of a week ('2026-06-08', '2026-06-14')
  async function fetchRange(from: string, to: string) {
    loading.value = true
    try {
      if (isDemo) {
        tasks.value = demoTasksForRange(from, to)
        return
      }
      const { data, error } = await supabase
        .from('tasks').select('*')
        .gte('task_date', from).lte('task_date', to)
        .order('task_date', { ascending: true })
        .order('position', { ascending: true })
      if (error) throw error
      tasks.value = data ?? []
    } finally {
      loading.value = false
    }
  }

  // all incomplete tasks dated before today (independent of the loaded week)
  async function fetchOverdue() {
    const t = today()
    if (isDemo) {
      overdue.value = demoTasksForRange(addDays(t, -60), addDays(t, -1)).filter(x => x.status === 'todo')
      return
    }
    const { data, error } = await supabase
      .from('tasks').select('*')
      .eq('status', 'todo').lt('task_date', t)
      .order('task_date', { ascending: true })
    if (error) throw error
    overdue.value = data ?? []
  }

  // re-insert a deleted overdue task back into the overdue list (for undo)
  async function restoreOverdue(task: Task) {
    if (isDemo) {
      overdue.value.push({ ...task })
    } else {
      const { id: _id, ...fields } = task
      const { data, error } = await supabase.from('tasks').insert(fields).select().single()
      if (error) throw error
      overdue.value.push(data)
    }
    overdue.value.sort((a, b) => a.task_date.localeCompare(b.task_date))
  }

  // move an overdue task to today (resolves it out of the overdue list)
  async function moveToToday(task: Task) {
    const date = today()
    const position = nextPosition(date)
    if (!isDemo) {
      const { error } = await supabase.from('tasks').update({ task_date: date, position }).eq('id', task.id)
      if (error) throw error
    }
    overdue.value = overdue.value.filter(t => t.id !== task.id)
    task.task_date = date
    task.position = position
    if (!tasks.value.some(t => t.id === task.id)) tasks.value.push(task)
  }

  async function addTask(
    title: string,
    task_date: string,
    category_id: string | null = null,
    task_time: string | null = null,
    duration_min: number | null = null,
    note: string | null = null,
    repeat: TaskRepeat = 'none',
  ) {
    const position = nextPosition(task_date)
    if (isDemo) {
      tasks.value.push({
        id: `demo-${crypto.randomUUID()}`,
        title, task_date, task_time, duration_min, priority: false, repeat, status: 'todo',
        category_id, note, position,
        created_at: new Date().toISOString(), completed_at: null,
      })
      return
    }
    const { data, error } = await supabase
      .from('tasks').insert({ title, task_date, task_time, duration_min, category_id, note, repeat, position }).select().single()
    if (error) throw error
    tasks.value.push(data)
  }

  // Insert the next occurrence of a recurring task on its next date (carries
  // over time/duration/category/note/priority/repeat). Demo pushes locally.
  async function spawnNextOccurrence(task: Task) {
    if (task.repeat === 'none') return
    const task_date = nextRepeatDate(task.task_date, task.repeat)
    const fields = {
      title: task.title, task_date, task_time: task.task_time, duration_min: task.duration_min,
      category_id: task.category_id, note: task.note, priority: task.priority, repeat: task.repeat,
      position: nextPosition(task_date),
    }
    if (isDemo) {
      tasks.value.push({
        ...fields, id: `demo-${crypto.randomUUID()}`, status: 'todo',
        created_at: new Date().toISOString(), completed_at: null,
      })
      return
    }
    const { data, error } = await supabase.from('tasks').insert(fields).select().single()
    if (error) throw error
    tasks.value.push(data)
  }

  async function toggleTask(task: Task) {
    const next: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    const completed_at = next === 'done' ? new Date().toISOString() : null
    // completing a recurring task spawns the next occurrence and clears repeat
    // on this one, so re-toggling never spawns a duplicate
    const spawn = next === 'done' && task.repeat !== 'none'
    const updates = spawn
      ? { status: next, completed_at, repeat: 'none' as TaskRepeat }
      : { status: next, completed_at }
    if (!isDemo) {
      const { error } = await supabase.from('tasks').update(updates).eq('id', task.id)
      if (error) throw error
    }
    if (spawn) await spawnNextOccurrence(task)
    Object.assign(task, updates)
    // a completed task is no longer overdue
    if (next === 'done') overdue.value = overdue.value.filter(t => t.id !== task.id)
  }

  async function deleteTask(id: string) {
    if (!isDemo) {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    }
    tasks.value = tasks.value.filter(t => t.id !== id)
    overdue.value = overdue.value.filter(t => t.id !== id)
  }

  // Re-insert a previously deleted task (for undo). Keeps its day/position/state;
  // in real DB it gets a fresh id (id is never referenced elsewhere).
  async function restoreTask(task: Task) {
    if (isDemo) {
      tasks.value.push({ ...task })
      return
    }
    const { id: _id, ...fields } = task
    const { data, error } = await supabase.from('tasks').insert(fields).select().single()
    if (error) throw error
    tasks.value.push(data)
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    // when moving a task to another day, append it to the end of that day
    if (updates.task_date) {
      const cur = tasks.value.find(t => t.id === id)
      if (cur && updates.task_date !== cur.task_date && updates.position === undefined) {
        updates = { ...updates, position: nextPosition(updates.task_date) }
      }
    }
    if (!isDemo) {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id)
      if (error) throw error
    }
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx >= 0) Object.assign(tasks.value[idx], updates)
  }

  // persist a new order for the given day's tasks (ids in their new order)
  async function reorderTasks(task_date: string, orderedIds: string[]) {
    const changed: { id: string; position: number }[] = []
    orderedIds.forEach((id, position) => {
      const t = tasks.value.find(x => x.id === id)
      if (t && t.position !== position) {
        t.position = position
        changed.push({ id, position })
      }
    })
    if (!isDemo && changed.length) {
      await Promise.all(
        changed.map(c => supabase.from('tasks').update({ position: c.position }).eq('id', c.id)),
      )
    }
  }

  return {
    tasks, overdue, loading,
    fetchRange, fetchOverdue, moveToToday, restoreOverdue, getAllTasks, importTasks,
    addTask, toggleTask, deleteTask, restoreTask, updateTask, reorderTasks,
  }
})
