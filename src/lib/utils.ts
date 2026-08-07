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
