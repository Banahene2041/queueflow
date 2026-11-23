import type { CollectionSchema } from 'deepspace/schema'

/**
 * Public business profiles. All columns are intentionally customer-visible
 * (name, address, open status, etc.). Privileged writes go through server
 * actions — clients cannot create or mutate businesses directly.
 */
export const businessesSchema: CollectionSchema = {
  name: 'businesses',
  columns: [
    { name: 'name', storage: 'text', interpretation: 'plain', required: true },
    { name: 'slug', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'description', storage: 'text', interpretation: 'plain', default: '' },
    { name: 'address', storage: 'text', interpretation: 'plain', default: '' },
    { name: 'logoKey', storage: 'text', interpretation: 'plain', default: '' },
    {
      name: 'isOpen',
      storage: 'number',
      interpretation: { kind: 'boolean' },
      default: true,
    },
    {
      name: 'averageServiceMinutes',
      storage: 'number',
      interpretation: 'plain',
      default: 30,
    },
  ],
  uniqueOn: ['slug'],
  permissions: {
    '*': { read: true, create: false, update: false, delete: false },
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: false, update: false, delete: false },
  },
}
