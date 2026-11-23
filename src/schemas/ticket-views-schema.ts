import type { CollectionSchema } from 'deepspace/schema'

/**
 * Safe customer-facing ticket projection. Written only into per-token
 * RecordRooms (`ticket:{accessToken}`), never into the main app room.
 *
 * Anonymous read is intentional inside a capability-scoped room: knowing the
 * room id requires the unguessable access token.
 */
export const ticketViewsSchema: CollectionSchema = {
  name: 'ticket_views',
  columns: [
    { name: 'businessId', storage: 'text', interpretation: 'plain', required: true },
    { name: 'businessName', storage: 'text', interpretation: 'plain', required: true },
    { name: 'ticketNumber', storage: 'number', interpretation: 'plain', required: true },
    {
      name: 'status',
      storage: 'text',
      interpretation: {
        kind: 'select',
        options: ['waiting', 'serving', 'completed', 'skipped', 'cancelled'],
      },
      required: true,
    },
    { name: 'peopleAhead', storage: 'number', interpretation: 'plain', default: 0 },
    { name: 'estimatedWaitMinutes', storage: 'number', interpretation: 'plain', default: 0 },
    { name: 'customerName', storage: 'text', interpretation: 'plain', required: true },
  ],
  permissions: {
    '*': { read: true, create: false, update: false, delete: false },
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: false, update: false, delete: false },
  },
}
