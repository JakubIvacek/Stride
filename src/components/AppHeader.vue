<template>
  <header class="app-header">
    <img src="/stride_icon.svg" alt="Stride" class="app-logo">
    <div class="app-actions">
      <LanguageSwitch />
      <RouterLink to="/account" class="settings" :aria-label="t('account.title')">
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
.app-logo { height: 26px; width: auto; filter: var(--logo-filter); }
.app-actions { display: flex; align-items: center; gap: 8px; }
.settings {
  text-decoration: none;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary); font-size: 19px;
}
.settings:active { background: var(--color-background-secondary); }
</style>
