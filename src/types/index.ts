export type TaskStatus = 'todo' | 'done'
export type TaskRepeat = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Category {
  id: string
  name: string
  color: string
  position?: number
  created_at?: string
}

export interface NoteFolder {
  id: string
  name: string
  position: number
  created_at: string
}

export interface Note {
  id: string
  title: string
  body: string
  pinned: boolean
  folder_id: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  task_date: string            // 'YYYY-MM-DD'
  task_time: string | null     // 'HH:MM' (local) or null = no specific time
  duration_min: number | null  // estimated duration in minutes, or null
  priority: boolean            // flagged as important
  repeat: TaskRepeat           // recurrence; spawns the next on complete
  status: TaskStatus
  category_id: string | null
  note: string | null
  position: number             // order within a day
  created_at: string
  completed_at: string | null
}
