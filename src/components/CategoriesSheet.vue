<template>
  <transition name="sheet">
    <div v-if="modelValue" class="sheet-backdrop" @click.self="close">
      <div class="sheet">
        <div class="sheet-grip"></div>
        <div class="sheet-head">
          <div class="sheet-title">{{ t('cat.title') }}</div>
          <button class="icon-btn" @click="close" :aria-label="t('cat.closeAria')"><i class="ti ti-x"></i></button>
        </div>

        <div class="list">
          <div v-for="c in store.categories" :key="c.id" class="cat">
            <div class="cat-main">
              <button
                class="swatch"
                :style="{ background: c.color }"
                @click="editing = editing === c.id ? null : c.id"
                :aria-label="t('cat.colorAria')"
              ></button>
              <input
                class="cat-name"
                :value="c.name"
                @change="rename(c, ($event.target as HTMLInputElement).value)"
              >
              <template v-if="confirmingId === c.id">
                <button class="confirm-yes" @click="confirmDelete(c.id)">{{ t('common.delete') }}</button>
                <button class="confirm-no" @click="confirmingId = null">{{ t('common.cancel') }}</button>
              </template>
              <button v-else class="trash" @click="confirmingId = c.id" :aria-label="t('cat.deleteAria')">
                <i class="ti ti-trash"></i>
              </button>
            </div>
            <div v-if="editing === c.id" class="palette">
              <button
                v-for="col in PALETTE"
                :key="col"
                class="chip"
                :class="{ on: col === c.color }"
                :style="{ background: col }"
                @click="store.updateCategory(c.id, { color: col }); editing = null"
              ></button>
            </div>
          </div>

          <p v-if="!store.categories.length" class="empty">{{ t('cat.empty') }}</p>
        </div>

        <!-- new category -->
        <div class="new">
          <div class="new-row">
            <button class="swatch" :style="{ background: newColor }" @click="cyclePalette"></button>
            <input
              v-model="newName"
              class="cat-name"
              :placeholder="t('cat.newCategory')"
              @keyup.enter="add"
            >
            <button class="add-btn" :disabled="!newName.trim()" @click="add">{{ t('cat.add') }}</button>
          </div>
          <div class="palette">
            <button
              v-for="col in PALETTE"
              :key="col"
              class="chip"
              :class="{ on: col === newColor }"
              :style="{ background: col }"
              @click="newColor = col"
            ></button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategoriesStore } from '@/stores/categories'
import { PALETTE } from '@/lib/colors'
import type { Category } from '@/types'

const { t } = useI18n()

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const store = useCategoriesStore()
const editing = ref<string | null>(null)
const confirmingId = ref<string | null>(null)
const newName = ref('')
const newColor = ref(PALETTE[5])

function close() { emit('update:modelValue', false) }

async function confirmDelete(id: string) {
  await store.deleteCategory(id)
  confirmingId.value = null
}

function rename(c: Category, name: string) {
  const v = name.trim()
  if (v && v !== c.name) store.updateCategory(c.id, { name: v })
}

function cyclePalette() {
  const i = PALETTE.indexOf(newColor.value)
  newColor.value = PALETTE[(i + 1) % PALETTE.length]
}

async function add() {
  const name = newName.value.trim()
  if (!name) return
  await store.addCategory(name, newColor.value)
  newName.value = ''
}
</script>

<style scoped>
.sheet-backdrop {
  position: absolute; inset: 0; z-index: 30;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: flex-end;
}
.sheet {
  width: 100%;
  background: var(--color-background-primary);
  border-radius: 18px 18px 0 0;
  padding: 8px 0 max(16px, env(safe-area-inset-bottom));
  max-height: 85%; overflow-y: auto;
}
.sheet-grip { width: 36px; height: 5px; border-radius: 3px; background: var(--color-border-secondary); margin: 6px auto 4px; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; padding: 6px 18px 8px; }
.sheet-title { font-size: 17px; font-weight: 500; }

.list { padding: 0 18px; }
.cat { padding: 8px 0; border-top: 0.5px solid var(--color-border-tertiary); }
.cat-main { display: flex; align-items: center; gap: 12px; }
.swatch { width: 26px; height: 26px; border-radius: 50%; border: 0.5px solid var(--color-border-tertiary); flex-shrink: 0; cursor: pointer; padding: 0; }
.cat-name {
  flex: 1; border: none; background: none; color: var(--color-text-primary);
  font-size: 15px; padding: 6px 0;
}
.cat-name:focus { outline: none; }
.trash { border: none; background: none; color: var(--color-text-tertiary); cursor: pointer; font-size: 18px; padding: 4px; }
.confirm-yes, .confirm-no {
  border: none; cursor: pointer; font-size: 13px; font-weight: 500; flex-shrink: 0;
  height: 30px; padding: 0 12px; border-radius: var(--border-radius-md);
}
.confirm-yes { background: var(--color-text-danger); color: #fff; }
.confirm-no { background: var(--color-background-tertiary); color: var(--color-text-secondary); }
.empty { color: var(--color-text-tertiary); font-size: 14px; padding: 12px 0; }

.palette { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 0 4px; }
.chip { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; }
.chip.on { border-color: var(--color-text-primary); }

.new { padding: 12px 18px 4px; border-top: 0.5px solid var(--color-border-tertiary); margin-top: 6px; }
.new-row { display: flex; align-items: center; gap: 12px; }
.add-btn {
  border: none; background: var(--color-background-info); color: var(--color-text-info);
  border-radius: 14px; padding: 6px 14px; font-size: 13px; font-weight: 500; cursor: pointer;
}
.add-btn:disabled { opacity: 0.4; cursor: default; }

.sheet-enter-active, .sheet-leave-active { transition: opacity .2s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .25s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
