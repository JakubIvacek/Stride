import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { DEMO_NOTES, isDemo } from '@/lib/demo'
import type { Note } from '@/types'

// Sort: pinned first, then most-recently-edited first — matches Apple Notes'
// default "Date Edited" sort. No manual drag reorder (would fight this).
function sortNotes(list: Note[]): Note[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.updated_at.localeCompare(a.updated_at)
  })
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      if (isDemo) {
        if (!loaded.value) notes.value = DEMO_NOTES.map(n => ({ ...n }))
        loaded.value = true
        return
      }
      const { data, error } = await supabase
        .from('notes').select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false })
      if (error) throw error
      notes.value = data ?? []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function addNote(folder_id: string | null = null): Promise<Note> {
    const now = new Date().toISOString()
    if (isDemo) {
      const note: Note = {
        id: `demo-note-${crypto.randomUUID()}`, title: '', body: '', pinned: false,
        folder_id, position: 0, created_at: now, updated_at: now,
      }
      notes.value.unshift(note)
      return note
    }
    const { data, error } = await supabase
      .from('notes').insert({ title: '', body: '', folder_id }).select().single()
    if (error) throw error
    notes.value.unshift(data)
    return data
  }

  async function updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'body' | 'folder_id'>>) {
    const updated_at = new Date().toISOString()
    if (!isDemo) {
      const { error } = await supabase.from('notes').update({ ...updates, updated_at }).eq('id', id)
      if (error) throw error
    }
    const n = notes.value.find(x => x.id === id)
    if (n) Object.assign(n, updates, { updated_at })
  }

  async function togglePin(note: Note) {
    const pinned = !note.pinned
    if (!isDemo) {
      const { error } = await supabase.from('notes').update({ pinned }).eq('id', note.id)
      if (error) throw error
    }
    note.pinned = pinned
  }

  async function deleteNote(id: string) {
    if (!isDemo) {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
    }
    notes.value = notes.value.filter(n => n.id !== id)
  }

  // re-insert a previously deleted note (for undo)
  async function restoreNote(note: Note) {
    if (isDemo) {
      notes.value.push({ ...note })
    } else {
      const { id: _id, ...fields } = note
      const { data, error } = await supabase.from('notes').insert(fields).select().single()
      if (error) throw error
      notes.value.push(data)
    }
  }

  return {
    notes, loading, loaded,
    fetchAll, addNote, updateNote, togglePin, deleteNote, restoreNote,
    sortNotes,
  }
})
