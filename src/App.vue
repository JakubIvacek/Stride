<template>
  <div class="app-shell">
    <main class="app-main">
      <RouterView />
    </main>
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import TabBar from '@/components/TabBar.vue'

const auth = useAuthStore()
onMounted(() => auth.init())
</script>
