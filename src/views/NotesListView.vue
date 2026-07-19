<template>
  <div class="notes-list">
    <header class="head">
      <div class="brand">
        <img src="/stride_icon.svg" alt="Stride" class="logo">
        <span class="brand-name">Stride</span>
      </div>
      <button class="icon-btn" @click="router.push('/notes')" :aria-label="t('notes.backAria')">
        <i class="ti ti-arrow-left"></i>
      </button>
    </header>

    <div class="title-row">
      <div class="title">{{ folderTitle }}</div>
      <button class="icon-btn accent" @click="createNote" :aria-label="t('notes.newNoteAria')">
        <i class="ti ti-pencil"></i>
      </button>
    </div>

    <div class="float-bar">
      <div class="search-pill">
        <i class="ti ti-search search-icon"></i>
        <input v-model="query" class="search-input" :placeholder="t('notes.searchPlaceholder')">
      </div>
    </div>

    <div class="body">
      <template v-if="pinned.length">
        <div class="sec-label"><i class="ti ti-pinned"></i> {{ t('notes.pinned') }}</div>
        <div class="note-card">
          <NoteRow v-for="n in pinned" :key="n.id" :note="n" @open="open" @pin="togglePin" @delete="deleteWithUndo" />
        </div>
      </template>

      <template v-for="group in yearGroups" :key="group.year">
        <div class="sec-label">{{ group.year }}</div>
        <div class="note-card">
          <NoteRow v-for="n in group.notes" :key="n.id" :note="n" @open="open" @pin="togglePin" @delete="deleteWithUndo" />
        </div>
      </template>

      <div v-for="tomb in tombstones" :key="'tomb-' + tomb.id" class="tomb-row">
        <span class="tomb-icon"><i class="ti ti-trash"></i></span>
        <span class="tomb-text">{{ tomb.title || t('notes.untitled') }}</span>
        <button class="tomb-undo" @click="undoTomb(tomb)">
          <i class="ti ti-arrow-back-up"></i> {{ t('undo.action') }}
        </button>
      </div>

      <p v-if="!pinned.length && !yearGroups.length && !tombstones.length" class="empty">{{ t('notes.empty') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { useNoteFoldersStore } from '@/stores/noteFolders'
import NoteRow from '@/components/NoteRow.vue'
import type { Note } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()
const foldersStore = useNoteFoldersStore()

onMounted(() => {
  foldersStore.fetchAll()
  notesStore.fetchAll()
})

const folderId = computed(() => route.params.id as string)
const folderTitle = computed(() =>
  folderId.value === 'all' ? t('notes.allNotes') : foldersStore.byId.get(folderId.value)?.name ?? t('notes.allNotes'))

const query = ref('')
const scoped = computed(() => {
  const list = folderId.value === 'all'
    ? notesStore.notes
    : notesStore.notes.filter(n => n.folder_id === folderId.value)
  const q = query.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
})
const pinned = computed(() => scoped.value.filter(n => n.pinned))
const rest = computed(() => scoped.value.filter(n => !n.pinned))

// non-pinned notes bucketed by year (Apple Notes style), newest year and newest note first
const yearGroups = computed(() => {
  const byYear = new Map<number, Note[]>()
  for (const n of rest.value) {
    const year = new Date(n.updated_at).getFullYear()
    const bucket = byYear.get(year)
    if (bucket) bucket.push(n)
    else byYear.set(year, [n])
  }
  return [...byYear.keys()]
    .sort((a, b) => b - a)
    .map(year => ({
      year,
      notes: byYear.get(year)!.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    }))
})

function open(n: Note) {
  router.push(`/notes/note/${n.id}`)
}

async function createNote() {
  const targetFolder = folderId.value === 'all' ? null : folderId.value
  const note = await notesStore.addNote(targetFolder)
  router.push(`/notes/note/${note.id}`)
}

function togglePin(n: Note) {
  notesStore.togglePin(n)
}

// delete (swipe-left) leaves an inline "undo" row for ~5s
const tombstones = ref<Note[]>([])
const tombTimers = new Map<string, ReturnType<typeof setTimeout>>()

async function deleteWithUndo(n: Note) {
  const snapshot = { ...n }
  await notesStore.deleteNote(n.id)
  tombstones.value.push(snapshot)
  tombTimers.set(n.id, setTimeout(() => {
    tombstones.value = tombstones.value.filter(x => x.id !== n.id)
    tombTimers.delete(n.id)
  }, 5000))
}

async function undoTomb(n: Note) {
  const tmr = tombTimers.get(n.id)
  if (tmr) { clearTimeout(tmr); tombTimers.delete(n.id) }
  tombstones.value = tombstones.value.filter(x => x.id !== n.id)
  await notesStore.restoreNote(n)
}
</script>

<style scoped>
.notes-list { display: flex; flex-direction: column; height: 100%; position: relative; }
.head {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px 8px;
}
.brand { display: flex; align-items: center; gap: 9px; }
.logo { height: 26px; width: auto; filter: var(--logo-filter); }
.brand-name { font-size: 19px; font-weight: 600; letter-spacing: -0.5px; color: var(--color-text-primary); position: relative; top: -2px; }

.title-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 10px; }
.title { font-size: 28px; font-weight: 600; letter-spacing: -0.5px; }

.body { flex: 1 1 auto; overflow-y: auto; padding: 4px 18px 24px; }
.sec-label { font-size: 13px; font-weight: 600; color: var(--color-text-tertiary); padding: 14px 4px 6px; }
.sec-label:first-child { padding-top: 4px; }
.sec-label i { font-size: 12px; margin-right: 4px; }

.note-card {
  border-radius: var(--border-radius-lg);
  background: var(--color-background-secondary);
  overflow: hidden;
}
.note-card :deep(.row-wrap:first-child .note-row) { border-top: none; }

.tomb-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 4px; border-top: 0.5px solid var(--color-border-tertiary);
  color: var(--color-text-tertiary); animation: tomb-in .2s ease;
}
.tomb-row .tomb-icon { display: flex; align-items: center; font-size: 18px; }
.tomb-row .tomb-text { flex: 1; min-width: 0; font-size: 15px; text-decoration: line-through; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tomb-undo {
  display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  border: none; cursor: pointer; padding: 5px 12px; border-radius: 999px;
  background: var(--color-background-info); color: var(--color-text-info);
  font-size: 13px; font-weight: 500;
}
.tomb-undo i { font-size: 15px; }
@keyframes tomb-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

.empty { color: var(--color-text-tertiary); font-size: 14px; padding: 24px 0; text-align: center; }

.float-bar {
  flex-shrink: 0;
  display: flex; align-items: center; gap: 10px;
  padding: 0 18px 14px;
}
.search-pill {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 999px;
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
}
.search-icon { font-size: 15px; color: var(--color-text-tertiary); }
.search-input { flex: 1; min-width: 0; border: none; background: none; color: var(--color-text-primary); font-size: 15px; }
.search-input:focus { outline: none; }
</style>
