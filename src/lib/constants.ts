// ── Lead Statuses ─────────────────────────────────
export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New', color: 'blue' },
  { value: 'CONTACTED', label: 'Needs Call Back', color: 'indigo' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'violet' },
  { value: 'DEMO_SCHEDULED', label: 'Demo Scheduled', color: 'amber' },
  { value: 'DETAILS_SENT', label: 'Details Sent, Needs Follow-up', color: 'cyan' },
  { value: 'LOST', label: 'Lost', color: 'rose' },
] as const

// ── Follow Up Overall Statuses ────────────────────────
export const FOLLOW_UP_STATUSES = [
  { value: 'ONGOING', label: 'Ongoing', color: 'amber' },
  { value: 'COMPLETED', label: 'Completed', color: 'emerald' },
  { value: 'LOST', label: 'Lost', color: 'rose' },
] as const

// ── Lead Types ────────────────────────────────────
export const LEAD_TYPES = [
  { value: 'B2B', label: 'B2B', color: 'blue' },
  { value: 'B2C', label: 'B2C', color: 'emerald' },
  { value: 'Both', label: 'Both', color: 'violet' },
  { value: 'N/A', label: 'Not Known', color: 'gray' },
] as const

// ── Lead Priorities ───────────────────────────────
export const LEAD_PRIORITIES = [
  { value: 'HOT', label: 'Hot', color: 'rose', emoji: '🔴' },
  { value: 'WARM', label: 'Warm', color: 'amber', emoji: '🟡' },
  { value: 'COLD', label: 'Cold', color: 'blue', emoji: '🔵' },
] as const

// ── Lead Sources ──────────────────────────────────
export const LEAD_SOURCES = [
  'Meta ad',
  'Google ad',
  'Website',
  'Referral',
  'Cold Call',
  'Social Media',
  'Email Campaign',
  'Event',
  'Partner',
  'Other',
] as const

// ── Demo Statuses ─────────────────────────────────
export const DEMO_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'amber' },
  { value: 'COMPLETED', label: 'Completed', color: 'emerald' },
  { value: 'RESCHEDULED', label: 'Rescheduled', color: 'orange' },
  { value: 'NO_SHOW', label: 'No Show', color: 'gray' },
] as const

// ── Onboarding Statuses ───────────────────────────
export const ONBOARDING_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'amber' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { value: 'COMPLETED', label: 'Completed', color: 'emerald' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'gray' },
] as const

// ── Activity Types ────────────────────────────────
export const ACTIVITY_TYPES = {
  NOTE: { label: 'Note', icon: '📝', color: 'gray' },
  STATUS_CHANGE: { label: 'Status Changed', icon: '🔄', color: 'blue' },
  DEMO_SCHEDULED: { label: 'Demo Scheduled', icon: '🎯', color: 'amber' },
  DEMO_RESULT: { label: 'Demo Result', icon: '📊', color: 'violet' },
  ONBOARDING_UPDATE: { label: 'Onboarding Update', icon: '🚀', color: 'emerald' },
  CALL: { label: 'Call Made', icon: '📞', color: 'indigo' },
  WHATSAPP: { label: 'WhatsApp Sent', icon: '💬', color: 'green' },
  FOLLOW_UP: { label: 'Follow-up Set', icon: '📅', color: 'orange' },
  CREATED: { label: 'Lead Created', icon: '📥', color: 'blue' },
} as const

// ── Staff Options ─────────────────────────────────
export const LEAD_STAFF = ['Ritu', 'Pooja', 'Anuja'] as const
export const DEMO_STAFF = ['Jaspal', 'Raj'] as const

// ── Onboarding Checklist Fields ───────────────────
export const ONBOARDING_CHECKLIST = [
  { field: 'registrationEmail', label: 'Registration Email Sent' },
  { field: 'registeredEnrollment', label: 'Enrollment Registered' },
  { field: 'paymentReceived', label: 'Payment Received' },
  { field: 'onboardingEmail', label: 'Onboarding Email Sent' },
  { field: 'onboardingCall', label: 'Onboarding Call Done' },
  { field: 'documentsCollected', label: 'Documents Collected' },
] as const
