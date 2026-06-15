import { createI18n } from 'vue-i18n'
import { messages, type AppLocale } from './messages'

const STORAGE_KEY = 'tracker.lang'
const SUPPORTED = Object.keys(messages) as AppLocale[]

function initialLocale(): AppLocale {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && SUPPORTED.includes(saved as AppLocale)) return saved as AppLocale
  // first visit: try the browser language, else default English
  const nav = navigator.language?.slice(0, 2) as AppLocale
  if (nav && SUPPORTED.includes(nav)) return nav
  return 'en'
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

// shown in the language dropdown (native names)
export const LOCALES: { id: AppLocale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'sk', label: 'Slovenčina' },
  { id: 'de', label: 'Deutsch' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'it', label: 'Italiano' },
  { id: 'pt', label: 'Português' },
]
