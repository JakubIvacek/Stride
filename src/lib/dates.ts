// Date helpers. All app date strings are local 'YYYY-MM-DD' (NOT UTC) so days
// never shift across timezones. Week starts Monday. Labels are Slovak.

export const DAY_NAMES = ['Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota', 'Nedeľa']
// First letters Po→Ne for the mini bar chart / year grid.
export const DAY_LETTERS = ['P', 'U', 'S', 'Š', 'P', 'S', 'N']
export const WEEKDAY_SHORT = ['po', 'ut', 'st', 'št', 'pi', 'so', 'ne']
export const MONTH_NAMES = [
  'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
  'Júl', 'August', 'September', 'Október', 'November', 'December',
]
// Genitive month names for "9. jún" style day labels.
const MONTH_GEN = [
  'januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
  'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra',
]

export function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today(): string {
  return ymd(new Date())
}

export function addDays(s: string, n: number): string {
  const d = parseYmd(s)
  d.setDate(d.getDate() + n)
  return ymd(d)
}

/** Monday (as 'YYYY-MM-DD') of the week containing `date`. */
export function getMonday(date: Date | string): string {
  const d = typeof date === 'string' ? parseYmd(date) : new Date(date)
  const day = d.getDay() // 0 Sun .. 6 Sat
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return ymd(d)
}

/** Index 0..6 (Mon..Sun) for a date string. */
export function weekdayIndex(s: string): number {
  const day = parseYmd(s).getDay()
  return day === 0 ? 6 : day - 1
}

/** "9. jún" — day + short genitive-ish month (matches mockups). */
export function dayMonthLabel(s: string): string {
  const d = parseYmd(s)
  const short = ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec']
  return `${d.getDate()}. ${short[d.getMonth()]}`
}

/** "9. – 15. jún 2026" style range for a Monday→Sunday week. */
export function weekRangeLabel(monday: string): string {
  const a = parseYmd(monday)
  const b = parseYmd(addDays(monday, 6))
  const short = ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec']
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()}. – ${b.getDate()}. ${short[b.getMonth()]} ${b.getFullYear()}`
  }
  return `${a.getDate()}. ${short[a.getMonth()]} – ${b.getDate()}. ${short[b.getMonth()]} ${b.getFullYear()}`
}

export { MONTH_GEN }

/** ISO week key "YYYY-Www" used to bucket tasks for the stats chart. */
export function isoWeekKey(s: string): string {
  const d = parseYmd(s)
  const target = new Date(d.valueOf())
  const dayNr = (d.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const diff = target.getTime() - firstThursday.getTime()
  const week = 1 + Math.round(diff / (7 * 24 * 3600 * 1000))
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`
}
