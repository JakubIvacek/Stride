<template>
  <section v-if="store.overdue.length || tombstones.length" class="overdue">
    <button class="ov-head" @click="open = !open">
      <span class="ov-title">
        <i class="ti ti-alert-triangle"></i>
        {{ t('overdue.title') }} ({{ store.overdue.length }})
      </span>
      <i class="ti" :class="open ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
    </button>

    <div v-if="open" class="ov-list">
      <!-- rows (swipe: → done, ← delete) -->
      <div v-for="task in store.overdue" :key="task.id" class="swipe-wrap">
        <template v-if="swipeId === task.id">
          <div v-if="swipeDx > 0" class="swipe-bg left" :class="{ ready: swipeDx > SWIPE_TH }"><i class="ti ti-check"></i></div>
          <div v-else-if="swipeDx < 0" class="swipe-bg right" :class="{ ready: swipeDx < -SWIPE_TH }"><i class="ti ti-trash"></i></div>
        </template>
        <div
          class="ov-row"
          :class="{ swiping: swipeId === task.id }"
          :style="swipeStyle(task.id)"
          @touchstart="onDown($event, task)"
          @touchmove="onMove($event, task)"
          @touchend="onUp($event, task)"
        >
          <button type="button" class="ov-check" @click="completeWithUndo(task)" :aria-label="t('day.markDone')" :title="t('day.markDone')"></button>
          <span class="ov-name">{{ task.title }}</span>
          <span class="ov-days">{{ daysAgo(task.task_date) }}</span>
          <button type="button" class="ov-today" @click="store.moveToToday(task)">{{ t('overdue.toToday') }}</button>
          <button type="button" class="ov-del" @click="deleteWithUndo(task)" :aria-label="t('day.deleteItem')" :title="t('day.deleteItem')"><i class="ti ti-x"></i></button>
        </div>
      </div>

      <!-- inline undo for just-deleted / just-completed overdue tasks -->
      <div v-for="tomb in tombstones" :key="'tomb-' + tomb.task.id" class="ov-tomb">
        <span class="tomb-icon" :class="tomb.kind">
          <i class="ti" :class="tomb.kind === 'done' ? 'ti-check' : 'ti-trash'"></i>
        </span>
        <span class="tomb-text">{{ tomb.task.title }}</span>
        <button type="button" class="tomb-undo" @click="undoTomb(tomb)"><i class="ti ti-arrow-back-up"></i> {{ t('undo.action') }}</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTasksStore } from '@/stores/tasks'
import { parseYmd, today } from '@/lib/dates'
import type { Task } from '@/types'

const { t } = useI18n()
const store = useTasksStore()
const open = ref(false)

function daysAgo(date: string): string {
  const diff = Math.round((parseYmd(today()).getTime() - parseYmd(date).getTime()) / 86_400_000)
  return `${diff}d`
}

// delete / complete leave an inline "undo" row (~5s) in place
type Tomb = { task: Task; kind: 'deleted' | 'done' }
const tombstones = ref<Tomb[]>([])
const tombTimers = new Map<string, ReturnType<typeof setTimeout>>()

function pushTomb(task: Task, kind: Tomb['kind']) {
  tombstones.value.push({ task: { ...task }, kind })
  tombTimers.set(task.id, setTimeout(() => {
    tombstones.value = tombstones.value.filter(x => x.task.id !== task.id)
    tombTimers.delete(task.id)
  }, 5000))
}
async function deleteWithUndo(task: Task) {
  await store.deleteTask(task.id)
  pushTomb(task, 'deleted')
}
async function completeWithUndo(task: Task) {
  await store.toggleTask(task) // marks done + removes from overdue
  pushTomb(task, 'done')
}
async function undoTomb(tomb: Tomb) {
  const tmr = tombTimers.get(tomb.task.id)
  if (tmr) { clearTimeout(tmr); tombTimers.delete(tomb.task.id) }
  tombstones.value = tombstones.value.filter(x => x.task.id !== tomb.task.id)
  if (tomb.kind === 'deleted') {
    await store.restoreOverdue(tomb.task)
  } else {
    await store.toggleTask(tomb.task) // back to todo
    store.overdue.push(tomb.task)
    store.overdue.sort((a, b) => a.task_date.localeCompare(b.task_date))
  }
}

// swipe: → done, ← delete (touch)
const SWIPE_TH = 80
const swipeId = ref<string | null>(null)
const swipeDx = ref(0)
let sx = 0, sy = 0, swiping = false, horizontal = false
function swipeStyle(id: string) {
  if (swipeId.value !== id) return undefined
  return { transform: `translateX(${swipeDx.value}px)`, transition: 'none' }
}
function onDown(e: TouchEvent, task: Task) {
  sx = e.touches[0].clientX; sy = e.touches[0].clientY
  swiping = true; horizontal = false
  swipeId.value = task.id; swipeDx.value = 0
}
function onMove(e: TouchEvent, _task: Task) {
  if (!swiping) return
  const dx = e.touches[0].clientX - sx
  const dy = e.touches[0].clientY - sy
  if (!horizontal) {
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) horizontal = true
    else if (Math.abs(dy) > 10) { swiping = false; swipeId.value = null; return }
    else return
  }
  e.preventDefault(); e.stopPropagation()
  swipeDx.value = dx
}
function onUp(e: TouchEvent, task: Task) {
  if (horizontal) e.stopPropagation()
  const dx = swipeDx.value
  swiping = false; horizontal = false
  swipeId.value = null; swipeDx.value = 0
  if (dx > SWIPE_TH) completeWithUndo(task)
  else if (dx < -SWIPE_TH) deleteWithUndo(task)
}
</script>

<style scoped>
.overdue { border-bottom: 0.5px solid var(--color-border-tertiary); }
.ov-head {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  background: none; border: none; cursor: pointer;
  padding: 12px 18px; color: var(--color-text-danger);
}
.ov-title { display: flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 500; }
.ov-title i { font-size: 17px; }
.ov-head > i { font-size: 18px; color: var(--color-text-tertiary); }

.ov-list { padding: 0 18px 10px; }

.swipe-wrap { position: relative; overflow: hidden; }
.swipe-bg {
  position: absolute; inset: 0; display: flex; align-items: center;
  padding: 0 18px; color: #fff; font-size: 18px;
  filter: saturate(0.85) brightness(0.85);
}
.swipe-bg.ready { filter: none; }
.swipe-bg.left { justify-content: flex-start; background: var(--color-text-success); }
.swipe-bg.right { justify-content: flex-end; background: var(--color-text-danger); }

.ov-row { display: flex; align-items: center; gap: 11px; padding: 6px 0; background: var(--color-background-primary); }
.ov-row.swiping { transition: transform .2s; }
.ov-check {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid var(--color-border-secondary); background: transparent;
  cursor: pointer; padding: 0;
}
.ov-name {
  flex: 0 1 auto; min-width: 0; font-size: 15px; color: var(--color-text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ov-days { flex-shrink: 0; font-size: 12px; color: var(--color-text-danger); font-variant-numeric: tabular-nums; }
.ov-today {
  flex-shrink: 0; margin-left: auto; border: none; cursor: pointer;
  background: var(--color-background-info); color: var(--color-text-info);
  font-size: 12px; font-weight: 500; padding: 5px 11px; border-radius: 999px;
}
.ov-del {
  flex-shrink: 0; border: none; background: none; cursor: pointer;
  color: var(--color-text-tertiary); font-size: 17px; padding: 2px;
  display: flex; align-items: center;
}

.ov-tomb { display: flex; align-items: center; gap: 11px; padding: 6px 0; color: var(--color-text-tertiary); animation: tomb-in .2s ease; }
.ov-tomb .tomb-icon { display: flex; align-items: center; font-size: 16px; }
.ov-tomb .tomb-icon.done { color: var(--color-text-success); }
.ov-tomb .tomb-text { flex: 1; min-width: 0; font-size: 15px; text-decoration: line-through; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tomb-undo {
  display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  border: none; cursor: pointer; padding: 5px 12px; border-radius: 999px;
  background: var(--color-background-info); color: var(--color-text-info);
  font-size: 13px; font-weight: 500;
}
.tomb-undo i { font-size: 15px; }
@keyframes tomb-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
</style>
