<template>
  <header class="app-header">
    <img src="/stride_icon.svg" alt="Stride" class="app-logo">
    <div class="app-actions">
      <LanguageSwitch />
      <button
        v-if="auth.session"
        class="logout"
        @click="auth.signOut()"
        :aria-label="t('home.signOutAria')"
      ><i class="ti ti-logout"></i></button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

const { t } = useI18n()
const auth = useAuthStore()
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--color-background-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px 8px;
}
.app-logo { height: 26px; width: auto; }
.app-actions { display: flex; align-items: center; gap: 8px; }
.logout {
  border: none; background: none; cursor: pointer;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary); font-size: 19px;
}
.logout:active { background: var(--color-background-secondary); }
@media (prefers-color-scheme: dark) {
  .app-logo { filter: invert(1) hue-rotate(180deg); }
}
</style>
