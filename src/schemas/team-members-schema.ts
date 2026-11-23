import type { CollectionSchema } from 'deepspace/schema'

/**
 * Business membership. Collection name MUST be `team_members` so DeepSpace
 * `team` permission rules resolve against it (teamId + userId + status).
 *
 * `role` is QueueFlow's business-level role (admin | staff), separate from
 * the app-level DeepSpace room role (viewer | member | admin).
 */
export const teamMembersSchema: CollectionSchema = {
  name: 'team_members',
  columns: [
    { name: 'teamId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    {
      name: 'userId',
      storage: 'text',
      interpretation: 'plain',
      required: true,
      immutable: true,
    },
    {
      name: 'role',
      storage: 'text',
      interpretation: { kind: 'select', options: ['admin', 'staff'] },
      required: true,
      default: 'staff',
    },
    {
      name: 'status',
      storage: 'text',
      interpretation: { kind: 'select', options: ['active', 'inactive'] },
      required: true,
      default: 'active',
    },
  ],
  uniqueOn: ['teamId', 'userId'],
  ownerField: 'userId',
  permissions: {
    '*': { read: false, create: false, update: false, delete: false },
    viewer: { read: false, create: false, update: false, delete: false },
    // Members can see their own membership rows; team-scoped collections use
    // this table for authorization. Mutations are server-action only.
    member: { read: 'own', create: false, update: false, delete: false },
    admin: { read: true, create: false, update: false, delete: false },
  },
}
