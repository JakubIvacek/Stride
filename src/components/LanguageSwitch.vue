<template>
  <!-- compact: globe icon with an invisible native select on top (opens the menu) -->
  <label v-if="compact" class="lang-icon" :aria-label="t('account.language')" :title="t('account.language')">
    <i class="ti ti-world"></i>
    <select :value="locale" @change="onChange" :aria-label="t('account.language')">
      <option v-for="l in LOCALES" :key="l.id" :value="l.id">{{ l.label }}</option>
    </select>
  </label>
  <select v-else class="lang" :value="locale" @change="onChange" :aria-label="t('account.language')">
    <option v-for="l in LOCALES" :key="l.id" :value="l.id">{{ l.label }}</option>
  </select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LOCALES, setLocale } from '@/i18n'
import type { AppLocale } from '@/i18n/messages'

defineProps<{ compact?: boolean }>()

const { t, locale } = useI18n()
function onChange(e: Event) {
  setLocale((e.target as HTMLSelectElement).value as AppLocale)
}
</script>

<style scoped>
.lang {
  appearance: none;
  border: 0.5px solid var(--color-border-secondary);
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  font-size: 12px; font-weight: 500;
  padding: 5px 24px 5px 10px; border-radius: 8px; cursor: pointer;
  /* chevron */
  background-image: linear-gradient(45deg, transparent 50%, var(--color-text-secondary) 50%),
                    linear-gradient(135deg, var(--color-text-secondary) 50%, transparent 50%);
  background-position: calc(100% - 13px) calc(50% - 1px), calc(100% - 9px) calc(50% - 1px);
  background-size: 4px 4px, 4px 4px;
  background-repeat: no-repeat;
}
.lang:focus { outline: none; border-color: var(--color-text-info); }

.lang-icon {
  position: relative;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary); font-size: 19px; cursor: pointer;
}
.lang-icon:active { background: var(--color-background-secondary); }
.lang-icon select {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
  border: none; padding: 0; width: 100%; height: 100%;
}
</style>
