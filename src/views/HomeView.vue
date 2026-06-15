<template>
  <div class="home" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <!-- logo / app name slot -->
    <div class="brand">
      <span class="brand-mark"><i class="ti ti-square-rounded"></i></span>
      <span class="brand-text">tvoj názov / logo</span>
    </div>

    <!-- title + week nav -->
    <header class="head">
      <div>
        <div class="title">{{ weekTitle }}</div>
        <div class="range">{{ rangeLabel }}</div>
      </div>
      <div class="wk-nav">
        <button class="icon-btn" @click="shiftWeek(-1)" aria-label="Predošlý týždeň"><i class="ti ti-chevron-left"></i></button>
        <button class="icon-btn" @click="shiftWeek(1)" aria-label="Ďalší týždeň"><i class="ti ti-chevron-right"></i></button>
        <button class="icon-btn accent" @click="quickAdd" aria-label="Pridať položku"><i class="ti ti-plus"></i></button>
      </div>
    </header>

    <!-- week progress -->
    <section class="wk-progress">
      <div class="progress-head">
        <span class="progress-label">Hotové tento týždeň</span>
        <span class="progress-num"><span class="green">{{ doneCount }}</span> / {{ totalCount }}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </section>

    <!-- mini 7-day bar chart -->
    <section class="chart">
      <div v-for="day in weekDays" :key="day.date" class="chart-col">
        <div class="bar-area">
          <div v-if="day.total === 0" class="bar-empty"></div>
          <div v-else class="bar" :style="{ height: barHeight(day.total) + 'px' }">
            <div class="bar-rem" :style="{ height: barRemPx(day) + 'px' }"></div>
            <div class="bar-done" :style="{ height: barDonePx(day) + 'px' }"></div>
          </div>
        </div>
        <span class="chart-label" :class="{ red: day.isToday }">{{ letters[day.idx] }}</span>
      </div>
    </section>

    <!-- agenda Po → Ne -->
    <section class="agenda">
      <template v-for="day in weekDays" :key="day.date">
        <div class="agenda-day">
          <DayList
            v-if="day.full"
            :ref="el => registerDay(day, el)"
            :date="day.date"
            :tasks="day.tasks"
          />
          <button
            v-else-if="day.isFuture"
            type="button"
            class="compact"
            @click="expandDay(day.date)"
          >
            <div class="day-title">
              <span class="day-name">{{ names[day.idx] }}</span>
              <span class="day-date">{{ day.label }}</span>
            </div>
            <span class="add-hint"><i class="ti ti-plus"></i>Pridať</span>
          </button>
          <div v-else class="compact past">
            <div class="day-title">
              <span class="day-name muted">{{ names[day.idx] }}</span>
              <span class="day-date">{{ day.label }}</span>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DayList from '@/components/DayList.vue'
import { useTasksStore } from '@/stores/tasks'
import {
  DAY_LETTERS, DAY_NAMES, addDays, dayMonthLabel, getMonday, today, weekRangeLabel,
} from '@/lib/dates'

const tasksStore = useTasksStore()
const names = DAY_NAMES
const letters = DAY_LETTERS

const monday = ref(getMonday(new Date()))
const expanded = ref<Set<string>>(new Set())
const dayRefs = new Map<string, InstanceType<typeof DayList>>()

const rangeLabel = computed(() => weekRangeLabel(monday.value))
const weekTitle = computed(() => {
  const cur = getMonday(new Date())
  if (monday.value === cur) return 'Tento týždeň'
  return monday.value < cur ? 'Minulý týždeň' : 'Budúci týždeň'
})

const weekDays = computed(() => {
  const t = today()
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday.value, i)
    const tasks = tasksStore.tasks.filter(task => task.task_date === date)
    const isToday = date === t
    const isFuture = date > t
    const full = tasks.length > 0 || isToday || expanded.value.has(date)
    return {
      idx: i, date, tasks, isToday, isFuture,
      label: dayMonthLabel(date),
      total: tasks.length,
      done: tasks.filter(task => task.status === 'done').length,
      full,
    }
  })
})

const totalCount = computed(() => weekDays.value.reduce((s, d) => s + d.total, 0))
const doneCount = computed(() => weekDays.value.reduce((s, d) => s + d.done, 0))
const progressPercent = computed(() => totalCount.value ? Math.round(doneCount.value / totalCount.value * 100) : 0)

const maxTotal = computed(() => Math.max(1, ...weekDays.value.map(d => d.total)))
const BAR_MAX = 56
function barHeight(total: number) { return Math.max(8, Math.round(total / maxTotal.value * BAR_MAX)) }
function barDonePx(day: { total: number; done: number }) {
  return Math.round(barHeight(day.total) * (day.done / day.total))
}
function barRemPx(day: { total: number; done: number }) {
  return barHeight(day.total) - barDonePx(day)
}

function registerDay(day: { date: string; isToday: boolean }, el: unknown) {
  if (el) dayRefs.set(day.date, el as InstanceType<typeof DayList>)
}

function expandDay(date: string) {
  expanded.value.add(date)
  // open the add form on next tick once the DayList mounts
  requestAnimationFrame(() => dayRefs.get(date)?.openAdd())
}

function quickAdd() {
  const t = today()
  // jump to current week if we navigated away
  if (monday.value !== getMonday(new Date())) monday.value = getMonday(new Date())
  requestAnimationFrame(() => dayRefs.get(t)?.openAdd())
}

async function load() {
  expanded.value = new Set()
  await tasksStore.fetchRange(monday.value, addDays(monday.value, 6))
}

function shiftWeek(dir: number) {
  monday.value = addDays(monday.value, dir * 7)
  load()
}

// swipe between weeks
let startX = 0, startY = 0
function onTouchStart(e: TouchEvent) { startX = e.touches[0].clientX; startY = e.touches[0].clientY }
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - startX
  const dy = e.changedTouches[0].clientY - startY
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) shiftWeek(dx < 0 ? 1 : -1)
}

onMounted(load)
</script>

<style scoped>
.home { padding-bottom: 16px; }

.brand { padding: 14px 18px 2px; display: flex; align-items: center; gap: 8px; }
.brand-mark {
  width: 24px; height: 24px; border-radius: 7px;
  border: 1px dashed var(--color-border-secondary);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-tertiary);
}
.brand-mark i { font-size: 13px; }
.brand-text { font-size: 12px; color: var(--color-text-tertiary); letter-spacing: 0.3px; }

.head { padding: 6px 18px 10px; display: flex; align-items: flex-start; justify-content: space-between; }
.title { font-size: 22px; font-weight: 500; line-height: 1.1; }
.range { font-size: 13px; color: var(--color-text-secondary); margin-top: 3px; }
.wk-nav { display: flex; gap: 6px; align-items: center; }

.wk-progress { padding: 0 18px 12px; }
.progress-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 7px; }
.progress-label { font-size: 13px; color: var(--color-text-secondary); }
.progress-num { font-size: 14px; font-weight: 500; }
.green { color: var(--color-text-success); }
.progress-track { height: 8px; border-radius: 6px; background: var(--color-background-tertiary); overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-text-success); transition: width .3s ease; }

.chart { padding: 2px 16px 14px; display: flex; justify-content: space-between; align-items: flex-end; }
.chart-col { display: flex; flex-direction: column; align-items: center; gap: 7px; flex: 1; }
.bar-area { height: 60px; display: flex; align-items: flex-end; }
.bar { width: 16px; border-radius: 5px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; }
.bar-rem { background: var(--color-border-secondary); }
.bar-done { background: var(--color-text-success); }
.bar-empty { width: 4px; height: 4px; border-radius: 50%; background: var(--color-border-tertiary); }
.chart-label { font-size: 12px; color: var(--color-text-tertiary); }
.chart-label.red { color: var(--color-text-danger); font-weight: 500; }

.agenda-day { border-top: 0.5px solid var(--color-border-tertiary); }

.compact {
  width: 100%;
  padding: 12px 18px;
  display: flex; align-items: center; justify-content: space-between;
  background: none; border: none; cursor: pointer;
}
.compact.past { cursor: default; }
.day-title { display: flex; align-items: baseline; gap: 8px; }
.day-name { font-size: 16px; font-weight: 500; color: var(--color-text-primary); }
.day-name.muted { color: var(--color-text-secondary); }
.day-date { font-size: 13px; color: var(--color-text-tertiary); }
.add-hint { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--color-text-tertiary); }
</style>
