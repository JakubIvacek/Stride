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
  status: TaskStatus
  category_id: string | null
  note: string | null
  created_at: string
  completed_at: string | null
}
