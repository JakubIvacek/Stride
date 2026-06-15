<template>
  <nav class="tab-bar">
    <RouterLink to="/" class="tab" :class="{ active: $route.path === '/' }">
      <i class="ti ti-home"></i>
      <span>{{ t('tab.home') }}</span>
    </RouterLink>
    <RouterLink to="/calendar" class="tab" :class="{ active: $route.path === '/calendar' }">
      <i class="ti ti-calendar"></i>
      <span>{{ t('tab.calendar') }}</span>
    </RouterLink>
    <RouterLink to="/stats" class="tab" :class="{ active: $route.path === '/stats' }">
      <i class="ti ti-chart-bar"></i>
      <span>{{ t('tab.stats') }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.tab-bar {
  display: flex;
  flex-shrink: 0;
  border-top: 0.5px solid var(--color-border-tertiary);
  background: var(--color-background-primary);
  padding-bottom: env(safe-area-inset-bottom);
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 9px 0 11px;
  text-decoration: none;
  color: var(--color-text-tertiary);
}
.tab i { font-size: 21px; }
.tab span { font-size: 11px; }
.tab.active { color: var(--color-text-info); }
</style>
