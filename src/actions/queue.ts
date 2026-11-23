import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'
import {
  callNextTicketOp,
  cancelTicketOp,
  completeTicketOp,
  markServingOp,
  skipTicketOp,
} from '../server/queue-ops'
import { requireMembership } from '../server/queue-auth'
import type { MembershipRole } from '../types/queue'

async function requireBusinessAccess(
  tools: Parameters<ActionHandler<Env>>[0]['tools'],
  userId: string,
  params: Record<string, unknown>,
  roles: MembershipRole[],
) {
  const businessId = typeof params.businessId === 'string' ? params.businessId : ''
  if (!businessId) return { success: false as const, error: 'businessId is required' }
  return requireMembership(tools, userId, businessId, roles)
}

function requireTicketId(params: Record<string, unknown>) {
  const ticketId = typeof params.ticketId === 'string' ? params.ticketId : ''
  if (!ticketId) return { success: false as const, error: 'ticketId is required' }
  return { success: true as const, data: ticketId }
}

export const callNextTicket: ActionHandler<Env> = async ({
  userId,
  params,
  tools,
  env,
}) => {
  const access = await requireBusinessAccess(tools, userId, params, ['admin', 'staff'])
  if (!access.success) return access
  return callNextTicketOp(env, tools, userId, params.businessId as string)
}

export const completeTicket: ActionHandler<Env> = async ({
  userId,
  params,
  tools,
  env,
}) => {
  const access = await requireBusinessAccess(tools, userId, params, ['admin', 'staff'])
  if (!access.success) return access
  const ticketId = requireTicketId(params)
  if (!ticketId.success) return ticketId
  return completeTicketOp(env, tools, userId, params.businessId as string, ticketId.data)
}

export const skipTicket: ActionHandler<Env> = async ({ userId, params, tools, env }) => {
  const access = await requireBusinessAccess(tools, userId, params, ['admin', 'staff'])
  if (!access.success) return access
  const ticketId = requireTicketId(params)
  if (!ticketId.success) return ticketId
  return skipTicketOp(env, tools, userId, params.businessId as string, ticketId.data)
}

export const cancelTicket: ActionHandler<Env> = async ({
  userId,
  params,
  tools,
  env,
}) => {
  const access = await requireBusinessAccess(tools, userId, params, ['admin', 'staff'])
  if (!access.success) return access
  const ticketId = requireTicketId(params)
  if (!ticketId.success) return ticketId
  return cancelTicketOp(env, tools, userId, params.businessId as string, ticketId.data)
}

export const markServing: ActionHandler<Env> = async ({
  userId,
  params,
  tools,
  env,
}) => {
  const access = await requireBusinessAccess(tools, userId, params, ['admin', 'staff'])
  if (!access.success) return access
  const ticketId = requireTicketId(params)
  if (!ticketId.success) return ticketId
  return markServingOp(env, tools, userId, params.businessId as string, ticketId.data)
}
