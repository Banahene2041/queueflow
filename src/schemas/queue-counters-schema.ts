import type { CollectionSchema } from 'deepspace/schema'

/**
 * Per-business, per-day ticket number counters. Server-only.
 * recordId convention: `counter:{businessId}:{queueDay}`
 */
export const queueCountersSchema: CollectionSchema = {
  name: 'queue_counters',
  columns: [
    { name: 'businessId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'queueDay', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'nextNumber', storage: 'number', interpretation: 'plain', required: true, default: 1 },
  ],
  uniqueOn: ['businessId', 'queueDay'],
  permissions: {
    '*': { read: false, create: false, update: false, delete: false },
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: false, create: false, update: false, delete: false },
    admin: { read: false, create: false, update: false, delete: false },
  },
}
