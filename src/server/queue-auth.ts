import type { ActionResult, ActionTools } from 'deepspace/worker'
import type { MembershipRole, TeamMember } from '../types/queue'

type Envelope<T> = {
  recordId: string
  data: T
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

/**
 * Load an active membership for a user in a business. Used by staff actions
 * before any privileged queue mutation.
 */
export async function requireMembership(
  tools: ActionTools,
  userId: string,
  businessId: string,
  roles?: MembershipRole[],
): Promise<ActionResult<{ membership: Envelope<TeamMember> }>> {
  const result = await tools.query('team_members', {
    where: { teamId: businessId, userId, status: 'active' },
    limit: 1,
  })

  if (!result.success) return result

  const records = result.data.records
  const row = records[0]
  if (!row) {
    return { success: false, error: 'Forbidden: not a member of this business' }
  }

  const data = row.data as Partial<TeamMember>
  if (
    typeof data.teamId !== 'string' ||
    typeof data.userId !== 'string' ||
    (data.role !== 'admin' && data.role !== 'staff') ||
    (data.status !== 'active' && data.status !== 'inactive')
  ) {
    return { success: false, error: 'Forbidden: invalid membership record' }
  }

  const membership: Envelope<TeamMember> = {
    recordId: row.recordId,
    data: {
      teamId: data.teamId,
      userId: data.userId,
      role: data.role,
      status: data.status,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
  }

  if (roles && !roles.includes(membership.data.role)) {
    return { success: false, error: 'Forbidden: insufficient role' }
  }

  return { success: true, data: { membership } }
}
