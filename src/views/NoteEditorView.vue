<template>
  <div class="editor">
    <header class="head">
      <button class="icon-btn" @click="goBack" :aria-label="t('notes.backAria')">
        <i class="ti ti-chevron-left"></i>
      </button>
      <div class="head-actions">
        <button
          v-if="note"
          class="icon-btn"
          :class="{ accent: note.pinned }"
          @click="togglePin"
          :aria-label="note.pinned ? t('notes.unpinAria') : t('notes.pinAria')"
        >
          <i class="ti" :class="note.pinned ? 'ti-pinned' : 'ti-pin'"></i>
        </button>
        <button v-if="note" class="icon-btn" @click="remove" :aria-label="t('notes.deleteNoteAria')">
          <i class="ti ti-trash"></i>
        </button>
      </div>
    </header>

    <div v-if="note" class="body">
      <select
        class="folder-select"
        :value="note.folder_id ?? ''"
        @change="onFolderChange(($event.target as HTMLSelectElement).value)"
        :aria-label="t('notes.folderAria')"
      >
        <option value="">{{ t('notes.noFolder') }}</option>
        <option v-for="f in foldersStore.folders" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>

      <input
        ref="titleEl"
        v-model="title"
        class="title-input"
        :placeholder="t('notes.untitled')"
        @input="scheduleSave"
        @blur="saveNow"
      >
      <textarea
        v-model="body"
        class="body-input"
        :placeholder="t('notes.bodyPlaceholder')"
        @input="scheduleSave"
        @blur="saveNow"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { useNoteFoldersStore } from '@/stores/noteFolders'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()
const foldersStore = useNoteFoldersStore()

const noteId = computed(() => route.params.id as string)
const note = computed(() => notesStore.notes.find(n => n.id === noteId.value) ?? null)

const title = ref('')
const body = ref('')
const titleEl = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  if (!notesStore.loaded) await notesStore.fetchAll()
  if (!foldersStore.loaded) await foldersStore.fetchAll()
  if (note.value) {
    title.value = note.value.title
    body.value = note.value.body
    if (!title.value && !body.value) {
      await nextTick()
      titleEl.value?.focus()
    }
  }
})

// debounced autosave; also flushes on blur and before leaving the page
let saveTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, 600)
}
function saveNow() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
  if (!note.value) return
  if (title.value === note.value.title && body.value === note.value.body) return
  notesStore.updateNote(note.value.id, { title: title.value, body: body.value })
}
onBeforeUnmount(saveNow)

function togglePin() {
  if (note.value) notesStore.togglePin(note.value)
}

function onFolderChange(value: string) {
  if (note.value) notesStore.updateNote(note.value.id, { folder_id: value || null })
}

async function remove() {
  if (!note.value) return
  const folderId = note.value.folder_id
  await notesStore.deleteNote(note.value.id)
  router.replace(`/notes/folder/${folderId ?? 'all'}`)
}

function goBack() {
  saveNow()
  if (window.history.length > 1) router.back()
  else router.push('/notes')
}
</script>

<style scoped>
.editor { display: flex; flex-direction: column; height: 100%; }
.head { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 12px 18px 8px; }
.head-actions { display: flex; align-items: center; gap: 8px; }

.body { flex: 1 1 auto; overflow-y: auto; padding: 4px 18px 24px; display: flex; flex-direction: column; }
.folder-select {
  align-self: flex-start; margin-bottom: 10px; border: 0.5px solid var(--color-border-tertiary);
  background: var(--color-background-secondary); color: var(--color-text-secondary);
  font-size: 13px; padding: 5px 10px; border-radius: 999px;
}
.title-input {
  border: none; background: none; color: var(--color-text-primary);
  font-size: 22px; font-weight: 600; letter-spacing: -0.3px; padding: 4px 0 8px;
}
.title-input:focus { outline: none; }
.body-input {
  flex: 1 1 auto; border: none; background: none; resize: none;
  color: var(--color-text-primary); font-size: 16px; line-height: 1.5; padding: 4px 0;
  font-family: inherit;
}
.body-input:focus { outline: none; }
</style>
