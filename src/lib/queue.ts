import type { TicketStatus } from '../types/queue'

/** Allowed status transitions. Keys are from-status; values are allowed to-status. */
export const TICKET_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  waiting: ['serving', 'skipped', 'cancelled'],
  serving: ['completed'],
  completed: [],
  skipped: [],
  cancelled: [],
} as const

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return (TICKET_TRANSITIONS[from] as readonly TicketStatus[]).includes(to)
}

/** Statuses that still occupy a place in the live queue. */
export const ACTIVE_QUEUE_STATUSES: readonly TicketStatus[] = ['waiting', 'serving']

/** Statuses ignored when computing position / waiting count. */
export const TERMINAL_QUEUE_STATUSES: readonly TicketStatus[] = [
  'completed',
  'skipped',
  'cancelled',
]

export function isTerminalStatus(status: TicketStatus): boolean {
  return (TERMINAL_QUEUE_STATUSES as readonly string[]).includes(status)
}

/** UTC calendar day key for ticket numbering (YYYY-MM-DD). */
export function queueDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function snapshotRecordId(businessId: string): string {
  return `snapshot:${businessId}`
}

export function counterRecordId(businessId: string, queueDay: string): string {
  return `counter:${businessId}:${queueDay}`
}

/** RecordRoom id for a customer ticket capability URL. */
export function ticketRoomId(accessToken: string): string {
  return `ticket:${accessToken}`
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function isValidSlug(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 64 && SLUG_RE.test(slug)
}

export function estimateWaitMinutes(
  peopleAhead: number,
  averageServiceMinutes: number,
): number {
  const avg = Number.isFinite(averageServiceMinutes) && averageServiceMinutes > 0
    ? averageServiceMinutes
    : 30
  return Math.max(0, Math.round(peopleAhead * avg))
}
