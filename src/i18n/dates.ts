import { useI18n } from 'vue-i18n'
import { addDays, parseYmd } from '@/lib/dates'
import type { AppLocale } from './messages'

// Monday-first single letters (chart) and short weekday names (calendar header).
const DAY_LETTERS: Record<AppLocale, string[]> = {
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  sk: ['P', 'U', 'S', 'Š', 'P', 'S', 'N'],
}
const WEEKDAY_SHORT: Record<AppLocale, string[]> = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  sk: ['po', 'ut', 'st', 'št', 'pi', 'so', 'ne'],
}

/** Locale-aware date formatters. Reactive: reading these inside a computed/template
 *  re-evaluates when the language changes (they access `locale.value`). */
export function useFmt() {
  const { locale } = useI18n()
  const intl = () => (locale.value === 'sk' ? 'sk-SK' : 'en-US')
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const dayName = (ds: string) =>
    cap(new Intl.DateTimeFormat(intl(), { weekday: 'long' }).format(parseYmd(ds)))
  const monthName = (m: number) =>
    cap(new Intl.DateTimeFormat(intl(), { month: 'long' }).format(new Date(2020, m, 1)))
  const monthShort = (m: number) =>
    new Intl.DateTimeFormat(intl(), { month: 'short' }).format(new Date(2020, m, 1))
  const dayMonthLabel = (ds: string) =>
    new Intl.DateTimeFormat(intl(), { day: 'numeric', month: 'short' }).format(parseYmd(ds))
  const fullDate = (ds: string) =>
    new Intl.DateTimeFormat(intl(), { weekday: 'long', day: 'numeric', month: 'long' }).format(parseYmd(ds))
  function weekRange(monday: string) {
    const a = parseYmd(monday)
    const b = parseYmd(addDays(monday, 6))
    const f = new Intl.DateTimeFormat(intl(), { day: 'numeric', month: 'short' })
    return `${f.format(a)} – ${f.format(b)} ${b.getFullYear()}`
  }
  const dayLetters = () => DAY_LETTERS[locale.value as AppLocale] ?? DAY_LETTERS.en
  const weekdayShort = () => WEEKDAY_SHORT[locale.value as AppLocale] ?? WEEKDAY_SHORT.en

  return { locale, dayName, monthName, monthShort, dayMonthLabel, fullDate, weekRange, dayLetters, weekdayShort }
}
