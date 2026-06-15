import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const ready = ref(false)
  // true while the user arrived via a password-reset link and must set a new password
  const recovery = ref(false)

  async function init() {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    supabase.auth.onAuthStateChange((event, s) => {
      session.value = s
      if (event === 'PASSWORD_RECOVERY') recovery.value = true
    })
    ready.value = true
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  /** Returns true if a session was created immediately (email confirmation off),
   *  false if a confirmation email was sent and login must wait. */
  async function signUp(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return !!data.session
  }

  /** Send a password-reset email; the link returns the user to the app. */
  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  }

  /** Set a new password during the recovery flow. */
  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    recovery.value = false
  }

  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' })
  const signOut = () => supabase.auth.signOut()

  return {
    session, ready, recovery,
    init, signIn, signUp, resetPassword, updatePassword, signInWithGoogle, signOut,
  }
})
