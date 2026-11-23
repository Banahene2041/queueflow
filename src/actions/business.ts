import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'
import { isValidSlug, normalizeSlug, snapshotRecordId } from '../lib/queue'
import type { Business, MembershipRole, MembershipStatus, TeamMember } from '../types/queue'

function asTeamMember(data: Record<string, unknown>): TeamMember | null {
  if (
    typeof data.teamId !== 'string' ||
    typeof data.userId !== 'string' ||
    (data.role !== 'admin' && data.role !== 'staff') ||
    (data.status !== 'active' && data.status !== 'inactive')
  ) {
    return null
  }
  return {
    teamId: data.teamId,
    userId: data.userId,
    role: data.role as MembershipRole,
    status: data.status as MembershipStatus,
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

/**
 * Create the caller's business (first time) or return their existing admin
 * membership business. One salon per owner for the assessment scope.
 */
export const ensureBusiness: ActionHandler<Env> = async ({ userId, params, tools }) => {
  if (!userId) return { success: false, error: 'Unauthorized' }

  const name = typeof params.name === 'string' ? params.name.trim().slice(0, 80) : ''
  if (!name) return { success: false, error: 'Business name is required' }

  const requestedSlug =
    typeof params.slug === 'string' && params.slug.trim()
      ? normalizeSlug(params.slug)
      : normalizeSlug(name)

  if (!isValidSlug(requestedSlug)) {
    return {
      success: false,
      error: 'Slug must be 2–64 characters of lowercase letters, numbers, and hyphens',
    }
  }

  const description =
    typeof params.description === 'string' ? params.description.trim().slice(0, 500) : ''
  const address = typeof params.address === 'string' ? params.address.trim().slice(0, 200) : ''
  const averageServiceMinutes =
    typeof params.averageServiceMinutes === 'number' && params.averageServiceMinutes > 0
      ? Math.min(180, Math.round(params.averageServiceMinutes))
      : 30
  const isOpen = params.isOpen === false ? false : true

  const existingMembership = await tools.query('team_members', {
    where: { userId, status: 'active' },
    limit: 20,
  })
  if (!existingMembership.success) return existingMembership

  const adminRow = existingMembership.data.records.find((row) => {
    const member = asTeamMember(row.data)
    return member?.role === 'admin'
  })

  if (adminRow) {
    const member = asTeamMember(adminRow.data)
    if (!member) return { success: false, error: 'Invalid membership record' }
    const businessId = member.teamId
    const business = await tools.get('businesses', businessId)
    if (!business.success) return business

    const existing = asBusiness(business.data.record.data)
    if (!existing) return { success: false, error: 'Invalid business record' }

    const patch: Partial<Business> = {
      name,
      description,
      address,
      averageServiceMinutes,
      isOpen,
    }
    const updated = await tools.update('businesses', businessId, patch)
    if (!updated.success) return updated

    const snapId = snapshotRecordId(businessId)
    const snap = await tools.get('queue_snapshots', snapId)
    if (snap.success) {
      await tools.update('queue_snapshots', snapId, { isOpen })
    } else {
      await tools.create(
        'queue_snapshots',
        {
          businessId,
          waitingCount: 0,
          servingTicketNumber: 0,
          estimatedWaitMinutes: 0,
          isOpen,
        },
        snapId,
      )
    }

    return {
      success: true,
      data: {
        businessId,
        slug: existing.slug,
        created: false,
      },
    }
  }

  let slug = requestedSlug
  for (let i = 0; i < 5; i++) {
    const clash = await tools.query('businesses', { where: { slug }, limit: 1 })
    if (!clash.success) return clash
    if (clash.data.records.length === 0) break
    slug = `${requestedSlug}-${Math.floor(Math.random() * 900 + 100)}`
  }

  if (!isValidSlug(slug)) {
    return { success: false, error: 'Could not allocate a unique slug' }
  }

  const created = await tools.create('businesses', {
    name,
    slug,
    description,
    address,
    logoKey: '',
    isOpen,
    averageServiceMinutes,
  })
  if (!created.success) return created

  const businessId = created.data.recordId

  const membership = await tools.create('team_members', {
    teamId: businessId,
    userId,
    role: 'admin',
    status: 'active',
  })
  if (!membership.success) {
    await tools.remove('businesses', businessId)
    return membership
  }

  await tools.create(
    'queue_snapshots',
    {
      businessId,
      waitingCount: 0,
      servingTicketNumber: 0,
      estimatedWaitMinutes: 0,
      isOpen,
    },
    snapshotRecordId(businessId),
  )

  return {
    success: true,
    data: {
      businessId,
      slug,
      created: true,
    },
  }
}

export const updateBusinessSettings: ActionHandler<Env> = async ({
  userId,
  params,
  tools,
}) => {
  const businessId = typeof params.businessId === 'string' ? params.businessId : ''
  if (!businessId) return { success: false, error: 'businessId is required' }

  const membership = await tools.query('team_members', {
    where: { teamId: businessId, userId, status: 'active' },
    limit: 1,
  })
  if (!membership.success) return membership
  const row = membership.data.records[0]
  const member = row ? asTeamMember(row.data) : null
  if (!member || member.role !== 'admin') {
    return { success: false, error: 'Forbidden: admin role required' }
  }

  const patch: Record<string, unknown> = {}
  if (typeof params.name === 'string' && params.name.trim()) {
    patch.name = params.name.trim().slice(0, 80)
  }
  if (typeof params.description === 'string') {
    patch.description = params.description.trim().slice(0, 500)
  }
  if (typeof params.address === 'string') {
    patch.address = params.address.trim().slice(0, 200)
  }
  if (typeof params.averageServiceMinutes === 'number' && params.averageServiceMinutes > 0) {
    patch.averageServiceMinutes = Math.min(180, Math.round(params.averageServiceMinutes))
  }
  if (typeof params.isOpen === 'boolean') {
    patch.isOpen = params.isOpen
  }
  if (typeof params.logoKey === 'string') {
    patch.logoKey = params.logoKey
  }

  if (Object.keys(patch).length === 0) {
    return { success: false, error: 'No settings to update' }
  }

  const updated = await tools.update('businesses', businessId, patch)
  if (!updated.success) return updated

  if (typeof patch.isOpen === 'boolean') {
    const snap = await tools.get('queue_snapshots', snapshotRecordId(businessId))
    if (snap.success) {
      await tools.update('queue_snapshots', snapshotRecordId(businessId), {
        isOpen: patch.isOpen,
      })
    } else {
      await tools.create(
        'queue_snapshots',
        {
          businessId,
          waitingCount: 0,
          servingTicketNumber: 0,
          estimatedWaitMinutes: 0,
          isOpen: patch.isOpen,
        },
        snapshotRecordId(businessId),
      )
    }
  }

  return { success: true, data: { businessId } }
}

/** Resolve the signed-in user's primary business (admin membership preferred). */
export const getMyBusiness: ActionHandler<Env> = async ({ userId, tools }) => {
  if (!userId) return { success: false, error: 'Unauthorized' }

  const memberships = await tools.query('team_members', {
    where: { userId, status: 'active' },
    limit: 20,
  })
  if (!memberships.success) return memberships

  const parsed = memberships.data.records
    .map((row) => {
      const data = asTeamMember(row.data)
      return data ? { recordId: row.recordId, data } : null
    })
    .filter((row): row is { recordId: string; data: TeamMember } => row !== null)

  if (parsed.length === 0) {
    return { success: true, data: { business: null, membership: null } }
  }

  const preferred = parsed.find((r) => r.data.role === 'admin') ?? parsed[0]

  const business = await tools.get('businesses', preferred.data.teamId)
  if (!business.success) return business

  const biz = asBusiness(business.data.record.data)
  if (!biz) return { success: false, error: 'Invalid business record' }

  return {
    success: true,
    data: {
      business: {
        id: business.data.record.recordId,
        ...biz,
      },
      membership: {
        id: preferred.recordId,
        ...preferred.data,
      },
    },
  }
}
