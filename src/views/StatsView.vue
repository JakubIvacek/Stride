<template>
  <div class="stats">
    <div class="top">
      <div class="title">{{ t('stats.title') }}</div>
      <div class="seg">
        <button v-for="p in periods" :key="p" :class="{ on: period === p }" @click="period = p">
          {{ t('stats.' + p) }}
        </button>
      </div>
    </div>

    <!-- metric cards -->
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">{{ t('stats.doneIn', { label: periodLabel }) }}</div>
        <div class="metric-value">{{ periodDone }}</div>
      </div>
      <div class="metric">
        <div class="metric-label">{{ t('stats.completion') }}</div>
        <div class="metric-value green">{{ completion }} %</div>
      </div>
      <div class="metric">
        <div class="metric-label">{{ t('stats.currentStreak') }}</div>
        <div class="metric-value flame"><i class="ti ti-flame"></i>{{ t('stats.days', { n: currentStreak }) }}</div>
      </div>
      <div class="metric">
        <div class="metric-label">{{ t('stats.longestStreak') }}</div>
        <div class="metric-value">{{ t('stats.days', { n: longestStreak }) }}</div>
      </div>
    </div>

    <!-- period bar chart -->
    <section class="block">
      <div class="block-title">{{ chartTitle }}</div>
      <template v-if="hasChartData">
        <div class="chart-wrap">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
        <div class="insight">{{ t('stats.strongestDay', { day: strongestDay }) }}</div>
      </template>
      <div v-else class="empty-state">
        <i class="ti ti-chart-bar-off"></i>
        <span>{{ t('empty.noStats') }}</span>
      </div>
    </section>

    <!-- category breakdown -->
    <section class="block bordered">
      <div class="block-head">
        <span class="block-title">{{ t('stats.byCategory') }}</span>
        <button class="manage-link" @click="catSheet = true">{{ t('stats.manage') }}</button>
      </div>
      <template v-if="catBreakdown.length">
        <div v-for="c in catBreakdown" :key="c.name" class="cat-row">
          <span class="cat-name">{{ c.name }}</span>
          <div class="cat-track"><div class="cat-fill" :style="{ width: c.pct + '%', background: c.color }"></div></div>
          <span class="cat-val">{{ c.val }}</span>
        </div>
      </template>
      <p v-else class="block-note">{{ t('stats.noneDone') }}</p>
    </section>

    <CategoriesSheet v-model="catSheet" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart, BarElement, CategoryScale, LinearScale, Tooltip,
} from 'chart.js'
import { useI18n } from 'vue-i18n'
import { useTasksStore } from '@/stores/tasks'
import { useCategoriesStore } from '@/stores/categories'
import CategoriesSheet from '@/components/CategoriesSheet.vue'
import { useFmt } from '@/i18n/dates'
import { addDays, getMonday, parseYmd, today, weekdayIndex, ymd } from '@/lib/dates'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip)

const { t } = useI18n()
const fmt = useFmt()
const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const todayStr = today()
const catSheet = ref(false)

const periods = ['week', 'month', 'year'] as const
const period = ref<'week' | 'month' | 'year'>('month')

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// --- period range (inclusive) ---
const periodRange = computed(() => {
  const d = parseYmd(todayStr)
  if (period.value === 'week') return { from: getMonday(todayStr), to: addDays(getMonday(todayStr), 6) }
  if (period.value === 'month') {
    return {
      from: ymd(new Date(d.getFullYear(), d.getMonth(), 1)),
      to: ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
    }
  }
  return { from: ymd(new Date(d.getFullYear(), 0, 1)), to: ymd(new Date(d.getFullYear(), 11, 31)) }
})

const periodLabel = computed(() => {
  const d = parseYmd(todayStr)
  if (period.value === 'week') return t('stats.thisWeek')
  if (period.value === 'month') return fmt.monthName(d.getMonth())
  return String(d.getFullYear())
})

const periodTasks = computed(() => {
  const { from, to } = periodRange.value
  return tasksStore.tasks.filter(t => t.task_date >= from && t.task_date <= to)
})
const periodDone = computed(() => periodTasks.value.filter(t => t.status === 'done').length)
const completion = computed(() => {
  const total = periodTasks.value.length
  return total ? Math.round(periodDone.value / total * 100) : 0
})

// --- streaks: walk days backward; done day counts, missed breaks, empty skips ---
function dayState(date: string): 'done' | 'missed' | 'none' {
  const ts = tasksStore.tasks.filter(t => t.task_date === date)
  if (ts.length === 0) return 'none'
  return ts.every(t => t.status === 'done') ? 'done' : 'missed'
}

const currentStreak = computed(() => {
  let streak = 0
  let cursor = todayStr
  // today still in progress shouldn't break the streak
  if (dayState(cursor) !== 'done') cursor = addDays(cursor, -1)
  for (let i = 0; i < 400; i++) {
    const s = dayState(cursor)
    if (s === 'done') streak++
    else if (s === 'missed') break
    cursor = addDays(cursor, -1)
  }
  return streak
})

const longestStreak = computed(() => {
  const dates = [...new Set(tasksStore.tasks.map(t => t.task_date))].sort()
  if (!dates.length) return 0
  let best = 0, run = 0
  let cursor = dates[0]
  while (cursor <= todayStr) {
    const s = dayState(cursor)
    if (s === 'done') { run++; best = Math.max(best, run) }
    else if (s === 'missed') run = 0
    cursor = addDays(cursor, 1)
  }
  return best
})

// --- chart adapts to the selected period ---
const chartTitle = computed(() =>
  period.value === 'week' ? t('stats.byDay')
    : period.value === 'month' ? t('stats.byWeek')
      : t('stats.byMonth'))

function doneBetween(from: string, to: string) {
  return tasksStore.tasks.filter(t => t.status === 'done' && t.task_date >= from && t.task_date <= to).length
}

const buckets = computed(() => {
  const list: { label: string; done: number; isCurrent: boolean }[] = []
  if (period.value === 'week') {
    // current week, day by day (Po–Ne)
    const mon = getMonday(todayStr)
    const letters = fmt.dayLetters()
    for (let i = 0; i < 7; i++) {
      const d = addDays(mon, i)
      list.push({ label: letters[i], done: doneBetween(d, d), isCurrent: d === todayStr })
    }
  } else if (period.value === 'month') {
    // last 6 weeks
    const mondayThis = getMonday(todayStr)
    for (let i = 5; i >= 0; i--) {
      const mon = addDays(mondayThis, -7 * i)
      const md = parseYmd(mon)
      list.push({ label: `${md.getDate()}.${md.getMonth() + 1}`, done: doneBetween(mon, addDays(mon, 6)), isCurrent: i === 0 })
    }
  } else {
    // 12 months of the current year
    const d = parseYmd(todayStr)
    const y = d.getFullYear(), curM = d.getMonth()
    for (let m = 0; m < 12; m++) {
      const from = ymd(new Date(y, m, 1))
      const to = ymd(new Date(y, m + 1, 0))
      list.push({ label: fmt.monthShort(m), done: doneBetween(from, to), isCurrent: m === curM })
    }
  }
  return list
})

const hasChartData = computed(() => buckets.value.some(b => b.done > 0))

const chartData = computed(() => {
  const success = cssVar('--color-text-success') || '#34c759'
  const danger = cssVar('--color-text-danger') || '#ff3b30'
  return {
    labels: buckets.value.map(b => b.label),
    datasets: [{
      data: buckets.value.map(b => b.done),
      backgroundColor: buckets.value.map(b => b.isCurrent ? danger : success),
      borderRadius: 5,
      borderSkipped: false,
      barPercentage: 0.6,
    }],
  }
})

const chartOptions = computed(() => {
  const tertiary = cssVar('--color-text-tertiary') || '#aeaeb2'
  const danger = cssVar('--color-text-danger') || '#ff3b30'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: buckets.value.map(b => b.isCurrent ? danger : tertiary),
          font: { size: 11 },
        },
      },
      y: { display: false, beginAtZero: true },
    },
  }
})

const strongestDay = computed(() => {
  const counts = new Array(7).fill(0)
  for (const task of tasksStore.tasks) {
    if (task.status === 'done') counts[weekdayIndex(task.task_date)]++
  }
  const max = Math.max(...counts)
  if (max === 0) return '—'
  return fmt.dayName(addDays(getMonday(todayStr), counts.indexOf(max)))
})

// done tasks per category within the selected period (incl. "Bez kategórie"), sorted desc
const NO_CAT = '__none__'
const catBreakdown = computed(() => {
  const counts = new Map<string, number>()
  for (const t of periodTasks.value) {
    if (t.status !== 'done') continue
    const key = t.category_id ?? NO_CAT
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const rows = [...counts.entries()].map(([id, val]) => {
    if (id === NO_CAT) {
      return { name: t('stats.noCategory'), color: 'var(--color-text-tertiary)', val }
    }
    return {
      name: categoriesStore.byId.get(id)?.name ?? t('stats.deletedCategory'),
      color: categoriesStore.byId.get(id)?.color ?? 'var(--color-text-info)',
      val,
    }
  }).sort((a, b) => b.val - a.val)
  const max = Math.max(1, ...rows.map(r => r.val))
  return rows.map(r => ({ ...r, pct: Math.round(r.val / max * 100) }))
})

onMounted(async () => {
  const d = parseYmd(todayStr)
  // fetch a year of history (covers all periods, 6-week chart, and streaks)
  await tasksStore.fetchRange(ymd(new Date(d.getFullYear() - 1, d.getMonth(), 1)), todayStr)
})
</script>

<style scoped>
.stats { padding-bottom: 16px; }
.top { padding: 8px 18px 12px; }
.title { font-size: 24px; font-weight: 500; margin-bottom: 12px; }
.seg { display: flex; background: var(--color-background-tertiary); border-radius: 10px; padding: 3px; }
.seg button {
  flex: 1; border: none; background: none; cursor: pointer;
  font-size: 13px; color: var(--color-text-secondary); padding: 6px 0; border-radius: 8px;
}
.seg button.on { background: var(--color-background-primary); color: var(--color-text-primary); font-weight: 500; }

.metrics { padding: 0 18px 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.metric { background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 14px; }
.metric-label { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 6px; }
.metric-value { font-size: 24px; font-weight: 500; display: flex; align-items: center; gap: 5px; }
.metric-value.green { color: var(--color-text-success); }
.metric-value.flame i { font-size: 20px; color: var(--color-text-danger); }

.block { padding: 14px 18px 6px; }
.block.bordered { border-top: 0.5px solid var(--color-border-tertiary); margin-top: 8px; padding-bottom: 16px; }
.block-title { font-size: 15px; font-weight: 500; }
.block-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.block-note { font-size: 12px; color: var(--color-text-tertiary); }
.manage-link { border: none; background: none; color: var(--color-text-info); font-size: 13px; cursor: pointer; padding: 0; }
.chart-wrap { height: 120px; margin: 14px 0 10px; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 28px 16px; text-align: center;
  color: var(--color-text-tertiary); font-size: 14px;
}
.empty-state i { font-size: 28px; }
.insight { font-size: 12px; color: var(--color-text-tertiary); }
.insight span { color: var(--color-text-secondary); }

.cat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.cat-row:last-child { margin-bottom: 0; }
.cat-name {
  font-size: 13px; color: var(--color-text-secondary);
  width: 96px; flex-shrink: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cat-track { flex: 1; height: 8px; border-radius: 5px; background: var(--color-background-tertiary); overflow: hidden; }
.cat-fill { height: 100%; background: var(--color-text-info); }
.cat-val { font-size: 12px; color: var(--color-text-secondary); width: 18px; text-align: right; }
</style>
