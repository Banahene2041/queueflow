import type { CollectionSchema } from 'deepspace/schema'

/**
 * Capability tokens for customer ticket URLs. Closed to every client role —
 * including app admins via the records WebSocket. Server actions bypass RBAC
 * and are the only readers/writers.
 */
export const ticketSecretsSchema: CollectionSchema = {
  name: 'ticket_secrets',
  columns: [
    { name: 'ticketId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'businessId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'accessToken', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'accessTokenHash', storage: 'text', interpretation: 'plain', required: true, immutable: true },
  ],
  uniqueOn: ['ticketId'],
  permissions: {
    '*': { read: false, create: false, update: false, delete: false },
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: false, create: false, update: false, delete: false },
    admin: { read: false, create: false, update: false, delete: false },
  },
}
