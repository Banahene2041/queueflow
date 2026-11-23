/**
 * Public (unauthenticated) queue HTTP surface.
 *
 * Authenticated staff mutations stay on /api/actions/*. Customers have no
 * account, so join + ticket lookup live here and talk to the RecordRoom with
 * X-App-Action after server-side validation.
 */

import type { Hono } from 'hono'
import type { AppContext, Env } from '../../worker.js'
import { appRoomName, createRecordTools } from './record-tools.js'
import { allowRequest } from './rate-limit.js'
import {
  buildPublicBusinessPayload,
  getTicketByAccessToken,
  joinQueue,
} from './queue-service.js'

function publicTools(env: Env) {
  return createRecordTools(env, appRoomName(env), 'system:queue')
}

export function registerQueueRoutes(app: Hono<AppContext>): void {
  app.get('/api/queue/health', (c) =>
    c.json({ success: true, data: { ok: true, service: 'queueflow-public-queue' } }),
  )

  app.get('/api/queue/businesses/:slug', async (c) => {
    const slug = c.req.param('slug')
    const result = await buildPublicBusinessPayload(publicTools(c.env), slug)
    if (!result.success) {
      const status = result.error === 'Business not found' ? 404 : 400
      return c.json(result, status)
    }
    return c.json(result)
  })

  app.post('/api/queue/businesses/:slug/join', async (c) => {
    const slug = c.req.param('slug')
    const ip =
      c.req.header('cf-connecting-ip') ??
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown'

    const limited = allowRequest(`join:${ip}:${slug}`, 8, 60_000)
    if (!limited.ok) {
      return c.json(
        { success: false, error: 'Too many join attempts. Please wait and try again.' },
        429,
        { 'Retry-After': String(limited.retryAfterSec) },
      )
    }

    let body: Record<string, unknown>
    try {
      body = await c.req.json<Record<string, unknown>>()
    } catch {
      return c.json({ success: false, error: 'Invalid JSON body' }, 400)
    }

    const customerName = typeof body.customerName === 'string' ? body.customerName : ''
    const phone = typeof body.phone === 'string' ? body.phone : ''

    const result = await joinQueue(c.env, slug, { customerName, phone })
    if (!result.success) {
      const status =
        result.error === 'Business not found'
          ? 404
          : result.error?.includes('not accepting')
            ? 403
            : 400
      return c.json(result, status)
    }

    // Do not log result.data.accessToken.
    return c.json({
      success: true,
      data: {
        ticketNumber: result.data.ticketNumber,
        accessToken: result.data.accessToken,
        peopleAhead: result.data.peopleAhead,
        estimatedWaitMinutes: result.data.estimatedWaitMinutes,
        status: result.data.status,
      },
    })
  })

  app.get('/api/queue/tickets/:accessToken', async (c) => {
    const token = c.req.param('accessToken')
    const result = await getTicketByAccessToken(c.env, token)
    if (!result.success) {
      const status = result.error === 'Ticket not found' ? 404 : 400
      return c.json(result, status)
    }
    // Never include the access token in the response body.
    return c.json({ success: true, data: result.data })
  })
}
