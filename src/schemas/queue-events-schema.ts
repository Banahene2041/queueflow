import type { CollectionSchema } from 'deepspace/schema'

/**
 * Append-only queue activity. Created only by server code; staff read via team.
 */
export const queueEventsSchema: CollectionSchema = {
  name: 'queue_events',
  columns: [
    { name: 'businessId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'ticketId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'actorId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    {
      name: 'action',
      storage: 'text',
      interpretation: {
        kind: 'select',
        options: ['joined', 'called', 'serving', 'completed', 'skipped', 'cancelled'],
      },
      required: true,
      immutable: true,
    },
  ],
  teamField: 'businessId',
  permissions: {
    '*': { read: false, create: false, update: false, delete: false },
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: 'team', create: false, update: false, delete: false },
    admin: { read: true, create: false, update: false, delete: false },
  },
}
