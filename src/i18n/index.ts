import { createI18n } from 'vue-i18n'
import { messages, type AppLocale } from './messages'

const STORAGE_KEY = 'tracker.lang'

function initialLocale(): AppLocale {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'sk') return saved
  return 'en' // default English
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'en',
  messages,
})

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

export const LOCALES: { id: AppLocale; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'sk', label: 'SK' },
]
