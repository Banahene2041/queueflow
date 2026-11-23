import type { CollectionSchema } from 'deepspace/schema'

/**
 * Public aggregate queue state. Safe for anonymous read — never includes
 * customer names, phones, or access tokens.
 *
 * recordId convention (server-enforced): `snapshot:{businessId}`
 */
export const queueSnapshotsSchema: CollectionSchema = {
  name: 'queue_snapshots',
  columns: [
    { name: 'businessId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'waitingCount', storage: 'number', interpretation: 'plain', default: 0 },
    { name: 'servingTicketNumber', storage: 'number', interpretation: 'plain', default: 0 },
    { name: 'estimatedWaitMinutes', storage: 'number', interpretation: 'plain', default: 0 },
    { name: 'isOpen', storage: 'number', interpretation: { kind: 'boolean' }, default: true },
  ],
  uniqueOn: ['businessId'],
  permissions: {
    '*': { read: true, create: false, update: false, delete: false },
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: false, update: false, delete: false },
  },
}
