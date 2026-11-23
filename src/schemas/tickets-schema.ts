import type { CollectionSchema } from 'deepspace/schema'

/**
 * Private queue tickets. Client roles cannot create or mutate — all writes
 * go through server actions / public queue routes. Staff read via team
 * membership (`teamField: businessId` → `team_members`).
 *
 * Customer access tokens are NOT stored here (see `ticket_secrets`).
 */
export const ticketsSchema: CollectionSchema = {
  name: 'tickets',
  columns: [
    { name: 'businessId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'queueDay', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'ticketNumber', storage: 'number', interpretation: 'plain', required: true, immutable: true },
    { name: 'customerName', storage: 'text', interpretation: 'plain', required: true },
    { name: 'phone', storage: 'text', interpretation: 'plain', default: '' },
    {
      name: 'status',
      storage: 'text',
      interpretation: {
        kind: 'select',
        options: ['waiting', 'serving', 'completed', 'skipped', 'cancelled'],
      },
      required: true,
      default: 'waiting',
    },
    { name: 'joinedAt', storage: 'text', interpretation: { kind: 'datetime' }, required: true },
    { name: 'calledAt', storage: 'text', interpretation: { kind: 'datetime' }, default: '' },
    { name: 'completedAt', storage: 'text', interpretation: { kind: 'datetime' }, default: '' },
  ],
  uniqueOn: ['businessId', 'queueDay', 'ticketNumber'],
  teamField: 'businessId',
  permissions: {
    '*': { read: false, create: false, update: false, delete: false },
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: 'team', create: false, update: false, delete: false },
    admin: { read: true, create: false, update: false, delete: false },
  },
}
