<template>
  <div class="lang">
    <button
      v-for="l in LOCALES"
      :key="l.id"
      type="button"
      class="lang-btn"
      :class="{ on: locale === l.id }"
      @click="setLocale(l.id)"
    >{{ l.label }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LOCALES, setLocale } from '@/i18n'

const { locale } = useI18n()
</script>

<style scoped>
.lang { display: inline-flex; background: var(--color-background-tertiary); border-radius: 8px; padding: 2px; }
.lang-btn {
  border: none; background: none; cursor: pointer;
  font-size: 11px; font-weight: 500; color: var(--color-text-secondary);
  padding: 3px 8px; border-radius: 6px;
}
.lang-btn.on { background: var(--color-background-primary); color: var(--color-text-primary); }
</style>
