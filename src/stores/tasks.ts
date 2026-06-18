import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoTasksForRange, isDemo } from '@/lib/demo'
import type { Task, TaskStatus } from '@/types'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  // next free position within a day (append to the end), based on loaded tasks
  function nextPosition(task_date: string): number {
    const inDay = tasks.value.filter(t => t.task_date === task_date)
    return inDay.length ? Math.max(...inDay.map(t => t.position ?? 0)) + 1 : 0
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

  async function addTask(
    title: string,
    task_date: string,
    category_id: string | null = null,
    task_time: string | null = null,
    duration_min: number | null = null,
  ) {
    const position = nextPosition(task_date)
    if (isDemo) {
      tasks.value.push({
        id: `demo-${crypto.randomUUID()}`,
        title, task_date, task_time, duration_min, status: 'todo',
        category_id, note: null, position,
        created_at: new Date().toISOString(), completed_at: null,
      })
      return
    }
    const { data, error } = await supabase
      .from('tasks').insert({ title, task_date, task_time, duration_min, category_id, position }).select().single()
    if (error) throw error
    tasks.value.push(data)
  }

  async function toggleTask(task: Task) {
    const next: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    const completed_at = next === 'done' ? new Date().toISOString() : null
    if (!isDemo) {
      const { error } = await supabase
        .from('tasks').update({ status: next, completed_at }).eq('id', task.id)
      if (error) throw error
    }
    task.status = next
    task.completed_at = completed_at
  }

  async function deleteTask(id: string) {
    if (!isDemo) {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    }
    tasks.value = tasks.value.filter(t => t.id !== id)
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

  return { tasks, loading, fetchRange, addTask, toggleTask, deleteTask, updateTask, reorderTasks }
})
