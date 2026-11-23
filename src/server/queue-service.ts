import type { ActionResult, ActionTools } from 'deepspace/worker'
import type { Env } from '../../worker'
import {
  counterRecordId,
  estimateWaitMinutes,
  normalizeSlug,
  queueDayKey,
  snapshotRecordId,
  ticketRoomId,
} from '../lib/queue'
import { hashAccessToken, mintAccessToken } from '../lib/tokens'
import type { Business, QueueSnapshot, Ticket, TicketView } from '../types/queue'
import { appRoomName, createRecordTools } from './record-tools'

type Envelope<T> = {
  recordId: string
  data: T
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export type PublicBusinessPayload = {
  business: {
    id: string
    name: string
    slug: string
    description: string
    address: string
    logoKey: string
    isOpen: boolean
    averageServiceMinutes: number
  }
  snapshot: {
    waitingCount: number
    servingTicketNumber: number
    estimatedWaitMinutes: number
    isOpen: boolean
  }
}

export type JoinQueueResult = {
  ticketId: string
  ticketNumber: number
  accessToken: string
  peopleAhead: number
  estimatedWaitMinutes: number
  status: 'waiting'
}

/** Safe customer ticket payload — never includes phone or access token. */
export type SafeTicketPayload = {
  businessId: string
  businessName: string
  ticketNumber: number
  status: Ticket['status']
  peopleAhead: number
  estimatedWaitMinutes: number
  customerName: string
  isOpen: boolean
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

export async function findBusinessBySlug(
  tools: ActionTools,
  slug: string,
): Promise<ActionResult<{ business: Envelope<Business> }>> {
  const normalized = normalizeSlug(slug)
  if (!normalized) return { success: false, error: 'Invalid business slug' }

  const result = await tools.query('businesses', { where: { slug: normalized }, limit: 1 })
  if (!result.success) return result

  const row = result.data.records[0]
  if (!row) return { success: false, error: 'Business not found' }

  const business = asBusiness(row.data)
  if (!business) return { success: false, error: 'Business record is invalid' }

  return {
    success: true,
    data: {
      business: {
        recordId: row.recordId,
        data: business,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
      },
    },
  }
}

export async function getOrEmptySnapshot(
  tools: ActionTools,
  businessId: string,
  fallbackOpen: boolean,
): Promise<QueueSnapshot> {
  const id = snapshotRecordId(businessId)
  const result = await tools.get('queue_snapshots', id)
  if (result.success) {
    const data = result.data.record.data as Partial<QueueSnapshot>
    return {
      businessId,
      waitingCount: typeof data.waitingCount === 'number' ? data.waitingCount : 0,
      servingTicketNumber:
        typeof data.servingTicketNumber === 'number' ? data.servingTicketNumber : 0,
      estimatedWaitMinutes:
        typeof data.estimatedWaitMinutes === 'number' ? data.estimatedWaitMinutes : 0,
      isOpen: typeof data.isOpen === 'boolean' ? data.isOpen : fallbackOpen,
    }
  }
  return {
    businessId,
    waitingCount: 0,
    servingTicketNumber: 0,
    estimatedWaitMinutes: 0,
    isOpen: fallbackOpen,
  }
}

export async function buildPublicBusinessPayload(
  tools: ActionTools,
  slug: string,
): Promise<ActionResult<PublicBusinessPayload>> {
  const found = await findBusinessBySlug(tools, slug)
  if (!found.success) return found

  const { business } = found.data
  const snapshot = await getOrEmptySnapshot(tools, business.recordId, business.data.isOpen)

  return {
    success: true,
    data: {
      business: {
        id: business.recordId,
        name: business.data.name,
        slug: business.data.slug,
        description: business.data.description,
        address: business.data.address,
        logoKey: business.data.logoKey,
        isOpen: business.data.isOpen,
        averageServiceMinutes: business.data.averageServiceMinutes,
      },
      snapshot: {
        waitingCount: snapshot.waitingCount,
        servingTicketNumber: snapshot.servingTicketNumber,
        estimatedWaitMinutes: snapshot.estimatedWaitMinutes,
        isOpen: business.data.isOpen && snapshot.isOpen,
      },
    },
  }
}

async function countWaitingAhead(
  tools: ActionTools,
  businessId: string,
  joinedAt: string,
): Promise<number> {
  const waiting = await tools.query('tickets', {
    where: { businessId, status: 'waiting' },
    orderBy: 'joinedAt',
    orderDir: 'asc',
    limit: 200,
  })
  if (!waiting.success) return 0

  return waiting.data.records.filter((row) => {
    const data = row.data as Partial<Ticket>
    return typeof data.joinedAt === 'string' && data.joinedAt < joinedAt
  }).length
}

async function allocateTicketNumber(
  tools: ActionTools,
  businessId: string,
  queueDay: string,
): Promise<ActionResult<{ ticketNumber: number }>> {
  const id = counterRecordId(businessId, queueDay)
  const existing = await tools.get('queue_counters', id)

  if (existing.success) {
    const current = existing.data.record.data as { nextNumber?: number }
    const ticketNumber =
      typeof current.nextNumber === 'number' && current.nextNumber > 0 ? current.nextNumber : 1
    const bumped = await tools.update('queue_counters', id, { nextNumber: ticketNumber + 1 })
    if (!bumped.success) return bumped
    return { success: true, data: { ticketNumber } }
  }

  const created = await tools.create(
    'queue_counters',
    { businessId, queueDay, nextNumber: 2 },
    id,
  )
  if (!created.success) {
    // Concurrent first create — retry read path once.
    const retry = await tools.get('queue_counters', id)
    if (!retry.success) return created
    const current = retry.data.record.data as { nextNumber?: number }
    const ticketNumber =
      typeof current.nextNumber === 'number' && current.nextNumber > 0 ? current.nextNumber : 1
    const bumped = await tools.update('queue_counters', id, { nextNumber: ticketNumber + 1 })
    if (!bumped.success) return bumped
    return { success: true, data: { ticketNumber } }
  }

  return { success: true, data: { ticketNumber: 1 } }
}

async function writeTicketView(
  env: Env,
  accessToken: string,
  view: TicketView,
): Promise<ActionResult<{ recordId: string }>> {
  const tools = createRecordTools(env, ticketRoomId(accessToken), 'system:queue')
  return tools.create('ticket_views', { ...view }, 'current')
}

export async function refreshBusinessSnapshot(
  tools: ActionTools,
  business: Envelope<Business>,
): Promise<void> {
  const waiting = await tools.query('tickets', {
    where: { businessId: business.recordId, status: 'waiting' },
    limit: 500,
  })
  const serving = await tools.query('tickets', {
    where: { businessId: business.recordId, status: 'serving' },
    limit: 1,
  })

  const waitingCount = waiting.success ? waiting.data.records.length : 0
  const servingTicketNumber =
    serving.success && serving.data.records[0]
      ? Number((serving.data.records[0].data as Partial<Ticket>).ticketNumber ?? 0)
      : 0

  const estimatedWaitMinutes = estimateWaitMinutes(
    waitingCount,
    business.data.averageServiceMinutes,
  )

  await tools.create(
    'queue_snapshots',
    {
      businessId: business.recordId,
      waitingCount,
      servingTicketNumber,
      estimatedWaitMinutes,
      isOpen: business.data.isOpen,
    },
    snapshotRecordId(business.recordId),
  )
}

/**
 * Server-authoritative join. Ticket numbers use a counter record plus
 * uniqueOn(businessId, queueDay, ticketNumber). Concurrent joins may race on
 * the counter read/update; uniqueOn rejects duplicates and we retry.
 *
 * This is not a multi-statement SQL transaction — Durable Object request
 * interleaving across separate tools.* calls is possible. Retries keep numbers unique.
 */
export async function joinQueue(
  env: Env,
  slug: string,
  input: { customerName: string; phone?: string },
): Promise<ActionResult<JoinQueueResult>> {
  const tools = createRecordTools(env, appRoomName(env), 'system:queue')
  const found = await findBusinessBySlug(tools, slug)
  if (!found.success) return found

  const { business } = found.data
  if (!business.data.isOpen) {
    return { success: false, error: 'This business is not accepting customers right now' }
  }

  const customerName = input.customerName.trim().slice(0, 80)
  if (customerName.length < 1) {
    return { success: false, error: 'Name is required' }
  }

  const phone = (input.phone ?? '').trim().slice(0, 32)
  const queueDay = queueDayKey()
  const joinedAt = new Date().toISOString()

  for (let attempt = 0; attempt < 5; attempt++) {
    const allocated = await allocateTicketNumber(tools, business.recordId, queueDay)
    if (!allocated.success) return allocated

    const { ticketNumber } = allocated.data
    const accessToken = mintAccessToken()
    const accessTokenHash = await hashAccessToken(accessToken)

    const ticketCreate = await tools.create('tickets', {
      businessId: business.recordId,
      queueDay,
      ticketNumber,
      customerName,
      phone,
      status: 'waiting',
      joinedAt,
      calledAt: '',
      completedAt: '',
    })

    if (!ticketCreate.success) {
      const msg = ticketCreate.error ?? ''
      if (msg.toLowerCase().includes('duplicate') && attempt < 4) continue
      return ticketCreate
    }

    const ticketId = ticketCreate.data.recordId

    const secret = await tools.create(
      'ticket_secrets',
      {
        ticketId,
        businessId: business.recordId,
        accessToken,
        accessTokenHash,
      },
      `secret:${ticketId}`,
    )
    if (!secret.success) {
      await tools.remove('tickets', ticketId)
      return secret
    }

    await tools.create('queue_events', {
      businessId: business.recordId,
      ticketId,
      actorId: 'customer',
      action: 'joined',
    })

    const peopleAhead = await countWaitingAhead(tools, business.recordId, joinedAt)
    const estimated = estimateWaitMinutes(peopleAhead, business.data.averageServiceMinutes)

    const viewResult = await writeTicketView(env, accessToken, {
      businessId: business.recordId,
      businessName: business.data.name,
      ticketNumber,
      status: 'waiting',
      peopleAhead,
      estimatedWaitMinutes: estimated,
      customerName,
    })
    if (!viewResult.success) {
      // Ticket is still valid via HTTP lookup later; view room can be repaired on staff ops.
      console.warn('[queue] ticket_view write failed', viewResult.error)
    }

    await refreshBusinessSnapshot(tools, business)

    return {
      success: true,
      data: {
        ticketId,
        ticketNumber,
        accessToken,
        peopleAhead,
        estimatedWaitMinutes: estimated,
        status: 'waiting',
      },
    }
  }

  return { success: false, error: 'Could not allocate a unique ticket number. Try again.' }
}

/**
 * Resolve a customer ticket from a capability token. Returns only safe fields.
 * Never echoes the access token. Looks up by hash so the raw token is not
 * queried as plaintext across the collection.
 */
export async function getTicketByAccessToken(
  env: Env,
  accessToken: string,
): Promise<ActionResult<SafeTicketPayload>> {
  if (!accessToken || accessToken.length < 16 || accessToken.length > 200) {
    return { success: false, error: 'Invalid ticket token' }
  }

  const tools = createRecordTools(env, appRoomName(env), 'system:queue')
  const accessTokenHash = await hashAccessToken(accessToken)

  const secrets = await tools.query('ticket_secrets', {
    where: { accessTokenHash },
    limit: 1,
  })
  if (!secrets.success) return secrets
  const secretRow = secrets.data.records[0]
  if (!secretRow) return { success: false, error: 'Ticket not found' }

  const ticketId = secretRow.data.ticketId
  const businessId = secretRow.data.businessId
  if (typeof ticketId !== 'string' || typeof businessId !== 'string') {
    return { success: false, error: 'Ticket not found' }
  }

  // Constant-time-ish check: stored token must match (hash collision defense).
  const storedToken = secretRow.data.accessToken
  if (typeof storedToken !== 'string' || storedToken !== accessToken) {
    return { success: false, error: 'Ticket not found' }
  }

  const ticketResult = await tools.get('tickets', ticketId)
  if (!ticketResult.success) return { success: false, error: 'Ticket not found' }
  const ticketData = ticketResult.data.record.data as Partial<Ticket>
  if (
    typeof ticketData.ticketNumber !== 'number' ||
    typeof ticketData.customerName !== 'string' ||
    typeof ticketData.status !== 'string' ||
    typeof ticketData.joinedAt !== 'string'
  ) {
    return { success: false, error: 'Ticket not found' }
  }

  const businessResult = await tools.get('businesses', businessId)
  if (!businessResult.success) return { success: false, error: 'Ticket not found' }
  const business = asBusiness(businessResult.data.record.data)
  if (!business) return { success: false, error: 'Ticket not found' }

  let peopleAhead = 0
  if (ticketData.status === 'waiting') {
    peopleAhead = await countWaitingAhead(tools, businessId, ticketData.joinedAt)
  }

  return {
    success: true,
    data: {
      businessId,
      businessName: business.name,
      ticketNumber: ticketData.ticketNumber,
      status: ticketData.status as Ticket['status'],
      peopleAhead,
      estimatedWaitMinutes: estimateWaitMinutes(peopleAhead, business.averageServiceMinutes),
      customerName: ticketData.customerName,
      isOpen: business.isOpen,
    },
  }
}
