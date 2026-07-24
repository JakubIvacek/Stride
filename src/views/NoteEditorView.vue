<template>
  <div class="editor">
    <header class="head">
      <button class="icon-btn" @click="goBack" :aria-label="t('notes.backAria')" :title="t('notes.backAria')">
        <i class="ti ti-chevron-left"></i>
      </button>
      <div class="head-actions">
        <button
          v-if="note && editing"
          class="icon-btn accent"
          @click="exitEdit"
          :aria-label="t('notes.doneAria')"
          :title="t('notes.doneAria')"
        >
          <i class="ti ti-check"></i>
        </button>
        <template v-else-if="note">
          <button
            class="icon-btn"
            :class="{ accent: note.pinned }"
            @click="togglePin"
            :aria-label="note.pinned ? t('notes.unpinAria') : t('notes.pinAria')"
            :title="note.pinned ? t('notes.unpinAria') : t('notes.pinAria')"
          >
            <i class="ti" :class="note.pinned ? 'ti-pinned' : 'ti-pin'"></i>
          </button>
          <button class="icon-btn" @click="remove" :aria-label="t('notes.deleteNoteAria')" :title="t('notes.deleteNoteAria')">
            <i class="ti ti-trash"></i>
          </button>
        </template>
      </div>
    </header>

    <div v-if="note" class="body">
      <template v-if="editing">
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
      </template>
      <template v-else>
        <div class="title-display" @click="enterEdit">{{ title || t('notes.untitled') }}</div>
        <div v-if="body" class="body-display" @click="enterEdit">
          <template v-for="(segment, i) in bodySegments" :key="i">
            <a
              v-if="segment.url"
              :href="segment.url"
              target="_blank"
              rel="noopener noreferrer"
              class="body-link"
              @click.stop
            >{{ segment.text }}</a>
            <template v-else>{{ segment.text }}</template>
          </template>
        </div>
        <div v-else class="body-display" @click="enterEdit">{{ t('notes.bodyPlaceholder') }}</div>
      </template>
    </div>

    <button v-if="note && !editing" class="edit-fab" @click="enterEdit" :aria-label="t('notes.editAria')" :title="t('notes.editAria')">
      <i class="ti ti-pencil"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()

const noteId = computed(() => route.params.id as string)
const note = computed(() => notesStore.notes.find(n => n.id === noteId.value) ?? null)

const title = ref('')
const body = ref('')
const titleEl = ref<HTMLInputElement | null>(null)
const editing = ref(false)

// matches http(s) urls, bare www. urls, and email addresses
const LINK_RE = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([\w.+-]+@[\w-]+\.[a-zA-Z]{2,})/g

function toHref(matched: string): string | null {
  let href = matched
  if (href.startsWith('www.')) href = `https://${href}`
  else if (!href.includes('://') && href.includes('@')) href = `mailto:${href}`
  try {
    const scheme = new URL(href).protocol
    if (scheme !== 'http:' && scheme !== 'https:' && scheme !== 'mailto:') return null
    return href
  } catch {
    return null
  }
}

interface BodySegment { text: string; url: string | null }

const bodySegments = computed<BodySegment[]>(() => {
  const segments: BodySegment[] = []
  let lastIndex = 0
  for (const match of body.value.matchAll(LINK_RE)) {
    const raw = match[0]
    const start = match.index ?? 0
    const href = toHref(raw)
    if (!href) continue
    if (start > lastIndex) segments.push({ text: body.value.slice(lastIndex, start), url: null })
    segments.push({ text: raw, url: href })
    lastIndex = start + raw.length
  }
  if (lastIndex < body.value.length) segments.push({ text: body.value.slice(lastIndex), url: null })
  return segments
})

onMounted(async () => {
  if (!notesStore.loaded) await notesStore.fetchAll()
  if (note.value) {
    title.value = note.value.title
    body.value = note.value.body
    if (!title.value && !body.value) {
      editing.value = true
      await nextTick()
      titleEl.value?.focus()
    }
  }
})

async function enterEdit() {
  editing.value = true
  await nextTick()
  titleEl.value?.focus()
}
function exitEdit() {
  saveNow()
  editing.value = false
}

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
.editor { display: flex; flex-direction: column; height: 100%; position: relative; }
.head { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 12px 18px 8px; }
.head-actions { display: flex; align-items: center; gap: 8px; }

.body { flex: 1 1 auto; overflow-y: auto; padding: 4px 18px 88px; display: flex; flex-direction: column; }
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

.title-display {
  font-size: 26px; font-weight: 700; letter-spacing: -0.4px; color: var(--color-text-primary);
  padding: 4px 0 10px; cursor: text;
}
.body-display {
  flex: 1 1 auto; white-space: pre-wrap; word-break: break-word;
  color: var(--color-text-primary); font-size: 16px; line-height: 1.5; padding: 4px 0; cursor: text;
}
.body-link { color: var(--color-text-info); text-decoration: underline; cursor: pointer; }

.edit-fab {
  position: absolute; right: 18px; bottom: calc(18px + env(safe-area-inset-bottom));
  width: 46px; height: 46px; border-radius: 50%;
  border: none; cursor: pointer;
  background: var(--color-text-info); color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 19px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: transform .1s ease;
}
.edit-fab:active { transform: scale(0.92); }
</style>
