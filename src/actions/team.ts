import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'
import { requireMembership } from '../server/queue-auth'
import type { MembershipRole, TeamMember } from '../types/queue'

function parseRole(value: unknown): MembershipRole | null {
  return value === 'admin' || value === 'staff' ? value : null
}

export const inviteStaff: ActionHandler<Env> = async ({ userId, params, tools }) => {
  const businessId = typeof params.businessId === 'string' ? params.businessId : ''
  const targetUserId = typeof params.targetUserId === 'string' ? params.targetUserId.trim() : ''
  const role = parseRole(params.role) ?? 'staff'

  if (!businessId) return { success: false, error: 'businessId is required' }
  if (!targetUserId || targetUserId.length < 3) {
    return { success: false, error: 'targetUserId is required' }
  }
  if (targetUserId === userId) {
    return { success: false, error: 'You are already a member' }
  }

  const access = await requireMembership(tools, userId, businessId, ['admin'])
  if (!access.success) return access

  const existing = await tools.query('team_members', {
    where: { teamId: businessId, userId: targetUserId },
    limit: 1,
  })
  if (!existing.success) return existing

  if (existing.data.records[0]) {
    const updated = await tools.update('team_members', existing.data.records[0].recordId, {
      role,
      status: 'active',
    })
    if (!updated.success) return updated
    return {
      success: true,
      data: { membershipId: existing.data.records[0].recordId, created: false },
    }
  }

  const created = await tools.create('team_members', {
    teamId: businessId,
    userId: targetUserId,
    role,
    status: 'active',
  })
  if (!created.success) return created
  return { success: true, data: { membershipId: created.data.recordId, created: true } }
}

export const updateStaffRole: ActionHandler<Env> = async ({ userId, params, tools }) => {
  const businessId = typeof params.businessId === 'string' ? params.businessId : ''
  const membershipId = typeof params.membershipId === 'string' ? params.membershipId : ''
  const role = parseRole(params.role)
  if (!businessId) return { success: false, error: 'businessId is required' }
  if (!membershipId) return { success: false, error: 'membershipId is required' }
  if (!role) return { success: false, error: 'role must be admin or staff' }

  const access = await requireMembership(tools, userId, businessId, ['admin'])
  if (!access.success) return access

  const row = await tools.get('team_members', membershipId)
  if (!row.success) return row
  const member = row.data.record.data as Partial<TeamMember>
  if (member.teamId !== businessId) {
    return { success: false, error: 'Forbidden: membership belongs to another business' }
  }
  if (member.userId === userId && role !== 'admin') {
    return { success: false, error: 'You cannot demote yourself' }
  }

  const updated = await tools.update('team_members', membershipId, { role })
  if (!updated.success) return updated
  return { success: true, data: { membershipId } }
}

export const removeStaff: ActionHandler<Env> = async ({ userId, params, tools }) => {
  const businessId = typeof params.businessId === 'string' ? params.businessId : ''
  const membershipId = typeof params.membershipId === 'string' ? params.membershipId : ''
  if (!businessId) return { success: false, error: 'businessId is required' }
  if (!membershipId) return { success: false, error: 'membershipId is required' }

  const access = await requireMembership(tools, userId, businessId, ['admin'])
  if (!access.success) return access

  const row = await tools.get('team_members', membershipId)
  if (!row.success) return row
  const member = row.data.record.data as Partial<TeamMember>
  if (member.teamId !== businessId) {
    return { success: false, error: 'Forbidden: membership belongs to another business' }
  }
  if (member.userId === userId) {
    return { success: false, error: 'You cannot remove yourself' }
  }

  const updated = await tools.update('team_members', membershipId, { status: 'inactive' })
  if (!updated.success) return updated
  return { success: true, data: { membershipId } }
}
