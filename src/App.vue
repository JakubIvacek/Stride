<template>
  <Analytics />
  <!-- full-width legal pages (accessible logged-in or out) -->
  <PrivacyView v-if="route.path === '/privacy'" @back="goBack" />
  <TermsView v-else-if="route.path === '/terms'" @back="goBack" />
  <!-- full-width landing: explicit /welcome (dev/marketing) or the logged-out gate -->
  <LandingView v-else-if="showLanding" @start="onStart" />
  <div v-else class="app-shell">
    <div v-if="isDemoBanner" class="demo-bar">
      <i class="ti ti-eye"></i>
      Demo mode — data is not saved
      <button class="demo-bar-btn" @click="backToLanding">Back</button>
      <button class="demo-bar-btn red" @click="exitDemoFn">Sign up free</button>
    </div>
    <AuthView v-if="auth.ready && (!authed || auth.recovery)" />
    <template v-else-if="authed">
      <AppHeader v-if="$route.path !== '/account'" />
      <main class="app-main">
        <RouterView />
      </main>
      <TabBar v-if="$route.path !== '/account'" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Analytics } from '@vercel/analytics/vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { isDemo, exitDemo } from '@/lib/demo'
import TabBar from '@/components/TabBar.vue'
import AppHeader from '@/components/AppHeader.vue'
import AuthView from '@/views/AuthView.vue'
import LandingView from '@/views/LandingView.vue'
import PrivacyView from '@/views/PrivacyView.vue'
import TermsView from '@/views/TermsView.vue'

const auth = useAuthStore()
const categories = useCategoriesStore()
const route = useRoute()
const router = useRouter()

// Demo mode bypasses login; otherwise require a Supabase session.
const authed = computed(() => isDemo || !!auth.session)
const isDemoBanner = isDemo && !import.meta.env.DEV
const exitDemoFn = exitDemo
function backToLanding() {
  localStorage.removeItem('stride-demo')
  window.location.href = '/welcome'
}

// landing is the welcome screen for logged-out visitors (and the /welcome route)
const showAuth = ref(false)
const showLanding = computed(() =>
  route.path === '/welcome'
  || (auth.ready && !authed.value && !auth.recovery && !showAuth.value))
function onStart() {
  showAuth.value = true
  if (route.path === '/welcome') router.push('/')
}
function goBack() {
  router.push(authed.value ? '/' : '/welcome')
}

onMounted(() => {
  auth.init()
  if (new URLSearchParams(window.location.search).get('auth') === '1') {
    history.replaceState(null, '', '/')
    showAuth.value = true
  }
})

// (Re)load categories whenever the user becomes authenticated.
watch(authed, v => { if (v) categories.fetchAll() }, { immediate: true })

// When a real session is established while in demo mode, clear the flag and reload.
watch(() => auth.session, session => {
  if (session && localStorage.getItem('stride-demo') === 'true') {
    localStorage.removeItem('stride-demo')
    window.location.reload()
  }
})
</script>

<style scoped>
.demo-bar {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: #1a1a1f; border-bottom: 0.5px solid rgba(255,255,255,0.1);
  color: #9a9aa3; font-size: 13px; padding: 8px 16px; text-align: center;
}
.demo-bar .ti { color: #ff9500; font-size: 15px; }
.demo-bar-btn {
  border: 0.5px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06);
  color: #f3f3f5; font-size: 13px; font-weight: 500;
  padding: 4px 10px; border-radius: 6px; cursor: pointer;
}
.demo-bar-btn:hover { background: rgba(255,255,255,0.12); }
.demo-bar-btn.red { background: #ff2d20; border-color: #ff2d20; }
.demo-bar-btn.red:hover { background: #e0261a; border-color: #e0261a; }
</style>
