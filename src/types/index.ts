export type TaskStatus = 'todo' | 'done'

export interface Category {
  id: string
  name: string
  color: string
  created_at?: string
}

export interface Task {
  id: string
  title: string
  task_date: string            // 'YYYY-MM-DD'
  task_time: string | null     // 'HH:MM' (local) or null = no specific time
  duration_min: number | null  // estimated duration in minutes, or null
  status: TaskStatus
  category_id: string | null
  note: string | null
  position: number             // order within a day
  created_at: string
  completed_at: string | null
}
