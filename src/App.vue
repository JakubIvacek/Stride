<template>
  <!-- full-width legal pages (accessible logged-in or out) -->
  <PrivacyView v-if="route.path === '/privacy'" @back="goBack" />
  <TermsView v-else-if="route.path === '/terms'" @back="goBack" />
  <!-- full-width landing: explicit /welcome (dev/marketing) or the logged-out gate -->
  <LandingView v-else-if="showLanding" @start="onStart" />
  <div v-else class="app-shell">
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
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { isDemo } from '@/lib/demo'
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

// Demo mode (dev) bypasses login; otherwise require a Supabase session.
const authed = computed(() => isDemo || !!auth.session)

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

onMounted(() => auth.init())

// (Re)load categories whenever the user becomes authenticated.
watch(authed, v => { if (v) categories.fetchAll() }, { immediate: true })
</script>
