<template>
  <select class="lang" :value="locale" @change="onChange" :aria-label="t('account.language')">
    <option v-for="l in LOCALES" :key="l.id" :value="l.id">{{ l.label }}</option>
  </select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LOCALES, setLocale } from '@/i18n'
import type { AppLocale } from '@/i18n/messages'

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
</style>
