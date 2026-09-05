<template>
  <header class="app-header">
    <div class="app-brand">
      <img src="/stride_icon.svg" alt="Stride" class="app-logo">
      <span class="app-name">Stride</span>
    </div>
    <div class="app-actions">
      <LanguageSwitch compact />
      <RouterLink to="/account" class="settings" :aria-label="t('account.title')" :title="t('account.title')">
        <i class="ti ti-settings"></i>
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

const { t } = useI18n()
</script>

<style scoped>
.app-header {
  flex-shrink: 0;
  background: var(--color-background-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px 8px;
}
.app-brand { display: flex; align-items: center; gap: 9px; }
.app-logo { height: 26px; width: auto; filter: var(--logo-filter); }
.app-name { font-size: 19px; font-weight: 600; letter-spacing: -0.5px; color: var(--color-text-primary); position: relative; top: -2px; }
.app-actions { display: flex; align-items: center; gap: 8px; }
.settings {
  text-decoration: none;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary); font-size: 19px;
}
.settings:active { background: var(--color-background-secondary); }
</style>
