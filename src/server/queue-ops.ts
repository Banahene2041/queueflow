import type { ActionResult, ActionTools } from 'deepspace/worker'
import type { Env } from '../../worker'
import { canTransition, estimateWaitMinutes, ticketRoomId } from '../lib/queue'
import type {
  Business,
  QueueEventAction,
  Ticket,
  TicketStatus,
  TicketView,
} from '../types/queue'
import { createRecordTools } from './record-tools'
import { refreshBusinessSnapshot } from './queue-service'

type Envelope<T> = {
  recordId: string
  data: T
}

function asTicket(data: Record<string, unknown>): Ticket | null {
  const status = data.status
  if (
    typeof data.businessId !== 'string' ||
    typeof data.queueDay !== 'string' ||
    typeof data.ticketNumber !== 'number' ||
    typeof data.customerName !== 'string' ||
    typeof data.joinedAt !== 'string' ||
    (status !== 'waiting' &&
      status !== 'serving' &&
      status !== 'completed' &&
      status !== 'skipped' &&
      status !== 'cancelled')
  ) {
    return null
  }
  return {
    businessId: data.businessId,
    queueDay: data.queueDay,
    ticketNumber: data.ticketNumber,
    customerName: data.customerName,
    phone: typeof data.phone === 'string' ? data.phone : '',
    status,
    joinedAt: data.joinedAt,
    calledAt: typeof data.calledAt === 'string' ? data.calledAt : '',
    completedAt: typeof data.completedAt === 'string' ? data.completedAt : '',
  }
}

function asBusiness(data: Record<string, unknown>): Business | null {
  if (typeof data.name !== 'string' || typeof data.slug !== 'string') return null
  return {
    name: data.name,
    slug: data.slug,
    description: typeof data.description === 'string' ? data.description : '',
    address: typeof data.address === 'string' ? data.address : '',
    logoKey: typeof data.logoKey === 'string' ? data.logoKey : '',
    isOpen: Boolean(data.isOpen),
    averageServiceMinutes:
      typeof data.averageServiceMinutes === 'number' && data.averageServiceMinutes > 0
        ? data.averageServiceMinutes
        : 30,
  }
}

async function loadBusiness(
  tools: ActionTools,
  businessId: string,
): Promise<ActionResult<{ business: Envelope<Business> }>> {
  const result = await tools.get('businesses', businessId)
  if (!result.success) return result
  const business = asBusiness(result.data.record.data)
  if (!business) return { success: false, error: 'Invalid business record' }
  return {
    success: true,
    data: { business: { recordId: result.data.record.recordId, data: business } },
  }
}

async function loadTicket(
  tools: ActionTools,
  ticketId: string,
): Promise<ActionResult<{ ticket: Envelope<Ticket> }>> {
  const result = await tools.get('tickets', ticketId)
  if (!result.success) return result
  const ticket = asTicket(result.data.record.data)
  if (!ticket) return { success: false, error: 'Invalid ticket record' }
  return {
    success: true,
    data: { ticket: { recordId: result.data.record.recordId, data: ticket } },
  }
}

async function getServingTicket(
  tools: ActionTools,
  businessId: string,
): Promise<Envelope<Ticket> | null> {
  const result = await tools.query('tickets', {
    where: { businessId, status: 'serving' },
    limit: 1,
  })
  if (!result.success || result.data.records.length === 0) return null
  const row = result.data.records[0]
  const ticket = asTicket(row.data)
  if (!ticket) return null
  return { recordId: row.recordId, data: ticket }
}

async function getOldestWaiting(
  tools: ActionTools,
  businessId: string,
): Promise<Envelope<Ticket> | null> {
  const result = await tools.query('tickets', {
    where: { businessId, status: 'waiting' },
    orderBy: 'joinedAt',
    orderDir: 'asc',
    limit: 1,
  })
  if (!result.success || result.data.records.length === 0) return null
  const row = result.data.records[0]
  const ticket = asTicket(row.data)
  if (!ticket) return null
  return { recordId: row.recordId, data: ticket }
}

async function listWaiting(
  tools: ActionTools,
  businessId: string,
): Promise<Envelope<Ticket>[]> {
  const result = await tools.query('tickets', {
    where: { businessId, status: 'waiting' },
    orderBy: 'joinedAt',
    orderDir: 'asc',
    limit: 500,
  })
  if (!result.success) return []
  return result.data.records
    .map((row) => {
      const ticket = asTicket(row.data)
      return ticket ? { recordId: row.recordId, data: ticket } : null
    })
    .filter((row): row is Envelope<Ticket> => row !== null)
}

async function getAccessToken(
  tools: ActionTools,
  ticketId: string,
): Promise<string | null> {
  const secret = await tools.get('ticket_secrets', `secret:${ticketId}`)
  if (!secret.success) return null
  const token = secret.data.record.data.accessToken
  return typeof token === 'string' ? token : null
}

async function writeTicketView(
  env: Env,
  accessToken: string,
  view: TicketView,
): Promise<void> {
  const roomTools = createRecordTools(env, ticketRoomId(accessToken), 'system:queue')
  const result = await roomTools.create('ticket_views', { ...view }, 'current')
  if (!result.success) {
    console.warn('[queue] ticket_view update failed', result.error)
  }
}

async function syncTicketView(
  env: Env,
  tools: ActionTools,
  business: Envelope<Business>,
  ticket: Envelope<Ticket>,
  peopleAhead: number,
): Promise<void> {
  const accessToken = await getAccessToken(tools, ticket.recordId)
  if (!accessToken) return
  await writeTicketView(env, accessToken, {
    businessId: business.recordId,
    businessName: business.data.name,
    ticketNumber: ticket.data.ticketNumber,
    status: ticket.data.status,
    peopleAhead,
    estimatedWaitMinutes: estimateWaitMinutes(
      peopleAhead,
      business.data.averageServiceMinutes,
    ),
    customerName: ticket.data.customerName,
  })
}

async function refreshWaitingViews(
  env: Env,
  tools: ActionTools,
  business: Envelope<Business>,
): Promise<void> {
  const waiting = await listWaiting(tools, business.recordId)
  for (let i = 0; i < waiting.length; i++) {
    await syncTicketView(env, tools, business, waiting[i], i)
  }
}

async function recordEvent(
  tools: ActionTools,
  input: {
    businessId: string
    ticketId: string
    actorId: string
    action: QueueEventAction
  },
): Promise<void> {
  await tools.create('queue_events', input)
}

export type StaffMutationResult = {
  ticketId: string
  ticketNumber: number
  status: TicketStatus
}

async function applyTransition(
  env: Env,
  tools: ActionTools,
  actorId: string,
  businessId: string,
  ticketId: string,
  toStatus: TicketStatus,
  eventAction: QueueEventAction,
): Promise<ActionResult<StaffMutationResult>> {
  const businessResult = await loadBusiness(tools, businessId)
  if (!businessResult.success) return businessResult
  const { business } = businessResult.data

  const ticketResult = await loadTicket(tools, ticketId)
  if (!ticketResult.success) return ticketResult
  const { ticket } = ticketResult.data

  if (ticket.data.businessId !== businessId) {
    return { success: false, error: 'Forbidden: ticket belongs to another business' }
  }

  if (!canTransition(ticket.data.status, toStatus)) {
    return {
      success: false,
      error: `Invalid transition: ${ticket.data.status} → ${toStatus}`,
    }
  }

  if (toStatus === 'serving') {
    const serving = await getServingTicket(tools, businessId)
    if (serving && serving.recordId !== ticketId) {
      return {
        success: false,
        error: `Ticket #${serving.data.ticketNumber} is already being served. Complete it first.`,
      }
    }
  }

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { status: toStatus }
  if (toStatus === 'serving') patch.calledAt = now
  if (toStatus === 'completed') patch.completedAt = now

  const updated = await tools.update('tickets', ticketId, patch)
  if (!updated.success) return updated

  const nextTicket: Envelope<Ticket> = {
    recordId: ticketId,
    data: {
      ...ticket.data,
      status: toStatus,
      calledAt: typeof patch.calledAt === 'string' ? patch.calledAt : ticket.data.calledAt,
      completedAt:
        typeof patch.completedAt === 'string' ? patch.completedAt : ticket.data.completedAt,
    },
  }

  await recordEvent(tools, {
    businessId,
    ticketId,
    actorId,
    action: eventAction,
  })

  // Mutated ticket view first, then recompute waiting positions.
  const peopleAhead =
    toStatus === 'waiting'
      ? (await listWaiting(tools, businessId)).findIndex((t) => t.recordId === ticketId)
      : 0
  await syncTicketView(
    env,
    tools,
    business,
    nextTicket,
    peopleAhead < 0 ? 0 : peopleAhead,
  )
  await refreshWaitingViews(env, tools, business)
  await refreshBusinessSnapshot(tools, business)

  return {
    success: true,
    data: {
      ticketId,
      ticketNumber: nextTicket.data.ticketNumber,
      status: toStatus,
    },
  }
}

export async function callNextTicketOp(
  env: Env,
  tools: ActionTools,
  actorId: string,
  businessId: string,
): Promise<ActionResult<StaffMutationResult>> {
  const serving = await getServingTicket(tools, businessId)
  if (serving) {
    return {
      success: false,
      error: `Ticket #${serving.data.ticketNumber} is already being served. Complete it first.`,
    }
  }

  const next = await getOldestWaiting(tools, businessId)
  if (!next) {
    return { success: false, error: 'No waiting customers' }
  }

  return applyTransition(env, tools, actorId, businessId, next.recordId, 'serving', 'called')
}

export async function markServingOp(
  env: Env,
  tools: ActionTools,
  actorId: string,
  businessId: string,
  ticketId: string,
): Promise<ActionResult<StaffMutationResult>> {
  return applyTransition(env, tools, actorId, businessId, ticketId, 'serving', 'serving')
}

export async function completeTicketOp(
  env: Env,
  tools: ActionTools,
  actorId: string,
  businessId: string,
  ticketId: string,
): Promise<ActionResult<StaffMutationResult>> {
  return applyTransition(env, tools, actorId, businessId, ticketId, 'completed', 'completed')
}

export async function skipTicketOp(
  env: Env,
  tools: ActionTools,
  actorId: string,
  businessId: string,
  ticketId: string,
): Promise<ActionResult<StaffMutationResult>> {
  return applyTransition(env, tools, actorId, businessId, ticketId, 'skipped', 'skipped')
}

export async function cancelTicketOp(
  env: Env,
  tools: ActionTools,
  actorId: string,
  businessId: string,
  ticketId: string,
): Promise<ActionResult<StaffMutationResult>> {
  return applyTransition(env, tools, actorId, businessId, ticketId, 'cancelled', 'cancelled')
}
