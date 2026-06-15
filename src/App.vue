<template>
  <div class="app-shell">
    <AuthView v-if="auth.ready && (!authed || auth.recovery)" />
    <template v-else-if="authed">
      <main class="app-main">
        <RouterView />
      </main>
      <TabBar />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { isDemo } from '@/lib/demo'
import TabBar from '@/components/TabBar.vue'
import AuthView from '@/views/AuthView.vue'

const auth = useAuthStore()
const categories = useCategoriesStore()

// Demo mode (dev) bypasses login; otherwise require a Supabase session.
const authed = computed(() => isDemo || !!auth.session)

onMounted(() => auth.init())

// (Re)load categories whenever the user becomes authenticated.
watch(authed, v => { if (v) categories.fetchAll() }, { immediate: true })
</script>
