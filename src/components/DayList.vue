<template>
  <div class="day" :class="{ today: isToday }">
    <div v-if="showHeader" class="day-head">
      <div class="day-title">
        <span class="day-name" :class="{ red: isToday }">{{ dayName }}</span>
        <span class="day-date" :class="{ red: isToday }">
          {{ dateLabel }}<template v-if="isToday"> · dnes</template>
        </span>
      </div>
      <span class="day-count" :class="{ done: allDone }">{{ doneCount }} / {{ tasks.length }}</span>
    </div>

    <label v-for="task in tasks" :key="task.id" class="trow">
      <button
        type="button"
        class="check"
        :class="{ checked: task.status === 'done' }"
        @click.prevent="tasksStore.toggleTask(task)"
        :aria-label="task.status === 'done' ? 'Označiť ako nesplnené' : 'Označiť ako splnené'"
      >
        <i v-if="task.status === 'done'" class="ti ti-check"></i>
      </button>
      <span class="row-text" :class="{ done: task.status === 'done' }">{{ task.title }}</span>
    </label>

    <template v-if="canAdd">
      <div v-if="adding" class="add-form">
        <input
          ref="inputEl"
          v-model="newTitle"
          class="add-input"
          placeholder="Názov položky"
          @keyup.enter="submit"
          @keyup.esc="cancel"
        >
        <button class="add-confirm" @click="submit"><i class="ti ti-check"></i></button>
        <button class="add-cancel" @click="cancel"><i class="ti ti-x"></i></button>
      </div>
      <button v-else type="button" class="trow trow-add" @click="openAdd">
        <span class="check dashed"><i class="ti ti-plus"></i></span>
        <span class="row-text muted">Pridať položku</span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { DAY_NAMES, dayMonthLabel, today, weekdayIndex } from '@/lib/dates'
import type { Task } from '@/types'

const props = withDefaults(defineProps<{
  date: string
  tasks: Task[]
  showHeader?: boolean
}>(), { showHeader: true })

const tasksStore = useTasksStore()

const adding = ref(false)
const newTitle = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

const isToday = computed(() => props.date === today())
// Add is allowed on today + future days only (past days have no add affordance).
const canAdd = computed(() => props.date >= today())
const dayName = computed(() => DAY_NAMES[weekdayIndex(props.date)])
const dateLabel = computed(() => dayMonthLabel(props.date))
const doneCount = computed(() => props.tasks.filter(t => t.status === 'done').length)
const allDone = computed(() => props.tasks.length > 0 && doneCount.value === props.tasks.length)

async function openAdd() {
  adding.value = true
  await nextTick()
  inputEl.value?.focus()
}

async function submit() {
  const title = newTitle.value.trim()
  if (!title) return
  await tasksStore.addTask(title, props.date)
  newTitle.value = ''
  // keep the form open for quick consecutive adds
  await nextTick()
  inputEl.value?.focus()
}

function cancel() {
  newTitle.value = ''
  adding.value = false
}

defineExpose({ openAdd })
</script>

<style scoped>
.day { padding: 13px 18px; }
.day.today { background: var(--color-background-secondary); }

.day-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}
.day-title { display: flex; align-items: baseline; gap: 8px; }
.day-name { font-size: 16px; font-weight: 500; color: var(--color-text-primary); }
.day-date { font-size: 13px; color: var(--color-text-tertiary); }
.day-name.red, .day-date.red { color: var(--color-text-danger); }
.day-count { font-size: 12px; color: var(--color-text-secondary); }
.day-count.done { color: var(--color-text-success); }

.trow {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 6px 0;
  cursor: pointer;
}
.check {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid var(--color-border-secondary);
  background: transparent;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 0; cursor: pointer;
  color: #fff;
}
.check.checked { background: var(--color-text-success); border-color: var(--color-text-success); }
.check.checked i { font-size: 14px; }
.check.dashed {
  border-style: dashed;
  border-color: var(--color-border-tertiary);
  color: var(--color-text-tertiary);
}
.check.dashed i { font-size: 13px; }

.row-text { font-size: 15px; color: var(--color-text-primary); }
.row-text.done { color: var(--color-text-tertiary); text-decoration: line-through; }
.row-text.muted { font-size: 14px; color: var(--color-text-tertiary); }
.trow-add { background: none; border: none; width: 100%; text-align: left; }

.add-form { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
.add-input {
  flex: 1;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  padding: 8px 10px;
  font-size: 15px;
}
.add-input:focus { outline: none; border-color: var(--color-text-info); }
.add-confirm, .add-cancel {
  width: 34px; height: 34px; border-radius: var(--border-radius-md);
  border: none; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.add-confirm { background: var(--color-text-success); color: #fff; }
.add-cancel { background: var(--color-background-tertiary); color: var(--color-text-secondary); }
</style>
