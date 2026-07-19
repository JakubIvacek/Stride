import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // landing/legal pages scroll the window; reset to top on navigate (restore on back/forward)
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/welcome', name: 'welcome', component: () => import('@/views/LandingView.vue') },
    { path: '/privacy', name: 'privacy', component: () => import('@/views/PrivacyView.vue') },
    { path: '/terms', name: 'terms', component: () => import('@/views/TermsView.vue') },
    { path: '/calendar', name: 'calendar', component: () => import('@/views/CalendarView.vue') },
    { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue') },
    { path: '/account', name: 'account', component: () => import('@/views/AccountView.vue') },
    { path: '/notes', name: 'notes', component: () => import('@/views/NotesHomeView.vue') },
    { path: '/notes/folder/:id', name: 'notes-folder', component: () => import('@/views/NotesListView.vue') },
    { path: '/notes/note/:id', name: 'notes-note', component: () => import('@/views/NoteEditorView.vue') },
  ],
})
