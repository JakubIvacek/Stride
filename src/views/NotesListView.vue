<template>
  <div class="notes-list">
    <header class="head">
      <button class="icon-btn" @click="router.push('/notes')" :aria-label="t('notes.backAria')">
        <i class="ti ti-chevron-left"></i>
      </button>
      <div class="title">{{ folderTitle }}</div>
      <button class="icon-btn accent" @click="createNote" :aria-label="t('notes.newNoteAria')">
        <i class="ti ti-plus"></i>
      </button>
    </header>

    <div class="search">
      <i class="ti ti-search search-icon"></i>
      <input v-model="query" class="search-input" :placeholder="t('notes.searchPlaceholder')">
    </div>

    <div class="body">
      <template v-if="pinned.length">
        <div class="sec-label"><i class="ti ti-pinned"></i> {{ t('notes.pinned') }}</div>
        <NoteRow v-for="n in pinned" :key="n.id" :note="n" @open="open" @pin="togglePin" @delete="deleteWithUndo" />
      </template>

      <template v-if="rest.length">
        <div v-if="pinned.length" class="sec-label">{{ t('notes.section') }}</div>
        <NoteRow v-for="n in rest" :key="n.id" :note="n" @open="open" @pin="togglePin" @delete="deleteWithUndo" />
      </template>

      <div v-for="tomb in tombstones" :key="'tomb-' + tomb.id" class="tomb-row">
        <span class="tomb-icon"><i class="ti ti-trash"></i></span>
        <span class="tomb-text">{{ tomb.title || t('notes.untitled') }}</span>
        <button class="tomb-undo" @click="undoTomb(tomb)">
          <i class="ti ti-arrow-back-up"></i> {{ t('undo.action') }}
        </button>
      </div>

      <p v-if="!pinned.length && !rest.length && !tombstones.length" class="empty">{{ t('notes.empty') }}</p>
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
.notes-list { display: flex; flex-direction: column; height: 100%; }
.head {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px 8px;
}
.title { font-size: 17px; font-weight: 500; }
.search { flex-shrink: 0; display: flex; align-items: center; gap: 6px; margin: 0 18px 8px; padding: 7px 10px; border-radius: 10px; background: var(--color-background-secondary); }
.search-icon { font-size: 15px; color: var(--color-text-tertiary); }
.search-input { flex: 1; border: none; background: none; color: var(--color-text-primary); font-size: 15px; }
.search-input:focus { outline: none; }

.body { flex: 1 1 auto; overflow-y: auto; padding: 0 18px 24px; }
.sec-label { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.03em; padding: 12px 0 4px; }
.sec-label i { font-size: 12px; }

.tomb-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-top: 0.5px solid var(--color-border-tertiary);
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
</style>
