<template>
  <div class="cal">
    <!-- header -->
    <header class="head">
      <div class="title">
        <template v-if="mode === 'month'">
          {{ fmt.monthName(anchor.month) }} <span class="year">{{ anchor.year }}</span>
        </template>
        <template v-else>{{ yearAnchor }}</template>
      </div>
      <div class="actions">
        <div class="seg">
          <button :class="{ on: mode === 'month' }" @click="setMode('month')">{{ t('cal.month') }}</button>
          <button :class="{ on: mode === 'year' }" @click="setMode('year')">{{ t('cal.year') }}</button>
        </div>
        <button class="today-btn" @click="goToday">{{ t('cal.today') }}</button>
      </div>
    </header>

    <!-- MONTH MODE -->
    <template v-if="mode === 'month'">
      <div class="calm-wd">
        <span v-for="(w, i) in fmt.weekdayShort()" :key="i">{{ w }}</span>
      </div>
      <div ref="scroller" class="scroll">
        <section
          v-for="m in months"
          :key="m.key"
          :ref="el => registerMonth(m.key, el)"
          class="month"
        >
          <div class="month-label" :class="{ cur: m.isCurrent }">{{ fmt.monthName(m.month) }} {{ m.year }}</div>
          <div class="calm-grid">
            <div v-for="(cell, i) in m.cells" :key="i" class="calm-cell-wrap">
              <button v-if="cell" class="calm-cell" @click="openDay(cell.date)">
                <div class="calm-num" :class="{ t: cell.isToday }">{{ cell.day }}</div>
                <div class="calm-meta">
                  <span v-if="cell.status !== 'none'" class="calm-dot" :style="{ background: STATUS_COLOR[cell.status] }"></span>
                  <span v-if="cell.count" class="calm-cnt">{{ cell.count }}</span>
                </div>
              </button>
              <div v-else class="calm-cell"></div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- YEAR MODE -->
    <div v-else class="scroll year-scroll">
      <section v-for="y in years" :key="y" class="year-block">
        <div class="year-heading">{{ y }}</div>
        <div class="yr2">
          <div v-for="(mo, mi) in 12" :key="mi" :ref="el => registerCur(y, mi, el)">
            <button class="yr2-lab" :class="{ cur: y === todayY && mi === todayM }" @click="openMonth(y, mi)">
              {{ fmt.monthName(mi) }}
            </button>
            <div class="yr2-g">
              <div v-for="(cell, i) in yearCells(y, mi)" :key="i" class="yr2-c">
                <template v-if="cell">
                  <span class="yr2-n" :class="{ t: cell.isToday }">{{ cell.day }}</span>
                  <span v-if="cell.status !== 'none'" class="yr2-d" :style="{ background: STATUS_COLOR[cell.status] }"></span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- DAY DETAIL SHEET -->
    <transition name="sheet">
      <div v-if="sheetDate" class="sheet-backdrop" @click.self="sheetDate = null">
        <div class="sheet">
          <div class="sheet-grip"></div>
          <div class="sheet-head">
            <div class="sheet-title">{{ sheetTitle }}</div>
            <button class="icon-btn" @click="sheetDate = null" aria-label="Zavrieť"><i class="ti ti-x"></i></button>
          </div>
          <DayList v-if="sheetDate" :date="sheetDate" :tasks="sheetTasks" :show-header="false" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DayList from '@/components/DayList.vue'
import { useTasksStore } from '@/stores/tasks'
import { useFmt } from '@/i18n/dates'
import { parseYmd, today, ymd } from '@/lib/dates'
import { STATUS_COLOR, dayStatus, type DayStatus } from '@/lib/status'
import { byDayOrder } from '@/lib/sortTasks'

const { t } = useI18n()
const fmt = useFmt()
const tasksStore = useTasksStore()

const mode = ref<'month' | 'year'>('month')
const todayStr = today()
const todayDate = parseYmd(todayStr)
const todayY = todayDate.getFullYear()
const todayM = todayDate.getMonth()

const MONTHS_BACK = 6
const MONTHS_FWD = 6

// anchor month shown in header (updated as user scrolls)
const anchor = ref({ year: todayY, month: todayM })
const yearAnchor = ref(todayY)

const scroller = ref<HTMLElement | null>(null)
const monthEls = new Map<string, HTMLElement>()
const sheetDate = ref<string | null>(null)

interface Cell { day: number; date: string; isToday: boolean; status: DayStatus; count: number }

function monthCells(year: number, month: number): (Cell | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7 // Monday-start
  const len = new Date(year, month + 1, 0).getDate()
  const cells: (Cell | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= len; d++) {
    const date = ymd(new Date(year, month, d))
    const dayTasks = tasksStore.tasks.filter(t => t.task_date === date)
    cells.push({
      day: d, date,
      isToday: date === todayStr,
      status: dayStatus(dayTasks, date, todayStr),
      count: dayTasks.length,
    })
  }
  return cells
}

const months = computed(() => {
  const list = []
  for (let off = -MONTHS_BACK; off <= MONTHS_FWD; off++) {
    const d = new Date(todayY, todayM + off, 1)
    const year = d.getFullYear(), month = d.getMonth()
    list.push({
      key: `${year}-${month}`, year, month,
      isCurrent: year === todayY && month === todayM,
      cells: monthCells(year, month),
    })
  }
  return list
})

const years = computed(() => [yearAnchor.value - 1, yearAnchor.value, yearAnchor.value + 1])
function yearCells(year: number, month: number) { return monthCells(year, month) }

function registerMonth(key: string, el: unknown) {
  if (el) monthEls.set(key, (el as { $el?: HTMLElement }).$el ?? (el as HTMLElement))
}

// remember the current month's cell in the year grid so "Today" can scroll to it
const curMonthEl = ref<HTMLElement | null>(null)
function registerCur(year: number, month: number, el: unknown) {
  if (el && year === todayY && month === todayM) curMonthEl.value = el as HTMLElement
}
function scrollToCurrentInYear() {
  nextTick(() => curMonthEl.value?.scrollIntoView({ block: 'center' }))
}

const sheetTasks = computed(() =>
  sheetDate.value
    ? tasksStore.tasks.filter(t => t.task_date === sheetDate.value).sort(byDayOrder)
    : [])
const sheetTitle = computed(() => (sheetDate.value ? fmt.fullDate(sheetDate.value) : ''))

function openDay(date: string) { sheetDate.value = date }
function setMode(m: 'month' | 'year') {
  mode.value = m
  if (m === 'year') scrollToCurrentInYear()
}

function openMonth(year: number, month: number) {
  anchor.value = { year, month }
  mode.value = 'month'
  nextTick(() => scrollToMonth(`${year}-${month}`))
}

function scrollToMonth(key: string) {
  monthEls.get(key)?.scrollIntoView({ block: 'start' })
}

function goToday() {
  if (mode.value === 'month') {
    anchor.value = { year: todayY, month: todayM }
    nextTick(() => scrollToMonth(`${todayY}-${todayM}`))
  } else {
    yearAnchor.value = todayY
    scrollToCurrentInYear()
  }
}

async function load() {
  const from = ymd(new Date(todayY, todayM - MONTHS_BACK, 1))
  const to = ymd(new Date(todayY, todayM + MONTHS_FWD + 1, 0))
  await tasksStore.fetchRange(from, to)
}

onMounted(async () => {
  await load()
  nextTick(() => scrollToMonth(`${todayY}-${todayM}`))
})
</script>

<style scoped>
.cal { display: flex; flex-direction: column; height: 100%; }
.head { padding: 6px 18px 10px; display: flex; align-items: flex-end; justify-content: space-between; }
.title { font-size: 24px; font-weight: 500; }
.title .year { color: var(--color-text-secondary); font-weight: 400; }
.actions { display: flex; gap: 8px; align-items: center; }
.seg { display: flex; background: var(--color-background-tertiary); border-radius: 9px; padding: 2px; }
.seg button {
  border: none; background: none; font-size: 12px; color: var(--color-text-secondary);
  padding: 4px 9px; border-radius: 7px; cursor: pointer;
}
.seg button.on { background: var(--color-background-primary); color: var(--color-text-primary); font-weight: 500; }
.today-btn {
  font-size: 13px; color: var(--color-text-info);
  padding: 6px 12px; border: 0.5px solid var(--color-border-tertiary);
  border-radius: 9px; background: none; cursor: pointer;
}

.scroll { flex: 1; overflow-y: auto; }
.month { padding: 0 4px; }
.month-label {
  padding: 12px 14px 6px; font-size: 15px; color: var(--color-text-tertiary);
  border-top: 0.5px solid var(--color-border-tertiary);
}
.month:first-child .month-label { border-top: none; }
.month-label.cur { color: var(--color-text-danger); }
.calm-cell-wrap { display: flex; }
.calm-cell-wrap > .calm-cell { width: 100%; }

.year-scroll { padding: 0 16px 16px; }
.year-heading { font-size: 26px; font-weight: 500; padding: 16px 2px 12px; }
.year-block + .year-block .year-heading { border-top: 0.5px solid var(--color-border-tertiary); margin-top: 8px; }

/* day sheet */
.sheet-backdrop {
  position: absolute; inset: 0; z-index: 20;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: flex-end;
}
.sheet {
  width: 100%;
  background: var(--color-background-primary);
  border-radius: 18px 18px 0 0;
  padding: 8px 0 max(16px, env(safe-area-inset-bottom));
  max-height: 80%; overflow-y: auto;
}
.sheet-grip { width: 36px; height: 5px; border-radius: 3px; background: var(--color-border-secondary); margin: 6px auto 4px; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; padding: 6px 18px 4px; }
.sheet-title { font-size: 17px; font-weight: 500; text-transform: capitalize; }

.sheet-enter-active, .sheet-leave-active { transition: opacity .2s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .25s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
