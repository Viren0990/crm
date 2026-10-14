import { clsx, type ClassValue } from 'clsx'

// ── Class name merger ─────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ── Date formatters ───────────────────────────────
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function formatForDateTimeLocal(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  // Format for Asia/Kolkata manually
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  
  // parts will have { day, month, year, hour, minute }
  const parts = formatter.formatToParts(d)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00'
  
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`
}

// ── India-time date/time inputs ───────────────────
// Dates and times are entered in India time and stored as the exact moment,
// so they don't shift with the server's or browser's timezone.

// 'YYYY-MM-DD' for an <input type="date">, as the date falls in India
export function toIndiaDateInput(date: Date | string | null | undefined): string {
  return formatForDateTimeLocal(date).slice(0, 10)
}

// Stored time text ("5 PM", "12:30 PM", "15:30") -> 'HH:mm' for an <input type="time">
export function timeTextToInput(text: string | null | undefined): string {
  const match = text?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i)
  if (!match) return ''
  let hour = Number(match[1])
  const minute = Number(match[2] || '0')
  const ampm = match[3]?.toUpperCase()
  if (hour <= 12 && ampm === 'PM' && hour !== 12) hour += 12
  if (hour === 12 && ampm === 'AM') hour = 0
  if (hour > 23 || minute > 59) return ''
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// 'HH:mm' from an <input type="time"> -> "h:mm AM/PM" (the format kept in scheduledTime)
export function timeInputToText(value: string | null | undefined): string {
  const match = value?.match(/^(\d{2}):(\d{2})/)
  if (!match) return ''
  const hour = Number(match[1])
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${match[2]} ${ampm}`
}

// Date ('YYYY-MM-DD') + time ('HH:mm') entered in India time -> the exact moment
export function fromIndiaDateTime(dateStr: string, timeStr?: string | null): Date {
  return new Date(`${dateStr}T${timeStr || '00:00'}:00+05:30`)
}

// Imported date (CSV / Excel) -> exact moment in India time, or undefined if unreadable.
// Accepts Excel serial numbers, "2026-10-05", "05/10/2026" (day first, as used in India),
// "5-10-26", optional "HH:mm" after the date, and text like "5 Oct 2026" / "October 5, 2026".
export function parseIndiaDate(value: unknown): Date | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const pad = (n: number) => String(n).padStart(2, '0')
  const build = (year: number, month: number, day: number, hour = 0, minute = 0) => {
    if (year < 100) year += 2000
    if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return undefined
    const d = fromIndiaDateTime(`${year}-${pad(month)}-${pad(day)}`, `${pad(hour)}:${pad(minute)}`)
    // Reject dates that don't exist (e.g. 31/02)
    return !isNaN(d.getTime()) && toIndiaDateInput(d) === `${year}-${pad(month)}-${pad(day)}` ? d : undefined
  }

  // Excel stores dates as days since 1899-12-30 (fraction = time of day)
  const asNumber = typeof value === 'number' ? value : /^\d{5}(\.\d+)?$/.test(String(value).trim()) ? Number(value) : NaN
  if (!isNaN(asNumber)) {
    if (asNumber < 20000 || asNumber > 80000) return undefined
    const utc = new Date(Date.UTC(1899, 11, 30) + Math.round(asNumber * 86400) * 1000)
    return build(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes())
  }

  const text = String(value).trim()
  const time = text.match(/[ T](\d{1,2}):(\d{2})/)
  const [hour, minute] = time ? [Number(time[1]), Number(time[2])] : [0, 0]

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return build(Number(iso[1]), Number(iso[2]), Number(iso[3]), hour, minute)

  const dayFirst = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})(?![\d])/)
  if (dayFirst) return build(Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1]), hour, minute)

  // Text months: read the calendar date as written, then pin it to India time
  const parsed = new Date(text)
  if (isNaN(parsed.getTime())) return undefined
  return build(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate(), parsed.getHours(), parsed.getMinutes())
}

// ── Stale detection ───────────────────────────────
export function getDaysSinceUpdate(date: Date | string): number {
  const d = new Date(date)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

export function getStaleLevel(date: Date | string): 'none' | 'warning' | 'danger' {
  const days = getDaysSinceUpdate(date)
  if (days >= 10) return 'danger'
  if (days >= 5) return 'warning'
  return 'none'
}

// ── Badge color mapper ────────────────────────────
export function getBadgeClasses(color: string): string {
  const map: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    green: 'bg-green-50 text-green-700 ring-green-600/20',
    orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    gray: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  }
  return map[color] || map.gray
}

export function getSolidBadgeClasses(color: string): string {
  const map: Record<string, string> = {
    blue: 'bg-blue-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    violet: 'bg-violet-600 text-white',
    amber: 'bg-amber-500 text-white', // Amber looks better at 500
    rose: 'bg-rose-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    green: 'bg-green-600 text-white',
    orange: 'bg-orange-500 text-white',
    gray: 'bg-gray-500 text-white',
  }
  return map[color] || map.gray
}

// ── Onboarding progress calculator ────────────────
export function calculateOnboardingProgress(onboarding: {
  registrationEmail: boolean
  registeredEnrollment: boolean
  paymentReceived: boolean
  onboardingEmail: boolean
  onboardingCall: boolean
  documentsCollected: boolean
}): { completed: number; total: number; percentage: number } {
  const fields = [
    onboarding.registrationEmail,
    onboarding.registeredEnrollment,
    onboarding.paymentReceived,
    onboarding.onboardingEmail,
    onboarding.onboardingCall,
    onboarding.documentsCollected,
  ]
  const completed = fields.filter(Boolean).length
  const total = fields.length
  return { completed, total, percentage: Math.round((completed / total) * 100) }
}

// ── Debounce helper ───────────────────────────────
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// ── Currency formatter ────────────────────────────
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
