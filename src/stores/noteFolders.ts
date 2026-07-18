import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { DEMO_NOTE_FOLDERS, isDemo } from '@/lib/demo'
import { useNotesStore } from '@/stores/notes'
import type { NoteFolder } from '@/types'

export const useNoteFoldersStore = defineStore('noteFolders', () => {
  const folders = ref<NoteFolder[]>([])
  const loaded = ref(false)

  const byId = computed(() => {
    const m = new Map<string, NoteFolder>()
    for (const f of folders.value) m.set(f.id, f)
    return m
  })

  async function fetchAll() {
    if (isDemo) {
      if (!loaded.value) folders.value = DEMO_NOTE_FOLDERS.map(f => ({ ...f }))
      loaded.value = true
      return
    }
    const { data, error } = await supabase
      .from('note_folders').select('id, name, position, created_at')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error
    folders.value = data ?? []
    loaded.value = true
  }

  const nextPosition = () =>
    folders.value.length ? Math.max(...folders.value.map(f => f.position ?? 0)) + 1 : 0

  async function addFolder(name: string): Promise<NoteFolder> {
    const position = nextPosition()
    if (isDemo) {
      const folder: NoteFolder = { id: `demo-folder-${crypto.randomUUID()}`, name, position, created_at: new Date().toISOString() }
      folders.value.push(folder)
      return folder
    }
    const { data, error } = await supabase
      .from('note_folders').insert({ name, position }).select().single()
    if (error) throw error
    folders.value.push(data)
    return data
  }

  async function renameFolder(id: string, name: string) {
    if (!isDemo) {
      const { error } = await supabase.from('note_folders').update({ name }).eq('id', id)
      if (error) throw error
    }
    const f = folders.value.find(x => x.id === id)
    if (f) f.name = name
  }

  // persist a new order (drag & drop)
  async function reorderFolders(ordered: NoteFolder[]) {
    folders.value = ordered
    ordered.forEach((f, i) => { f.position = i })
    if (!isDemo) {
      await Promise.all(ordered.map((f, i) =>
        supabase.from('note_folders').update({ position: i }).eq('id', f.id)))
    }
  }

  // deleting a folder clears folder_id on its notes (mirrors DB's `on delete set null`);
  // returns the ids of notes that had this folder (for undo re-linking)
  async function deleteFolder(id: string): Promise<string[]> {
    if (!isDemo) {
      const { error } = await supabase.from('note_folders').delete().eq('id', id)
      if (error) throw error
    }
    folders.value = folders.value.filter(f => f.id !== id)
    const notes = useNotesStore()
    const affected: string[] = []
    for (const n of notes.notes) if (n.folder_id === id) { affected.push(n.id); n.folder_id = null }
    return affected
  }

  // re-insert a deleted folder (for undo) and re-link the notes that had it
  async function restoreFolder(folder: NoteFolder, noteIds: string[]) {
    let newId = folder.id
    if (isDemo) {
      folders.value.push({ ...folder })
    } else {
      const { data, error } = await supabase
        .from('note_folders').insert({ name: folder.name }).select().single()
      if (error) throw error
      folders.value.push(data)
      newId = data.id
    }
    const notes = useNotesStore()
    for (const id of noteIds) {
      const n = notes.notes.find(x => x.id === id)
      if (n) n.folder_id = newId
    }
    if (!isDemo && noteIds.length) {
      await Promise.all(noteIds.map(id =>
        supabase.from('notes').update({ folder_id: newId }).eq('id', id)))
    }
  }

  return { folders, loaded, byId, fetchAll, addFolder, renameFolder, deleteFolder, restoreFolder, reorderFolders }
})
