<template>
  <div class="auth">
    <div class="auth-card">
      <div class="auth-lang"><LanguageSwitch /></div>

      <div class="brand">
        <img src="/stride_by_keno.svg" alt="Stride by Keno" class="brand-logo">
        <div class="brand-sub">{{ t('auth.subtitle') }}</div>
      </div>

      <!-- RECOVERY: set a new password after clicking the reset link -->
      <template v-if="auth.recovery">
        <div class="heading">{{ t('auth.setNewPassword') }}</div>
        <form @submit.prevent="submitNewPassword">
          <label class="field">
            <span>{{ t('auth.newPassword') }}</span>
            <div class="pw-wrap">
              <input v-model="password" :type="showPw ? 'text' : 'password'" autocomplete="new-password" required minlength="6" placeholder="••••••••">
              <button type="button" class="pw-toggle" @click="showPw = !showPw" :aria-label="showPw ? t('auth.hidePassword') : t('auth.showPassword')" :title="showPw ? t('auth.hidePassword') : t('auth.showPassword')"><i :class="showPw ? 'ti ti-eye-off' : 'ti ti-eye'"></i></button>
            </div>
          </label>
          <label class="field">
            <span>{{ t('auth.confirmPassword') }}</span>
            <input v-model="password2" :type="showPw ? 'text' : 'password'" autocomplete="new-password" required minlength="6" placeholder="••••••••">
          </label>
          <p v-if="error" class="callout error"><i class="ti ti-alert-circle"></i><span>{{ error }}</span></p>
          <button class="submit" type="submit" :disabled="loading">{{ loading ? t('auth.wait') : t('auth.savePassword') }}</button>
        </form>
      </template>

      <!-- RESET: request a reset link -->
      <template v-else-if="mode === 'reset'">
        <div class="heading">{{ t('auth.resetTitle') }}</div>
        <form @submit.prevent="submitReset">
          <label class="field">
            <span>{{ t('auth.email') }}</span>
            <input v-model="email" type="email" autocomplete="email" required placeholder="you@email.com">
          </label>
          <p v-if="error" class="callout error"><i class="ti ti-alert-circle"></i><span>{{ error }}</span></p>
          <p v-if="info" class="callout info"><i class="ti ti-mail"></i><span>{{ info }}</span></p>
          <button class="submit" type="submit" :disabled="loading">{{ loading ? t('auth.wait') : t('auth.sendLink') }}</button>
        </form>
        <button class="link" @click="setMode('login')">{{ t('auth.backToLogin') }}</button>
      </template>

      <!-- LOGIN / REGISTER -->
      <template v-else>
        <div class="seg">
          <button :class="{ on: mode === 'login' }" @click="setMode('login')">{{ t('auth.login') }}</button>
          <button :class="{ on: mode === 'register' }" @click="setMode('register')">{{ t('auth.register') }}</button>
        </div>

        <form @submit.prevent="submit">
          <label class="field">
            <span>{{ t('auth.email') }}</span>
            <input v-model="email" type="email" autocomplete="email" required placeholder="you@email.com">
          </label>

          <label class="field">
            <span>{{ t('auth.password') }}</span>
            <div class="pw-wrap">
              <input
                v-model="password"
                :type="showPw ? 'text' : 'password'"
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                required
                minlength="6"
                placeholder="••••••••"
              >
              <button type="button" class="pw-toggle" @click="showPw = !showPw" :aria-label="showPw ? t('auth.hidePassword') : t('auth.showPassword')" :title="showPw ? t('auth.hidePassword') : t('auth.showPassword')">
                <i :class="showPw ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
              </button>
            </div>
          </label>

          <label v-if="mode === 'register'" class="field">
            <span>{{ t('auth.confirmPassword') }}</span>
            <input v-model="password2" :type="showPw ? 'text' : 'password'" autocomplete="new-password" required minlength="6" placeholder="••••••••">
          </label>

          <button v-if="mode === 'login'" type="button" class="link forgot" @click="setMode('reset')">{{ t('auth.forgot') }}</button>

          <p v-if="error" class="callout error"><i class="ti ti-alert-circle"></i><span>{{ error }}</span></p>
          <p v-if="info" class="callout info"><i class="ti ti-mail"></i><span>{{ info }}</span></p>

          <button class="submit" type="submit" :disabled="loading">
            {{ loading ? t('auth.wait') : (mode === 'login' ? t('auth.signIn') : t('auth.signUp')) }}
          </button>
        </form>

        <div class="divider"><span>{{ t('auth.or') }}</span></div>

        <button class="google" type="button" @click="auth.signInWithGoogle()">
          <i class="ti ti-brand-google"></i>
          {{ t('auth.google') }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

const { t } = useI18n()
const auth = useAuthStore()

const mode = ref<'login' | 'register' | 'reset'>('login')
const email = ref('')
const password = ref('')
const password2 = ref('')
const showPw = ref(false)
const loading = ref(false)
const error = ref('')
const info = ref('')

function setMode(m: 'login' | 'register' | 'reset') {
  mode.value = m
  error.value = ''
  info.value = ''
}

async function submit() {
  error.value = ''
  info.value = ''
  if (mode.value === 'register' && password.value !== password2.value) {
    error.value = t('auth.passwordsDiffer')
    return
  }
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.signIn(email.value.trim(), password.value)
    } else {
      const loggedIn = await auth.signUp(email.value.trim(), password.value)
      if (!loggedIn) {
        info.value = t('auth.confirmSent')
        mode.value = 'login'
        password2.value = ''
      }
    }
  } catch (e) {
    error.value = translate((e as Error).message)
  } finally {
    loading.value = false
  }
}

async function submitReset() {
  error.value = ''
  info.value = ''
  loading.value = true
  try {
    await auth.resetPassword(email.value.trim())
    info.value = t('auth.resetSent')
  } catch (e) {
    error.value = translate((e as Error).message)
  } finally {
    loading.value = false
  }
}

async function submitNewPassword() {
  error.value = ''
  if (password.value !== password2.value) {
    error.value = t('auth.passwordsDiffer')
    return
  }
  loading.value = true
  try {
    await auth.updatePassword(password.value)
  } catch (e) {
    error.value = translate((e as Error).message)
  } finally {
    loading.value = false
  }
}

function translate(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return t('auth.errInvalid')
  if (m.includes('already registered') || m.includes('already exists')) return t('auth.errExists')
  if (m.includes('password')) return t('auth.errPassword')
  if (m.includes('provider is not enabled')) return t('auth.errGoogle')
  if (m.includes('email')) return t('auth.errEmail')
  return msg
}
</script>

<style scoped>
.auth {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--color-background-secondary);
}
.auth-card {
  width: 100%;
  max-width: 340px;
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: 18px;
  padding: 16px 22px 24px;
}
.auth-lang { display: flex; justify-content: flex-end; margin-bottom: 4px; }

.brand { text-align: center; margin-bottom: 22px; }
.brand-logo { width: 270px; height: auto; margin: 0 auto 10px; display: block; filter: var(--logo-filter); }
.brand-sub { font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; }

.heading { font-size: 17px; font-weight: 500; margin-bottom: 16px; text-align: center; }

.seg { display: flex; background: var(--color-background-tertiary); border-radius: 10px; padding: 3px; margin-bottom: 18px; }
.seg button {
  flex: 1; border: none; background: none; cursor: pointer;
  font-size: 13px; color: var(--color-text-secondary); padding: 7px 0; border-radius: 8px;
}
.seg button.on { background: var(--color-background-primary); color: var(--color-text-primary); font-weight: 500; }

.field { display: block; margin-bottom: 14px; }
.field > span { display: block; font-size: 12px; color: var(--color-text-secondary); margin-bottom: 5px; }
.field input {
  width: 100%;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  padding: 11px 12px; font-size: 15px;
}
.field input:focus { outline: none; border-color: var(--color-text-info); }

.pw-wrap { position: relative; }
.pw-wrap input { padding-right: 42px; }
.pw-toggle {
  position: absolute; top: 0; right: 0; height: 100%; width: 40px;
  border: none; background: none; cursor: pointer;
  color: var(--color-text-tertiary); font-size: 18px;
  display: flex; align-items: center; justify-content: center;
}

.link {
  border: none; background: none; cursor: pointer;
  color: var(--color-text-info); font-size: 13px; padding: 0;
}
.forgot { display: block; margin: -4px 0 14px; }

.callout {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 13px; line-height: 1.4; margin: 0 0 14px;
  padding: 11px 12px; border-radius: var(--border-radius-md);
}
.callout i { font-size: 17px; flex-shrink: 0; margin-top: 1px; }
.callout.info {
  background: var(--color-background-info);
  color: var(--color-text-info);
  border: 0.5px solid var(--color-text-info);
}
.callout.error {
  background: color-mix(in srgb, var(--color-text-danger) 12%, transparent);
  color: var(--color-text-danger);
  border: 0.5px solid color-mix(in srgb, var(--color-text-danger) 45%, transparent);
}

.submit {
  width: 100%; border: none; cursor: pointer;
  background: var(--color-text-info); color: #fff;
  border-radius: var(--border-radius-md); padding: 12px; font-size: 15px; font-weight: 500;
  margin-top: 4px;
}
.submit:disabled { opacity: 0.6; cursor: default; }

.divider {
  display: flex; align-items: center; gap: 10px;
  margin: 18px 0; color: var(--color-text-tertiary); font-size: 12px;
}
.divider::before, .divider::after {
  content: ''; flex: 1; height: 0.5px; background: var(--color-border-secondary);
}

.google {
  width: 100%; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  border: 0.5px solid var(--color-border-secondary);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  border-radius: var(--border-radius-md); padding: 11px; font-size: 15px; font-weight: 500;
}
.google i { font-size: 18px; }
</style>
