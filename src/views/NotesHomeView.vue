<template>
  <div class="notes-home">
    <header class="head">
      <div class="title">{{ t('tab.notes') }}</div>
      <button class="icon-btn accent" @click="creatingFolder = true" :aria-label="t('notes.newFolderAria')">
        <i class="ti ti-folder-plus"></i>
      </button>
    </header>

    <div class="list">
      <RouterLink to="/notes/folder/all" class="frow all-notes">
        <span class="frow-icon"><i class="ti ti-notes"></i></span>
        <span class="frow-name">{{ t('notes.allNotes') }}</span>
        <span class="frow-count">{{ notesStore.notes.length }}</span>
        <i class="ti ti-chevron-right frow-chevron"></i>
      </RouterLink>

      <draggable
        :model-value="folders.folders"
        item-key="id"
        handle=".folder-drag"
        :animation="150"
        @update:model-value="folders.reorderFolders"
      >
        <template #item="{ element: f }">
          <div class="frow-wrap">
            <div v-if="swipeId === f.id" class="swipe-bg" :class="{ ready: swipeDx < -SWIPE_TH }">
              <i class="ti ti-trash"></i>
            </div>
            <div
              class="frow folder-row"
              :class="{ swiping: swipeId === f.id }"
              :style="swipeStyle(f.id)"
              @touchstart="onDown($event, f)"
              @touchmove="onMove($event, f)"
              @touchend="onUp($event, f)"
            >
              <span class="folder-drag" @touchstart.stop :aria-label="t('day.reorder')"><i class="ti ti-grip-vertical"></i></span>
              <span class="frow-icon"><i class="ti ti-folder"></i></span>
              <input
                v-if="renamingId === f.id"
                v-model="renameValue"
                class="rename-input"
                @blur="commitRename(f)"
                @keyup.enter="commitRename(f)"
                @keyup.esc="renamingId = null"
              >
              <RouterLink v-else :to="`/notes/folder/${f.id}`" class="frow-name-link" @click.stop>
                {{ f.name }}
              </RouterLink>
              <span class="frow-count">{{ countFor(f.id) }}</span>
              <button class="trash" @click.stop="startRename(f)" :aria-label="t('notes.renameAria')">
                <i class="ti ti-pencil"></i>
              </button>
              <button class="trash" @click.stop="deleteFolder(f)" :aria-label="t('notes.deleteFolderAria')">
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </div>
        </template>
      </draggable>

      <div v-for="tomb in tombstones" :key="'tomb-' + tomb.folder.id" class="frow-tomb">
        <span class="tomb-icon"><i class="ti ti-trash"></i></span>
        <span class="tomb-text">{{ tomb.folder.name }}</span>
        <button class="tomb-undo" @click="undoTomb(tomb)">
          <i class="ti ti-arrow-back-up"></i> {{ t('undo.action') }}
        </button>
      </div>

      <div v-if="creatingFolder" class="new-folder-row">
        <input
          ref="newFolderInput"
          v-model="newFolderName"
          class="rename-input"
          :placeholder="t('notes.folderNamePlaceholder')"
          @keyup.enter="addFolder"
          @keyup.esc="creatingFolder = false"
          @blur="addFolder"
        >
      </div>

      <p v-if="!folders.folders.length && !tombstones.length && !creatingFolder" class="empty">{{ t('notes.emptyFolders') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'
import { useNotesStore } from '@/stores/notes'
import { useNoteFoldersStore } from '@/stores/noteFolders'
import type { NoteFolder } from '@/types'

const { t } = useI18n()
const notesStore = useNotesStore()
const folders = useNoteFoldersStore()

onMounted(() => {
  folders.fetchAll()
  notesStore.fetchAll()
})

function countFor(folderId: string): number {
  return notesStore.notes.filter(n => n.folder_id === folderId).length
}

// new folder
const creatingFolder = ref(false)
const newFolderName = ref('')
const newFolderInput = ref<HTMLInputElement | null>(null)
watch(creatingFolder, async v => {
  if (v) { await nextTick(); newFolderInput.value?.focus() }
})
// closing the input (v-if unmount) fires a blur event on top of keyup.enter's
// explicit call, so guard against the resulting double-submit
async function addFolder() {
  if (!creatingFolder.value) return
  const name = newFolderName.value.trim()
  creatingFolder.value = false
  if (!name) { newFolderName.value = ''; return }
  await folders.addFolder(name)
  newFolderName.value = ''
}

// rename
const renamingId = ref<string | null>(null)
const renameValue = ref('')
function startRename(f: NoteFolder) {
  renamingId.value = f.id
  renameValue.value = f.name
}
async function commitRename(f: NoteFolder) {
  if (renamingId.value !== f.id) return
  const name = renameValue.value.trim()
  renamingId.value = null
  if (name && name !== f.name) await folders.renameFolder(f.id, name)
}

// delete (via trash tap or swipe-left) leaves an inline "undo" row for ~5s
type Tomb = { folder: NoteFolder; noteIds: string[] }
const tombstones = ref<Tomb[]>([])
const tombTimers = new Map<string, ReturnType<typeof setTimeout>>()

async function deleteFolder(f: NoteFolder) {
  renamingId.value = null
  const noteIds = await folders.deleteFolder(f.id)
  tombstones.value.push({ folder: { ...f }, noteIds })
  tombTimers.set(f.id, setTimeout(() => {
    tombstones.value = tombstones.value.filter(x => x.folder.id !== f.id)
    tombTimers.delete(f.id)
  }, 5000))
}

async function undoTomb(tomb: Tomb) {
  const tmr = tombTimers.get(tomb.folder.id)
  if (tmr) { clearTimeout(tmr); tombTimers.delete(tomb.folder.id) }
  tombstones.value = tombstones.value.filter(x => x.folder.id !== tomb.folder.id)
  await folders.restoreFolder(tomb.folder, tomb.noteIds)
}

// swipe-left a folder row to delete (touch)
const SWIPE_TH = 70
const swipeId = ref<string | null>(null)
const swipeDx = ref(0)
let sx = 0, sy = 0, swiping = false, horizontal = false

function swipeStyle(id: string) {
  if (swipeId.value !== id) return undefined
  return { transform: `translateX(${swipeDx.value}px)`, transition: 'none' }
}
function onDown(e: TouchEvent, f: NoteFolder) {
  sx = e.touches[0].clientX; sy = e.touches[0].clientY
  swiping = true; horizontal = false
  swipeId.value = f.id; swipeDx.value = 0
}
function onMove(e: TouchEvent, _f: NoteFolder) {
  if (!swiping) return
  const dx = e.touches[0].clientX - sx
  const dy = e.touches[0].clientY - sy
  if (!horizontal) {
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) horizontal = true
    else if (Math.abs(dy) > 10) { swiping = false; swipeId.value = null; return }
    else return
  }
  if (dx > 0) { swipeDx.value = 0; return }
  e.preventDefault()
  swipeDx.value = dx
}
function onUp(_e: TouchEvent, f: NoteFolder) {
  const dx = swipeDx.value
  swiping = false; horizontal = false
  swipeId.value = null; swipeDx.value = 0
  if (dx < -SWIPE_TH) deleteFolder(f)
}

</script>

<style scoped>
.notes-home { padding: 0 18px 24px; }
.head { display: flex; align-items: center; justify-content: space-between; padding: 14px 0 10px; }
.title { font-size: 28px; font-weight: 600; letter-spacing: -0.5px; }

.list { display: flex; flex-direction: column; }
.frow {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 0; border-top: 0.5px solid var(--color-border-tertiary);
  background: var(--color-background-primary);
  text-decoration: none; color: var(--color-text-primary);
}
.frow-wrap { position: relative; overflow: hidden; }
.folder-row.swiping { transition: transform .2s; }
.frow-icon { display: flex; align-items: center; font-size: 19px; color: var(--color-text-info); flex-shrink: 0; }
.frow-name { font-size: 16px; flex: 1; }
.frow-name-link { flex: 1; min-width: 0; font-size: 16px; color: var(--color-text-primary); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.frow-count { font-size: 15px; color: var(--color-text-tertiary); flex-shrink: 0; }
.frow-chevron { color: var(--color-text-tertiary); font-size: 16px; flex-shrink: 0; }
.all-notes .frow-icon { color: var(--color-text-info); }

.folder-drag { display: flex; align-items: center; flex-shrink: 0; color: var(--color-text-tertiary); font-size: 17px; cursor: grab; touch-action: none; }
.folder-drag:active { cursor: grabbing; }
.trash { border: none; background: none; color: var(--color-text-tertiary); cursor: pointer; font-size: 16px; padding: 4px; flex-shrink: 0; }
.rename-input { flex: 1; min-width: 0; border: none; background: none; color: var(--color-text-primary); font-size: 16px; padding: 4px 0; }
.rename-input:focus { outline: none; }

.swipe-bg {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end;
  padding: 0 4px; background: var(--color-text-danger); color: #fff; font-size: 18px;
  filter: saturate(0.85) brightness(0.85);
}
.swipe-bg.ready { filter: none; }

.frow-tomb {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 0; border-top: 0.5px solid var(--color-border-tertiary);
  color: var(--color-text-tertiary); animation: tomb-in .2s ease;
}
.frow-tomb .tomb-icon { display: flex; align-items: center; font-size: 18px; }
.frow-tomb .tomb-text { flex: 1; min-width: 0; font-size: 15px; text-decoration: line-through; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tomb-undo {
  display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  border: none; cursor: pointer; padding: 5px 12px; border-radius: 999px;
  background: var(--color-background-info); color: var(--color-text-info);
  font-size: 13px; font-weight: 500;
}
.tomb-undo i { font-size: 15px; }
@keyframes tomb-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

.new-folder-row { padding: 11px 0; border-top: 0.5px solid var(--color-border-tertiary); }
.empty { color: var(--color-text-tertiary); font-size: 14px; padding: 16px 0; }
</style>
