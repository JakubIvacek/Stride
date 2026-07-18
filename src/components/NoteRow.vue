<template>
  <div class="row-wrap">
    <div v-if="swiping" class="swipe-bg" :class="{ ready: swipeDx < -SWIPE_TH }">
      <i class="ti ti-trash"></i>
    </div>
    <div
      class="note-row"
      :class="{ swiping }"
      :style="swiping ? { transform: `translateX(${swipeDx}px)`, transition: 'none' } : undefined"
      @touchstart="onDown"
      @touchmove="onMove"
      @touchend="onUp"
      @click="emit('open', note)"
    >
      <div class="note-main">
        <div class="note-title">{{ note.title || t('notes.untitled') }}</div>
        <div class="note-sub">
          <span class="note-date">{{ dateLabel }}</span>
          <span v-if="previewText" class="note-sep">·</span>
          <span class="note-preview">{{ previewText }}</span>
        </div>
      </div>
      <button
        class="pin-btn"
        :class="{ on: note.pinned }"
        @click.stop="emit('pin', note)"
        :aria-label="note.pinned ? t('notes.unpinAria') : t('notes.pinAria')"
      >
        <i class="ti" :class="note.pinned ? 'ti-pinned' : 'ti-pin'"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Note } from '@/types'

const props = defineProps<{ note: Note }>()
const emit = defineEmits<{ open: [Note]; pin: [Note]; delete: [Note] }>()

const { t, locale } = useI18n()

const dateLabel = computed(() => {
  const d = new Date(props.note.updated_at)
  const now = new Date()
  const opts: Intl.DateTimeFormatOptions = d.getFullYear() === now.getFullYear()
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short', year: 'numeric' }
  return new Intl.DateTimeFormat(locale.value, opts).format(d)
})
const previewText = computed(() => props.note.body.replace(/\s+/g, ' ').trim())

// swipe-left to delete (touch)
const SWIPE_TH = 80
const swiping = ref(false)
const swipeDx = ref(0)
let sx = 0, sy = 0, tracking = false, horizontal = false

function onDown(e: TouchEvent) {
  sx = e.touches[0].clientX; sy = e.touches[0].clientY
  tracking = true; horizontal = false
  swiping.value = true; swipeDx.value = 0
}
function onMove(e: TouchEvent) {
  if (!tracking) return
  const dx = e.touches[0].clientX - sx
  const dy = e.touches[0].clientY - sy
  if (!horizontal) {
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) horizontal = true
    else if (Math.abs(dy) > 10) { tracking = false; swiping.value = false; return }
    else return
  }
  if (dx > 0) { swipeDx.value = 0; return }
  e.preventDefault()
  swipeDx.value = dx
}
function onUp() {
  const dx = swipeDx.value
  tracking = false; horizontal = false
  swiping.value = false; swipeDx.value = 0
  if (dx < -SWIPE_TH) emit('delete', props.note)
}
</script>

<style scoped>
.row-wrap { position: relative; overflow: hidden; }
.note-row {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 0; border-top: 0.5px solid var(--color-border-tertiary);
  background: var(--color-background-primary); cursor: pointer;
}
.note-row.swiping { transition: transform .2s; }
.note-main { flex: 1; min-width: 0; }
.note-title { font-size: 16px; font-weight: 500; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-sub { display: flex; gap: 5px; font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; white-space: nowrap; overflow: hidden; }
.note-date { flex-shrink: 0; }
.note-sep { flex-shrink: 0; }
.note-preview { overflow: hidden; text-overflow: ellipsis; color: var(--color-text-tertiary); }
.pin-btn { flex-shrink: 0; border: none; background: none; color: var(--color-border-secondary); font-size: 16px; padding: 4px; cursor: pointer; }
.pin-btn.on { color: var(--color-text-info); }

.swipe-bg {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end;
  padding: 0 16px; background: var(--color-text-danger); color: #fff; font-size: 18px;
  filter: saturate(0.85) brightness(0.85);
}
.swipe-bg.ready { filter: none; }
</style>
