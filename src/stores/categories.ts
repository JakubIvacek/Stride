import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { DEMO_CATEGORIES, isDemo } from '@/lib/demo'
import { useTasksStore } from '@/stores/tasks'
import type { Category } from '@/types'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loaded = ref(false)

  const byId = computed(() => {
    const m = new Map<string, Category>()
    for (const c of categories.value) m.set(c.id, c)
    return m
  })

  function color(id: string | null): string | null {
    return id ? byId.value.get(id)?.color ?? null : null
  }

  async function fetchAll() {
    if (isDemo) {
      if (!loaded.value) categories.value = DEMO_CATEGORIES.map(c => ({ ...c }))
      loaded.value = true
      return
    }
    const { data, error } = await supabase
      .from('categories').select('id, name, color, created_at')
      .order('created_at', { ascending: true })
    if (error) throw error
    categories.value = data ?? []
    loaded.value = true
  }

  async function addCategory(name: string, color: string): Promise<Category> {
    if (isDemo) {
      const cat: Category = { id: `demo-cat-${crypto.randomUUID()}`, name, color }
      categories.value.push(cat)
      return cat
    }
    const { data, error } = await supabase
      .from('categories').insert({ name, color }).select().single()
    if (error) throw error
    categories.value.push(data)
    return data
  }

  async function updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'color'>>) {
    if (!isDemo) {
      const { error } = await supabase.from('categories').update(updates).eq('id', id)
      if (error) throw error
    }
    const c = categories.value.find(x => x.id === id)
    if (c) Object.assign(c, updates)
  }

  async function deleteCategory(id: string) {
    if (!isDemo) {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    }
    categories.value = categories.value.filter(c => c.id !== id)
    // mirror the DB's `on delete set null`: clear the category on loaded tasks
    const tasks = useTasksStore()
    for (const t of tasks.tasks) if (t.category_id === id) t.category_id = null
  }

  return { categories, loaded, byId, color, fetchAll, addCategory, updateCategory, deleteCategory }
})
