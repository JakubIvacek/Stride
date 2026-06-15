<template>
  <div class="account">
    <header class="ac-head">
      <button class="icon-btn" @click="goBack" :aria-label="t('account.backAria')"><i class="ti ti-chevron-left"></i></button>
      <div class="ac-title">{{ t('account.title') }}</div>
      <span class="ac-logo"><img src="/stride_icon.svg" alt="Stride"></span>
    </header>

    <div class="ac-body">
      <!-- profile -->
      <section class="ac-card">
        <div class="ac-label">{{ t('account.signedInAs') }}</div>
        <div class="ac-email">{{ email }}</div>
      </section>

      <!-- appearance -->
      <section class="ac-card">
        <div class="ac-row">
          <span class="row-label">{{ t('account.language') }}</span>
          <LanguageSwitch />
        </div>
        <div class="divider"></div>
        <div class="ac-row">
          <span class="row-label">{{ t('account.theme') }}</span>
          <div class="seg">
            <button
              v-for="opt in themeOptions"
              :key="opt"
              :class="{ on: theme === opt }"
              @click="setTheme(opt)"
            >{{ t('account.theme' + cap(opt)) }}</button>
          </div>
        </div>
      </section>

      <!-- categories -->
      <button class="list-btn" @click="catSheet = true">
        <span>{{ t('account.categories') }}</span>
        <i class="ti ti-chevron-right"></i>
      </button>

      <!-- change password -->
      <section class="ac-card">
        <div class="ac-label">{{ t('account.changePassword') }}</div>
        <div class="pw-wrap">
          <input
            v-model="newPassword"
            :type="showPw ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="6"
            :placeholder="t('account.newPassword')"
            class="ac-input"
          >
          <button type="button" class="pw-toggle" @click="showPw = !showPw">
            <i :class="showPw ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
          </button>
        </div>
        <input
          v-model="confirmPassword"
          :type="showPw ? 'text' : 'password'"
          autocomplete="new-password"
          minlength="6"
          :placeholder="t('account.confirmPassword')"
          class="ac-input"
        >
        <p v-if="pwError" class="msg error">{{ pwError }}</p>
        <p v-if="pwOk" class="msg ok">{{ t('account.passwordChanged') }}</p>
        <button class="save-btn" :disabled="!canSave || saving" @click="changePassword">
          {{ t('account.save') }}
        </button>
      </section>

      <!-- sign out -->
      <button class="signout-btn" @click="auth.signOut()">
        <i class="ti ti-logout"></i> {{ t('account.signOut') }}
      </button>
    </div>

    <CategoriesSheet v-model="catSheet" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitch from '@/components/LanguageSwitch.vue'
import CategoriesSheet from '@/components/CategoriesSheet.vue'
import { applyTheme, getTheme, type Theme } from '@/lib/theme'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const email = computed(() => auth.session?.user.email ?? 'demo@stride.app')

const themeOptions: Theme[] = ['system', 'light', 'dark']
const theme = ref<Theme>(getTheme())
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
function setTheme(t: Theme) {
  theme.value = t
  applyTheme(t)
}

const catSheet = ref(false)

const newPassword = ref('')
const confirmPassword = ref('')
const showPw = ref(false)
const saving = ref(false)
const pwError = ref('')
const pwOk = ref(false)
const canSave = computed(() => newPassword.value.length >= 6 && confirmPassword.value.length >= 6)

async function changePassword() {
  pwError.value = ''
  pwOk.value = false
  if (newPassword.value !== confirmPassword.value) {
    pwError.value = t('auth.passwordsDiffer')
    return
  }
  saving.value = true
  try {
    await auth.updatePassword(newPassword.value)
    pwOk.value = true
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    pwError.value = (e as Error).message
  } finally {
    saving.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<style scoped>
.account { min-height: 100%; }
.ac-head {
  position: sticky; top: 0; z-index: 20;
  background: var(--color-background-primary);
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px 10px;
  border-bottom: 0.5px solid var(--color-border-tertiary);
}
.ac-title { font-size: 17px; font-weight: 500; flex: 1; }
.ac-logo { display: flex; }
.ac-logo img { height: 22px; filter: var(--logo-filter); }

.ac-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }

.ac-card {
  background: var(--color-background-secondary);
  border-radius: var(--border-radius-lg);
  padding: 16px;
}
.ac-label { font-size: 12px; color: var(--color-text-secondary); margin-bottom: 8px; }
.ac-email { font-size: 16px; color: var(--color-text-primary); }

.ac-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 30px; }
.row-label { font-size: 15px; color: var(--color-text-primary); }
.ac-card .divider { height: 0.5px; background: var(--color-border-tertiary); margin: 14px 0; }

.seg { display: flex; background: var(--color-background-tertiary); border-radius: 9px; padding: 2px; }
.seg button {
  border: none; background: none; cursor: pointer;
  font-size: 12px; color: var(--color-text-secondary); padding: 5px 10px; border-radius: 7px;
}
.seg button.on { background: var(--color-background-primary); color: var(--color-text-primary); font-weight: 500; }

.list-btn {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--color-background-secondary);
  border: none; border-radius: var(--border-radius-lg);
  padding: 15px 16px; cursor: pointer;
  font-size: 15px; color: var(--color-text-primary);
}
.list-btn i { color: var(--color-text-tertiary); font-size: 18px; }

.pw-wrap { position: relative; margin-top: 8px; }
.pw-wrap .ac-input { margin-top: 0; padding-right: 42px; }
.pw-toggle {
  position: absolute; top: 0; right: 0; height: 100%; width: 40px;
  border: none; background: none; cursor: pointer;
  color: var(--color-text-tertiary); font-size: 18px;
  display: flex; align-items: center; justify-content: center;
}
.ac-input {
  width: 100%; margin-top: 8px;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  padding: 11px 12px; font-size: 15px;
}
.ac-input:focus { outline: none; border-color: var(--color-text-info); }
.msg { font-size: 13px; margin: 10px 0 0; }
.msg.error { color: var(--color-text-danger); }
.msg.ok { color: var(--color-text-success); }
.save-btn {
  width: 100%; margin-top: 12px; cursor: pointer; border: none;
  background: var(--color-text-info); color: #fff;
  border-radius: var(--border-radius-md); padding: 11px; font-size: 15px; font-weight: 500;
}
.save-btn:disabled { opacity: 0.5; cursor: default; }

.signout-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; cursor: pointer; margin-top: 4px;
  background: none; border: 0.5px solid var(--color-border-secondary);
  color: var(--color-text-danger);
  border-radius: var(--border-radius-md); padding: 12px; font-size: 15px; font-weight: 500;
}
.signout-btn i { font-size: 18px; }
</style>
